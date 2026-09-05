import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { hasAnyRole, type AppRole } from "@/lib/user-role";

export type AccountApprovalStatus = "approved" | "pending" | "rejected" | "unknown";

const APPROVAL_STORAGE_KEY = "app:account-status";

export function normalizeApprovalStatus(value: string | null | undefined): AccountApprovalStatus {
    const normalized = (value ?? "").toLowerCase();
    if (["approved", "active", "enabled", "accepted"].includes(normalized)) return "approved";
    if (["pending", "waiting", "in_review"].includes(normalized)) return "pending";
    if (["rejected", "denied", "disabled"].includes(normalized)) return "rejected";
    return "unknown";
}

export function getStoredApprovalStatus(): AccountApprovalStatus {
    if (typeof window === "undefined") return "unknown";

    try {
        const value = window.localStorage.getItem(APPROVAL_STORAGE_KEY);
        return normalizeApprovalStatus(value);
    } catch {
        return "unknown";
    }
}

export function setStoredApprovalStatus(status: AccountApprovalStatus) {
    if (typeof window === "undefined") return;
    if (status === "unknown") {
        window.localStorage.removeItem(APPROVAL_STORAGE_KEY);
        return;
    }
    window.localStorage.setItem(APPROVAL_STORAGE_KEY, status);
}

export async function getProfileApprovalStatus(userId?: string): Promise<AccountApprovalStatus> {
    if (!userId) return "unknown";

    const { data } = await supabase
        .from("profiles")
        .select("account_status")
        .eq("id", userId)
        .maybeSingle();

    const status = data?.account_status ?? "unknown";
    const normalized = normalizeApprovalStatus(status);
    if (normalized !== "unknown") {
        setStoredApprovalStatus(normalized);
    }
    return normalized;
}

export function userIsApproved(
    user: { user_metadata?: Record<string, unknown> } | null | undefined,
) {
    if (!user) return false;

    const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
    const statusValue =
        (metadata.account_status as string | undefined) ??
        (metadata.status as string | undefined) ??
        (metadata.registration_status as string | undefined) ??
        (metadata.approval_status as string | undefined);

    const approvedFlags = [metadata.approved, metadata.is_approved, metadata.account_approved];
    if (approvedFlags.some((flag) => flag === true)) return true;
    if (statusValue) {
        const normalized = normalizeApprovalStatus(statusValue);
        if (normalized === "approved") return true;
        if (normalized === "pending" || normalized === "rejected") return false;
    }

    const stored = getStoredApprovalStatus();
    return stored === "approved";
}

export async function ensurePrivateAccess(locationPathname?: string) {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
    const pathname = locationPathname ?? "/";

    if (!session) {
        throw redirect({
            to: "/auth",
            search: { redirect: pathname },
        });
    }

    const approvalStatus = await getProfileApprovalStatus(session.user.id);

    if (approvalStatus !== "approved") {
        setStoredApprovalStatus(approvalStatus === "unknown" ? "pending" : approvalStatus);
        throw redirect({
            to: "/auth",
            search: { redirect: pathname },
        });
    }

    setStoredApprovalStatus("approved");
    return session.user;
}

export async function ensureStaffAccess(
    locationPathname?: string,
    allowedRoles: AppRole[] = ["admin", "moniteur"],
) {
    const user = await ensurePrivateAccess(locationPathname);
    const isStaff = await hasAnyRole(user.id, allowedRoles);

    if (!isStaff) {
        throw redirect({ to: "/dashboard" });
    }

    return user;
}

export async function ensureCourseCompleted(locationPathname?: string) {
    const user = await ensurePrivateAccess(locationPathname);
    const { data, error } = await supabase.rpc("theory_completion_status", {
        p_expected_lesson_count: 27,
    });

    if (error) {
        throw error;
    }

    if (!data?.[0]?.complete) {
        throw redirect({
            to: "/theorie",
            search: { redirect: locationPathname ?? "/" },
        });
    }

    return user;
}

export async function ensurePanelQuizAccess(locationPathname?: string) {
    return ensureCourseCompleted(locationPathname);
}

export async function ensureExamAccess(locationPathname?: string) {
    const user = await ensurePrivateAccess(locationPathname);
    const { data, error } = await supabase.rpc("learning_gate_status");
    if (error) throw error;

    if (!data?.[0]?.exam_unlocked) {
        throw redirect({
            to: "/quiz",
            search: { redirect: locationPathname ?? "/examen" },
        });
    }

    return user;
}
