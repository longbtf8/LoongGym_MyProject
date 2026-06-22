import { useAuthConfirm } from "@/context/AuthConfirmContext";
import { useAuth } from "@/hooks/useAuth";

export function useRequireAuth() {
  const { isLoggedIn } = useAuth();
  const { requireAuth } = useAuthConfirm();

  return { isLoggedIn, requireAuth };
}
