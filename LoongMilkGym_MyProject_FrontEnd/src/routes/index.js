import paths from "@/config/path";

// Pages
import Home from "@/pages/home";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import ForgotPassword from "@/pages/auth/forgotPassword";
import ResetPassword from "@/pages/auth/resetPassword";
import VerifyEmail from "@/pages/auth/verifyEmail";
import NotFound from "@/pages/notFound";

// Layouts
import { DefaultLayout, AuthLayout, MessageLayout } from "@/layouts";

// Public Routes (Không cần đăng nhập)
const publicRoutes = [
  { path: paths.home, component: Home, layout: DefaultLayout },
  { path: paths.login, component: Login, layout: AuthLayout },
  { path: paths.register, component: Register, layout: AuthLayout },
  { path: paths.forgotPassword, component: ForgotPassword, layout: AuthLayout },
  { path: paths.resetPassword, component: ResetPassword, layout: AuthLayout },
  { path: paths.verifyEmail, component: VerifyEmail, layout: MessageLayout },
  { path: "*", component: NotFound, layout: null }, // Không có Layout (hoặc bạn có thể đổi thành DefaultLayout tùy ý)
];

// Private Routes (Cần đăng nhập)
const privateRoutes = [];

export { publicRoutes, privateRoutes };
