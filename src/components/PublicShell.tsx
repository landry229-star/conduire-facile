import { Link } from "@tanstack/react-router";
import { ClipboardCheck, Signpost } from "lucide-react";
import { AuthNavButton } from "@/components/AuthNavButton";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory text-charcoal">
      <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-charcoal/5 bg-ivory/90 px-5 py-4 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-sm bg-benin-green">
            <span className="block size-2 rounded-full bg-benin-yellow" />
          </span>
          <span className="text-sm font-semibold uppercase tracking-tight">L'Excellence</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/panneaux"
            className="hidden sm:inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-benin-red ring-1 ring-benin-red/30 transition-colors hover:bg-benin-red/5"
          >
            <Signpost className="size-3" /> Panneaux
          </Link>
          <Link
            to="/quiz"
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-benin-green ring-1 ring-benin-green/30 transition-colors hover:bg-benin-green/5"
          >
            <ClipboardCheck className="size-3" /> Quiz
          </Link>
          <Link
            to="/contact"
            className="inline-flex rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-charcoal/10 transition-colors hover:bg-white"
          >
            Contact
          </Link>
          <AuthNavButton />
        </div>
      </nav>

      {children}

      <PublicFooter />
    </div>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-charcoal/5 bg-zinc-50 px-5 py-10">
      <div className="mb-6 flex items-center gap-2">
        <span className="size-4 bg-benin-green" />
        <span className="size-4 bg-benin-yellow" />
        <span className="size-4 bg-benin-red" />
      </div>
      <nav className="mb-6 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-medium">
        <Link to="/a-propos" className="hover:text-benin-green">À propos</Link>
        <Link to="/contact" className="hover:text-benin-green">Contact & agences</Link>
        <Link to="/theorie" className="hover:text-benin-green">Cours de code</Link>
        <Link to="/examen" className="hover:text-benin-green">Examen blanc</Link>
        <Link to="/mentions-legales" className="hover:text-benin-green">Mentions légales</Link>
        <Link to="/confidentialite" className="hover:text-benin-green">Confidentialité</Link>
      </nav>
      <p className="text-[11px] leading-relaxed text-charcoal/50">
        © {new Date().getFullYear()} L'Excellence Auto-École. Agrément Ministériel N°2024/MT-042.
        <br />
        Cotonou, République du Bénin · +229 90 00 00 00
      </p>
    </footer>
  );
}
