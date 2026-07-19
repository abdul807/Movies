import { motion } from "framer-motion";
import { Film, Tv, Star, Hash } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalMovies: number;
    totalSeries: number;
    favoriteGenre: string | null;
    averageRating: number | null;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const items = [
    { icon: Film, label: "Movies", value: stats?.totalMovies || 0 },
    { icon: Tv, label: "Series", value: stats?.totalSeries || 0 },
    { icon: Hash, label: "Favorite Genre", value: stats?.favoriteGenre || "—" },
    { icon: Star, label: "Avg Rating", value: stats?.averageRating ? `${stats.averageRating}/10` : "—" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-secondary/30 rounded-2xl p-5 border border-border/50"
        >
          <div className="flex items-center gap-2 mb-2">
            <item.icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {item.label}
            </span>
          </div>
          <div className="text-2xl font-light tracking-tight">{item.value}</div>
        </motion.div>
      ))}
    </div>
  );
}