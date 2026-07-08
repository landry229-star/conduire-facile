import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "lucide-react";

export function AuthNavButton({ className }: { className?: string }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (signedIn === null) return null;
  return (
    <Link
      to={signedIn ? "/dashboard" : "/auth"}
      className={className ?? "inline-flex items-center gap-1 rounded-full bg-charcoal px-3 py-1.5 text-xs font-medium text-white ring-1 ring-charcoal transition-colors hover:bg-charcoal/90"}
    >
      <User className="size-3" /> {signedIn ? "Mon espace" : "Connexion"}
    </Link>
  );
}
