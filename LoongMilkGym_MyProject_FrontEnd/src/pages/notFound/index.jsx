import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div
      style={{
        padding: "50px 20px",
        textAlign: "center",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ fontSize: "72px", margin: "0 0 10px 0", color: "#f56c6c" }}>
        404
      </h1>
      <h2 style={{ margin: "0 0 20px 0", color: "#333" }}>
        Không Tìm Thấy Trang
      </h2>
      <p style={{ color: "#666", marginBottom: "30px" }}>
        Đường dẫn bạn truy cập không tồn tại hoặc đã bị di chuyển.
      </p>
      <Link
        to="/"
        style={{
          padding: "10px 20px",
          background: "#409eff",
          color: "#fff",
          textDecoration: "none",
          borderRadius: "4px",
          fontWeight: "bold",
        }}
      >
        Quay lại Trang Chủ
      </Link>
    </div>
  );
}

export default NotFound;
