import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import paths from "@/config/path";
import AuthConfirmModal from "@/components/Modals/AuthConfirmModal";

const AuthConfirmContext = createContext(null);

export function AuthConfirmProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const successCallbackRef = useRef(null);

  const requireAuth = useCallback((onSuccess) => {
    if (isLoggedIn) {
      if (onSuccess && typeof onSuccess === "function") {
        onSuccess();
      }
      return true;
    }

    // Save callback to run if they somehow authenticate, or just trigger modal
    if (onSuccess && typeof onSuccess === "function") {
      successCallbackRef.current = onSuccess;
    } else {
      successCallbackRef.current = null;
    }

    setIsOpen(true);
    return false;
  }, [isLoggedIn]);

  const handleConfirm = () => {
    setIsOpen(false);
    // Redirect to login page, appending returnUrl to go back where we were
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    navigate(`${paths.login}?returnUrl=${returnUrl}`);
  };

  const handleCancel = () => {
    setIsOpen(false);
    successCallbackRef.current = null;
  };

  return (
    <AuthConfirmContext.Provider value={{ requireAuth }}>
      {children}
      <AuthConfirmModal
        isOpen={isOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </AuthConfirmContext.Provider>
  );
}

export function useAuthConfirm() {
  const context = useContext(AuthConfirmContext);
  if (!context) {
    throw new Error("useAuthConfirm must be used within an AuthConfirmProvider");
  }
  return context;
}
