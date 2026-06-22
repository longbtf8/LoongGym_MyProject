import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import paths from "@/config/path";
import { STORAGE_KEYS } from "@/services/api";
import AuthConfirmModal from "@/components/Modals/AuthConfirmModal";

function AuthGuard({ children }) {
  const { isLoggedIn, isLoading, isFinishedChecking, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      setShowModal(true);
    }
  }, [isLoading, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && isFinishedChecking && !isAdmin) {
      // Clear tokens and redirect
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      navigate(`${paths.login}?error=forbidden`, { replace: true });
      window.location.reload();
    }
  }, [isLoggedIn, isFinishedChecking, isAdmin, navigate]);

  if (isLoading || (isLoggedIn && !isFinishedChecking)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-color)]">
        <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <div className="min-h-[calc(100vh-4rem)] w-full bg-transparent flex items-center justify-center" />
        <AuthConfirmModal
          isOpen={showModal}
          title="Yêu cầu đăng nhập"
          message="Bạn cần đăng nhập bằng tài khoản Quản trị viên để truy cập trang này. Đi đến trang đăng nhập?"
          onConfirm={() => {
            setShowModal(false);
            const returnUrl = encodeURIComponent(location.pathname + location.search);
            navigate(`${paths.login}?returnUrl=${returnUrl}`, { replace: true });
          }}
          onCancel={() => {
            setShowModal(false);
            navigate(paths.login, { replace: true });
          }}
        />
      </>
    );
  }

  // If logged in and checking completed and user is NOT admin, show a loading placeholder while useEffect handles redirection
  if (isLoggedIn && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-color)]">
        <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return children;
}

export default AuthGuard;

