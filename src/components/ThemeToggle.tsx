import { useState, useEffect } from "react";
import { Moon, Sun, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { signOut } from "../lib/api";
import { toast } from "sonner";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.reload();
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsDark(!isDark)}
        className="rounded-full"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={handleSignOut}
        className="rounded-full text-muted-foreground hover:text-foreground"
        title="Sign Out"
      >
        <LogOut className="h-4 w-4" />
        <span className="sr-only">Sign Out</span>
      </Button>
    </div>
  );
}