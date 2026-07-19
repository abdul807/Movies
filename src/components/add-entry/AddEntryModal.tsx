import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { AddEntryForm } from "./AddEntryForm";

interface AddEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddEntryModal({ open, onOpenChange }: AddEntryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[95vh] p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-0">
          <DialogTitle className="text-xl sm:text-2xl font-light tracking-tight">
            Add to Watch Log
          </DialogTitle>
        </DialogHeader>
        <div className="px-4 sm:px-6 py-4 overflow-y-auto max-h-[calc(95vh-80px)]">
          <AddEntryForm onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}