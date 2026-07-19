import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { Dashboard } from "./pages/Dashboard";
import { AuthGuard } from "./components/auth/AuthGuard";
import { WelcomeAnimation } from "./components/WelcomeAnimation";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useState } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthGuard>
          {!showDashboard ? (
            <WelcomeAnimation onComplete={() => setShowDashboard(true)} />
          ) : (
            <Dashboard />
          )}
        </AuthGuard>
        <Toaster position="bottom-right" richColors />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;