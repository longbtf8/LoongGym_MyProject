import { STORAGE_KEYS } from "@/services/api";
import { useGetUserInfoQuery, useLogoutMutation } from "@/services/auth/authApi";
import paths from "@/config/path";

export function useAuth() {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const isLoggedIn = !!accessToken;

  const { data: userData, isLoading, isError, refetch } = useGetUserInfoQuery(undefined, {
    skip: !isLoggedIn,
  });

  const [logout] = useLogoutMutation();

  const userInfo = userData?.data;
  const userName = userInfo?.profile?.fullName || userInfo?.fullname || userInfo?.email?.split("@")[0] || "Admin";
  const userInitial = (userInfo?.profile?.fullName || userInfo?.fullname || userInfo?.email || "A").charAt(0).toUpperCase();
  const isAdmin = userInfo?.role === "ADMIN";
  const isFinishedChecking = !isLoading && (userInfo || isError);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch (err) {
      console.error("Lỗi đăng xuất:", err);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      window.location.href = paths.LOGIN;
    }
  };

  return {
    isLoggedIn,
    userInfo,
    userName,
    userInitial,
    isLoading,
    isFinishedChecking,
    isAdmin,
    isError,
    handleLogout,
    refetch,
  };
}

