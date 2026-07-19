import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { DashboardStats } from "../components/dashboard/DashboardStats";
import { Library } from "../components/library/Library";
import { LibraryEmptyState } from "../components/library/LibraryEmptyState";
import { QuickAddButton } from "../components/QuickAddButton";
import { SearchBar } from "../components/search/SearchBar";
import { Filters } from "../components/filters/Filters";
import { Skeleton } from "../components/ui/skeleton";
import { ThemeToggle } from "../components/ThemeToggle";
import { getEntries, getStats } from "../lib/api";
import { useUser, getDisplayName } from "../hooks/useUser";

export function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ 
    type: undefined as string | undefined, 
    genre: undefined as string | undefined, 
    status: undefined as string | undefined 
  });

  const { user, loading: userLoading } = useUser();
  const displayName = getDisplayName(user?.email);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
  });

  const { data: entries, isLoading: entriesLoading } = useQuery({
    queryKey: ["entries", filters, searchQuery],
    queryFn: getEntries,
  });

  const filtered = entries?.filter((e: any) => {
    if (searchQuery && !e.title.toLowerCase().includes(searchQuery.toLowerCase()) && !e.genre?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filters.type && e.type !== filters.type) return false;
    if (filters.genre && e.genre !== filters.genre) return false;
    if (filters.status && e.status !== filters.status) return false;
    return true;
  }) || [];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <motion.h1 
              className="text-4xl font-light tracking-tight mb-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              Watch Log
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2"
            >
              <p className="text-muted-foreground text-sm">Your personal entertainment archive</p>
              <span className="text-muted-foreground text-sm">•</span>
              <p className="text-primary text-sm font-medium">
                Welcome back, {displayName} 👋
              </p>
            </motion.div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <QuickAddButton />
          </div>
        </motion.div>

        {/* Stats */}
        {statsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <DashboardStats stats={stats} />
        )}

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <Filters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Library */}
        {entriesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <LibraryEmptyState />
        ) : (
          <Library entries={filtered} />
        )}
      </div>
    </main>
  );
}