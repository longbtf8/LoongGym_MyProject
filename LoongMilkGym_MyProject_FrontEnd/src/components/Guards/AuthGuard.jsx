import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import paths from "@/config/path";
import AuthConfirmModal from "@/components/Modals/AuthConfirmModal";

function AuthGuard({ children }) {
  const { isLoggedIn, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      setShowModal(true);
    }
  }, [isLoading, isLoggedIn]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-color)]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        {/* Transparent placeholder container */}
        <div className="min-h-[calc(100vh-4rem)] w-full bg-transparent flex items-center justify-center" />
        <AuthConfirmModal
          isOpen={showModal}
          title="Yêu cầu đăng nhập"
          message="Bạn cần đăng nhập để truy cập tính năng này. Đi đến trang đăng nhập?"
          onConfirm={() => {
            setShowModal(false);
            const returnUrl = encodeURIComponent(location.pathname + location.search);
            navigate(`${paths.login}?returnUrl=${returnUrl}`, { replace: true });
          }}
          onCancel={() => {
            setShowModal(false);
            navigate("/", { replace: true });
          }}
        />
      </>
    );
  }

  return children;
}

export default AuthGuard;
