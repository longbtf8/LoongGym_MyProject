import paths from "@/config/path";

// Pages
import Home from "@/pages/home";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import ForgotPassword from "@/pages/auth/forgotPassword";
import ResetPassword from "@/pages/auth/resetPassword";
import VerifyEmail from "@/pages/auth/verifyEmail";
import Profile from "@/pages/account/profile";
import NotFound from "@/pages/notFound";

// Layouts
import { DefaultLayout, AuthLayout, MessageLayout } from "@/layouts";

// Guards
import GuestGuard from "@/components/Guards/GuestGuard";
import AuthGuard from "@/components/Guards/AuthGuard";

// Public Routes (Không cần đăng nhập, nhưng một số trang Auth sẽ được bảo vệ bởi GuestGuard)
const publicRoutes = [
  { path: paths.home, component: Home, layout: DefaultLayout },
  { path: paths.login, component: Login, layout: AuthLayout, guard: GuestGuard },
  { path: paths.register, component: Register, layout: AuthLayout, guard: GuestGuard },
  { path: paths.forgotPassword, component: ForgotPassword, layout: AuthLayout, guard: GuestGuard },
  { path: paths.resetPassword, component: ResetPassword, layout: AuthLayout },
  { path: paths.verifyEmail, component: VerifyEmail, layout: MessageLayout, guard: GuestGuard },
  { path: "*", component: NotFound, layout: null },
];

// Private Routes (Bắt buộc phải đăng nhập, tự động bảo vệ bởi AuthGuard)
const privateRoutes = [
  { path: paths.profile, component: Profile, layout: DefaultLayout, guard: AuthGuard },
];

export { publicRoutes, privateRoutes };
