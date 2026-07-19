import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { motion } from "framer-motion";

interface AuthProps {
  onSuccess?: () => void;
}

export function Auth({ onSuccess }: AuthProps) {
  const [view, setView] = useState<'sign_in' | 'sign_up'>('sign_in');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          onSuccess?.();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [onSuccess]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light tracking-tight mb-2 text-foreground">Watch Log</h1>
          <p className="text-muted-foreground text-sm">
            {view === 'sign_in' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        <div className="bg-secondary/30 rounded-2xl p-6 border border-border/50">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#000000',
                    brandAccent: '#000000',
                    brandButtonText: '#FFFFFF',
                    defaultButtonBackground: '#E5E5E5',
                    defaultButtonText: '#000000',
                    inputBackground: '#FFFFFF',
                    inputText: '#000000',
                    inputBorder: '#D1D5DB',
                    inputBorderFocus: '#000000',
                    inputBorderHover: '#000000',
                  },
                  space: {
                    inputPadding: '12px',
                    buttonPadding: '12px',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '8px',
                    inputBorderRadius: '8px',
                  },
                },
                // Dark mode overrides
                dark: {
                  colors: {
                    brand: '#FFFFFF',
                    brandAccent: '#FFFFFF',
                    brandButtonText: '#000000',
                    defaultButtonBackground: '#1A1A1A',
                    defaultButtonText: '#FFFFFF',
                    inputBackground: '#1A1A1A',
                    inputText: '#FFFFFF',
                    inputBorder: '#333333',
                    inputBorderFocus: '#FFFFFF',
                    inputBorderHover: '#FFFFFF',
                  },
                },
              },
              localization: {
                variables: {
                  sign_in: {
                    email_label: 'Email',
                    password_label: 'Password',
                    button_label: 'Sign In',
                    loading_button_label: 'Signing in...',
                    link_text: "Don't have an account? Sign Up",
                  },
                  sign_up: {
                    email_label: 'Email',
                    password_label: 'Password',
                    button_label: 'Create Account',
                    loading_button_label: 'Creating account...',
                    link_text: 'Already have an account? Sign In',
                  },
                },
              },
              providers: [],
            }}
            redirectTo={window.location.origin}
            view={view}
            onViewChange={(newView) => setView(newView as 'sign_in' | 'sign_up')}
          />
        </div>
      </motion.div>
    </div>
  );
}