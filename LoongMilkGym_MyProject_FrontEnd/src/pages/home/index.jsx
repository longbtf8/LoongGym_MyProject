import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    // Nếu phát hiện token xác thực trên URL trang chủ, tự động chuyển sang trang xác thực chuyên dụng
    if (token) {
      navigate(`/verify-email?token=${token}`, { replace: true });
    }
  }, [token, navigate]);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Trang chủ (Home Page)</h1>
      <p>Chào mừng bạn đến với LoongMilkGym!</p>
      <nav style={{ marginTop: "20px" }}>
        <Link to="/login" style={{ marginRight: "15px" }}>
          Đăng nhập
        </Link>
        <Link to="/register">Đăng ký</Link>
      </nav>
    </div>
  );
}

export default Home;
