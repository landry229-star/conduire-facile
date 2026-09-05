import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ensurePrivateAccess } from "@/lib/access-control";
import { hasAnyRole } from "@/lib/user-role";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
    ssr: false,
    beforeLoad: async ({ location }) => {
        const user = await ensurePrivateAccess(location.pathname);
        return { user };
    },
    component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
    const [isStaff, setIsStaff] = useState(false);

    useEffect(() => {
        (async () => {
            const { data: u } = await supabase.auth.getUser();
            if (!u.user) return;
            setIsStaff(await hasAnyRole(u.user.id, ["admin", "moniteur"]));
        })();
    }, []);

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-slate-50">
                <AppSidebar isStaff={isStaff} />
                <div className="flex-1 flex flex-col min-w-0">
                    <header className="h-12 flex items-center gap-2 border-b bg-white px-3 sticky top-0 z-10">
                        <SidebarTrigger />
                        <span className="text-sm font-medium text-slate-700">Espace membre</span>
                    </header>
                    <main className="flex-1 overflow-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
