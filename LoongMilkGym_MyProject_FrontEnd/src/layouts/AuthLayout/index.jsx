import ThemeToggle from "@/components/ThemeToggle";

function AuthLayout({ children }) {
  const { theme } = useTheme();

  return (
    <div className="flex min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] font-sans transition-colors duration-300 relative">
      {/* Nút bật/tắt theme ở góc trên cùng bên phải */}
      <ThemeToggle className="fixed top-5 right-5 z-50 shadow-[0_2px_8px_var(--shadow-color)]" />

      {/* Cột trái: Ảnh tập Gym tuyệt đẹp từ thư mục public */}
      <div 
        className="hidden md:block [flex:1.3] bg-[url('/Image/authLayoutImage.webp')] bg-cover bg-center relative"
      >
        {/* Lớp phủ tối nhẹ để tăng tương phản */}
        <div className="absolute inset-0 bg-black/25" />
        
        {/* Lớp phủ gradient màu trắng cho Light mode, chuyển tiếp opacity mượt mà */}
        <div 
          className={`absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#ffffff] z-10 transition-opacity duration-400 ease-in-out ${
            theme === "light" ? "opacity-100" : "opacity-0"
          }`} 
        />
        
        {/* Lớp phủ gradient màu xám đen (#121212) cho Dark mode, chuyển tiếp opacity mượt mà */}
        <div 
          className={`absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#121212] z-10 transition-opacity duration-400 ease-in-out ${
            theme === "dark" ? "opacity-100" : "opacity-0"
          }`} 
        />
      </div>

      {/* Cột phải: Form hiển thị Đăng Nhập / Đăng Ký */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 sm:px-12 md:px-16 lg:px-20 relative z-20">
        <div className="w-full max-w-[420px] mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
