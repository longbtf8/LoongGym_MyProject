import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Logo from "@/components/Logo";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useVerifyEmailMutation } from "@/services/auth/authApi";

function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [status, setStatus] = useState("verifying"); // 'verifying' | 'success' | 'error'
  const [countdown, setCountdown] = useState(3);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Không tìm thấy mã xác thực (token). Vui lòng kiểm tra lại liên kết.");
      return;
    }

    const triggerVerification = async () => {
      try {
        const response = await verifyEmail({ token }).unwrap();
        if (response?.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMessage(response?.message || "Xác thực thất bại.");
        }
      } catch (err) {
        console.error("Lỗi xác thực:", err);
        setStatus("error");
        setErrorMessage(
          err?.data?.message || "Liên kết xác thực đã hết hiệu lực hoặc không hợp lệ."
        );
      }
    };

    triggerVerification();
  }, [token, verifyEmail]);

  // Bộ đếm ngược chuyển hướng khi thành công
  useEffect(() => {
    if (status !== "success") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, navigate]);

  return (
    <div className="text-center flex flex-col items-center justify-center">
      {/* Tên thương hiệu LoongMilKGym sử dụng component Logo dùng chung */}
      <div className="mb-8 block">
        <Logo className="text-3xl sm:text-4xl" isLink={false} />
      </div>

      {status === "verifying" && (
        <div className="flex flex-col items-center gap-6 animate-slide-down">
          <div className="relative flex items-center justify-center">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
            <div className="absolute w-16 h-16 rounded-full border-2 border-primary/20" />
          </div>
          <h2 className="text-2xl font-bold m-0">Đang xác thực tài khoản</h2>
          <p className="text-[var(--text-muted)] text-sm max-w-[340px] leading-relaxed">
            Hệ thống đang tiến hành kích hoạt tài khoản của bạn. Vui lòng giữ kết nối ổn định...
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center gap-6 animate-slide-down">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold m-0 text-emerald-500">Xác thực thành công</h2>
          <p className="text-[var(--text-muted)] text-sm max-w-[340px] leading-relaxed">
            Tài khoản của bạn đã được kích hoạt hoàn tất! Hệ thống sẽ đưa bạn trở lại trang Đăng nhập sau{" "}
            <span className="font-extrabold text-primary text-base">{countdown}</span> giây.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-2 px-6 py-3 rounded-[30px] border-none bg-primary text-black text-sm font-extrabold cursor-pointer transition-all duration-200 shadow-[0_4px_12px_rgba(204,255,0,0.2)] hover:bg-primary-hover active:bg-primary-active hover:-translate-y-0.5"
          >
            Đăng nhập ngay
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center gap-6 animate-slide-down">
          <div className="w-16 h-16 rounded-full bg-[#ff4d4f]/10 flex items-center justify-center text-[#ff4d4f] border border-[#ff4d4f]/20 animate-shake">
            <XCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold m-0 text-[#ff4d4f]">Xác thực thất bại</h2>
          <p className="text-[var(--text-muted)] text-sm max-w-[340px] leading-relaxed">
            {errorMessage}
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-2 px-6 py-3 rounded-[30px] border-none bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-color)] text-sm font-bold cursor-pointer transition-all duration-200 hover:bg-[var(--border-color)]"
          >
            Quay lại Đăng nhập
          </button>
        </div>
      )}
    </div>
  );
}

export default VerifyEmail;
