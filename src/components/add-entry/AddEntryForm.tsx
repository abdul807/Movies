import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";
import { X, Upload } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { addEntry } from "../../lib/api";

const genres = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
  "Drama", "Family", "Fantasy", "Horror", "Musical", "Mystery",
  "Romance", "Sci-Fi", "Thriller", "War", "Western"
];

const statuses = [
  { value: "COMPLETED", label: "Completed" },
  { value: "WATCHING", label: "Watching" },
  { value: "PLAN_TO_WATCH", label: "Plan to Watch" },
  { value: "DROPPED", label: "Dropped" },
];

const entrySchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["MOVIE", "SERIES"]),
  status: z.enum(["COMPLETED", "WATCHING", "PLAN_TO_WATCH", "DROPPED"]),
  rating: z.number().min(1).max(10).optional().nullable(),
  genre: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

type EntryInput = z.infer<typeof entrySchema>;

interface AddEntryFormProps {
  onSuccess?: () => void;
}

export function AddEntryForm({ onSuccess }: AddEntryFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EntryInput>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      type: "MOVIE",
      status: "COMPLETED",
    },
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: EntryInput) => {
      const result = await addEntry(data, imageFile || undefined);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['genres'] });
      toast.success('Added to your watch log! 🎬');
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: EntryInput) => {
    mutation.mutate(data);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImagePreview(event.target?.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-h-[80vh] overflow-y-auto px-1"
    >
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Enter title..."
          className="bg-background border-border/50"
          autoFocus
        />
        <AnimatePresence>
          {errors.title && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-destructive mt-1"
            >
              {errors.title.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Type & Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={watch('type')}
            onValueChange={(value: any) => setValue('type', value)}
          >
            <SelectTrigger className="bg-background border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border-border shadow-lg">
              <SelectItem value="MOVIE">🎬 Movie</SelectItem>
              <SelectItem value="SERIES">📺 Series</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={watch('status')}
            onValueChange={(value: any) => setValue('status', value)}
          >
            <SelectTrigger className="bg-background border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border-border shadow-lg">
              {statuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Rating & Genre */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rating">Rating (1-10)</Label>
          <Input
            id="rating"
            type="number"
            min={1}
            max={10}
            {...register('rating', { valueAsNumber: true })}
            placeholder="Rate..."
            className="bg-background border-border/50"
          />
        </div>

        <div className="space-y-2">
          <Label>Genre</Label>
          <Select
            value={watch('genre') || undefined}
            onValueChange={(value) => setValue('genre', value)}
          >
            <SelectTrigger className="bg-background border-border/50">
              <SelectValue placeholder="Select genre" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border shadow-lg max-h-[200px] overflow-y-auto">
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre} className="hover:bg-secondary/50">
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Image Upload - Smaller on Mobile */}
      <div className="space-y-2">
        <Label>Poster Image</Label>
        
        {!imagePreview ? (
          <div
            className="relative border-2 border-dashed border-border hover:border-primary rounded-lg p-6 transition-colors cursor-pointer bg-background"
            onClick={() => document.getElementById('image-upload')?.click()}
          >
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-6 h-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Tap to upload poster</span>
              <span className="text-xs text-muted-foreground">JPG, PNG, GIF up to 10MB</span>
            </div>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-[2/3] max-w-[150px] rounded-lg overflow-hidden bg-secondary/30 border border-border mx-auto"
          >
            <img
              src={imagePreview}
              alt="Poster preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input
          id="notes"
          {...register('notes')}
          placeholder="Your personal notes..."
          className="bg-background border-border/50"
        />
      </div>

      {/* Actions - Sticky on Mobile */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm pt-4 pb-2 border-t border-border -mx-6 px-6">
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onSuccess}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Adding...
              </span>
            ) : (
              'Add to Watch Log'
            )}
          </Button>
        </div>
      </div>
    </motion.form>
  );
}