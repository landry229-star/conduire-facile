import { supabase } from "@/integrations/supabase/client";

const PROFILE_CACHE_KEY = "app:profile-cache";

function setProfileCache(payload: Record<string, unknown>) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(payload));
}

export async function ensureUserProfile(input?: {
    id?: string;
    email?: string | null;
    full_name?: string | null;
    phone?: string | null;
    category?: string | null;
}) {
    const { data: userData } = await supabase.auth.getUser();
    const userId = input?.id ?? userData?.user?.id;
    if (!userId) return null;

    const existingStatusResponse = await supabase
        .from("profiles")
        .select("account_status")
        .eq("id", userId)
        .maybeSingle();
    if (existingStatusResponse.error) throw existingStatusResponse.error;

    const payload = {
        id: userId,
        full_name: (input?.full_name ?? userData?.user?.user_metadata?.full_name ?? "") || null,
        phone: input?.phone ?? userData?.user?.phone ?? null,
        category: input?.category ?? null,
        avatar_url: userData?.user?.user_metadata?.avatar_url ?? null,
        account_status: existingStatusResponse.data?.account_status ?? "pending",
        updated_at: new Date().toISOString(),
    };

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "id" })
        .select()
        .single();

    if (profileError) throw profileError;

    const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .limit(1);
    if (rolesError) throw rolesError;

    if (!roles || roles.length === 0) {
        const { error: roleError } = await supabase.from("user_roles").insert({
            user_id: userId,
            role: "eleve",
        });

        if (roleError) throw roleError;
    }

    setProfileCache(payload);
    return profile;
}
