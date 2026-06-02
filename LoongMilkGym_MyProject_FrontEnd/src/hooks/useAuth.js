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
  const userName = userInfo?.profile?.fullName || userInfo?.fullname || userInfo?.email?.split("@")[0] || "Tài khoản";
  const userInitial = (userInfo?.profile?.fullName || userInfo?.fullname || userInfo?.email || "U").charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch (err) {
      console.error("Lỗi đăng xuất:", err);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      window.location.href = paths.login;
    }
  };

  return {
    isLoggedIn,
    userInfo,
    userName,
    userInitial,
    isLoading,
    isError,
    handleLogout,
    refetch,
  };
}
