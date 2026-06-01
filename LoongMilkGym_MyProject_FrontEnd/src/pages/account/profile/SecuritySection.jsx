import React, { useState } from "react";
import { Laptop, Smartphone, Globe, RefreshCw } from "lucide-react";
import { useGetDevicesQuery, useRevokeDeviceMutation, useChangePasswordMutation } from "@/services/auth/authApi";
import { parseApiError } from "@/utils/errorParser";
import PasswordInput from "@/components/PasswordInput";

function SecuritySection() {
  const { data: response, isLoading, refetch, isFetching } = useGetDevicesQuery();
  const [revokeDevice] = useRevokeDeviceMutation();
  const [changePassword, { isLoading: isUpdating }] = useChangePasswordMutation();
  const [revokingId, setRevokingId] = useState(null);

  // State cho đổi mật khẩu
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  const devices = response?.data || [];

  const getDeviceIcon = (deviceName) => {
    const name = (deviceName || "").toLowerCase();
    if (name.includes("iphone") || name.includes("android") || name.includes("mobile") || name.includes("phone")) {
      return Smartphone;
    }
    return Laptop;
  };

  const handleRevoke = async (id) => {
    try {
      setRevokingId(id);
      await revokeDevice(id).unwrap();
      // RTK Query tự động refetch nhờ tagTypes 'Devices', nhưng gọi thêm refetch cho chắc chắn
      refetch();
    } catch (error) {
      console.error("Lỗi khi đăng xuất thiết bị:", error);
    } finally {
      setRevokingId(null);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      setMessage({ type: "error", text: "Vui lòng nhập đầy đủ thông tin" });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự" });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu xác nhận không khớp" });
      return;
    }
    
    try {
      setMessage({ type: "", text: "" });
      const res = await changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      }).unwrap();

      if (res?.success) {
        setMessage({ type: "success", text: "Cập nhật mật khẩu thành công!" });
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setMessage({ type: "error", text: res?.message || "Cập nhật mật khẩu thất bại" });
      }
    } catch (err) {
      const parsed = parseApiError(err, "Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu cũ.");
      setMessage({ type: "error", text: parsed.message });
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-slide-down">
      <div className="text-left flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-color)] leading-none m-0">
            Cài đặt bảo mật
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium mt-2 mb-0">
            Quản lý mật khẩu tài khoản và giám sát các phiên đăng nhập hoạt động.
          </p>
        </div>
        
        <button 
          onClick={() => refetch()} 
          disabled={isFetching}
          className="p-2.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--border-color)]/30 text-[var(--text-muted)] hover:text-primary transition-all duration-200 cursor-pointer disabled:opacity-50"
          aria-label="Tải lại thiết bị"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-primary" : ""}`} />
        </button>
      </div>

      {/* ĐỔI MẬT KHẨU CARD */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300 text-left">
        <h3 className="text-lg font-extrabold text-[var(--text-color)] mb-1 m-0">
          Đổi mật khẩu
        </h3>
        <p className="text-xs text-[var(--text-muted)] font-medium mb-6">
          Bạn nên sử dụng mật khẩu mạnh gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
        </p>

        {message.text && (
          <div className={`mb-4 px-4 py-2.5 rounded-xl text-xs font-bold border ${
            message.type === "success" 
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
              : "bg-rose-500/10 text-rose-500 border-rose-500/20"
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4 max-w-md">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Mật khẩu hiện tại</label>
            <PasswordInput
              variant="settings"
              name="oldPassword"
              value={passwordData.oldPassword}
              onChange={handlePasswordChange}
              placeholder="••••••••"
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Mật khẩu mới</label>
            <PasswordInput
              variant="settings"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              placeholder="••••••••"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Xác nhận mật khẩu mới</label>
            <PasswordInput
              variant="settings"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={isUpdating}
            className="self-start mt-2 px-6 py-2.5 rounded-full bg-primary text-black text-xs font-black transition-all duration-200 cursor-pointer shadow-md hover:bg-primary-hover active:bg-primary-active hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isUpdating ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
          </button>
        </form>
      </div>

      {/* THIẾT BỊ ĐÃ ĐĂNG NHẬP CARD */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300 text-left">
        <h3 className="text-lg font-extrabold text-[var(--text-color)] mb-1 m-0">
          Thiết bị đang hoạt động
        </h3>
        <p className="text-xs text-[var(--text-muted)] font-medium mb-6">
          Dưới đây là danh sách các thiết bị đã đăng nhập và đang sử dụng tài khoản của bạn. Bạn có thể đăng xuất từ xa nếu nghi ngờ.
        </p>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-[var(--text-muted)]">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <span className="text-xs font-bold">Đang tải danh sách thiết bị...</span>
          </div>
        ) : devices.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-[var(--border-color)] rounded-2xl">
            <span className="text-xs text-[var(--text-muted)] font-bold">Không tìm thấy thiết bị nào đang hoạt động</span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {devices.map((device, idx) => {
              const DeviceIcon = getDeviceIcon(device.deviceName);
              // Xác định thiết bị hiện tại dựa trên trường isCurrent từ Backend
              const isCurrent = !!device.isCurrent;

              return (
                <div 
                  key={device.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color)] gap-4 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      isCurrent 
                        ? "bg-primary/10 text-primary border border-primary/20" 
                        : "bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)]"
                    }`}>
                      <DeviceIcon className="w-5.5 h-5.5" />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-extrabold text-[var(--text-color)]">
                          {device.deviceName || "Thiết bị không xác định"}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-primary/25 text-primary border border-primary/30 animate-pulse">
                            Thiết bị này
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-[var(--text-muted)] font-medium">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" />
                          {device.ipAddress || "Không rõ IP"}
                        </span>
                        <span>•</span>
                        <span>{isCurrent ? "Đang hoạt động" : new Date(device.lastActiveAt).toLocaleString("vi-VN")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold ${isCurrent ? "text-primary" : "text-[var(--text-muted)]"}`}>
                      {isCurrent ? "Đang hoạt động" : "Hoạt động"}
                    </span>
                    
                    {!isCurrent && (
                      <button 
                        onClick={() => handleRevoke(device.id)}
                        disabled={revokingId === device.id}
                        className="px-3.5 py-1.5 rounded-full border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-bold transition-all duration-200 cursor-pointer disabled:opacity-50"
                      >
                        {revokingId === device.id ? "Đang đăng xuất..." : "Đăng xuất từ xa"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

export default SecuritySection;
