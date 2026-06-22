import { useAuth } from "@/hooks/useAuth";
import { useConfirm } from "@/context/ConfirmContext";
import { useNavigate } from "react-router-dom";
import paths from "@/config/path";

export function useRequireAuth() {
  const { isLoggedIn } = useAuth();
  const confirm = useConfirm();
  const navigate = useNavigate();

  const requireAuth = (onSuccess) => {
    if (!isLoggedIn) {
      confirm({
        title: "Yêu cầu đăng nhập",
        message: "Vui lòng đăng nhập để thực hiện hành động này. Đi đến trang đăng nhập?",
        type: "warning",
        onConfirm: () => {
          navigate(paths.login);
        },
      });
      return false;
    }
    if (onSuccess && typeof onSuccess === "function") {
      onSuccess();
    }
    return true;
  };

  return { isLoggedIn, requireAuth };
}
