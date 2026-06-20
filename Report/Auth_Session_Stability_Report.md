# BÁO CÁO ỔN ĐỊNH PHIÊN ĐĂNG NHẬP SAU 1 GIỜ

Ngày lập báo cáo: 20/06/2026

## 1. Bối cảnh

Một số tài khoản trong hệ thống LoongMilkGym có hiện tượng đang sử dụng bình thường nhưng sau khoảng 1 tiếng thì bị đưa về trạng thái như đã đăng xuất. Hiện tượng này không xảy ra đồng đều với mọi tài khoản, khiến việc chẩn đoán cần kiểm tra cả cấu hình backend, cơ chế refresh token và cách frontend xử lý lỗi `401`.

## 2. Kết luận ngắn gọn

Nguyên nhân chính không phải do tài khoản bị đăng xuất chủ động, mà do access token hết hạn sau `1h`. Khi access token hết hạn, frontend phải gọi refresh token. Một số phiên bị văng vì refresh token có thể thất bại trong tình huống nhiều request hoặc nhiều tab cùng refresh đồng thời.

Backend đang dùng cơ chế xoay vòng refresh token: refresh thành công thì xóa token cũ và cấp token mới. Cơ chế này bảo mật hơn, nhưng frontend phải xử lý tình huống request sau vẫn đang cầm refresh token cũ.

## 3. Bằng chứng từ cấu hình và mã nguồn

### Backend

File `LoongMilkGym_MyProject_BackEnd/.env`:

```env
JWT_EXPIRES_IN=1h
AUTH_REFRESH_TOKEN="7" #ngày
```

File `LoongMilkGym_MyProject_BackEnd/src/config/auth.config.js`:

```js
jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
refreshTokenExpires: parseInt(process.env.AUTH_REFRESH_TOKEN || "7", 10),
```

File `LoongMilkGym_MyProject_BackEnd/src/services/auth.service.js`:

*   API refresh token tìm refresh token còn hạn trong bảng `refresh_tokens`.
*   Sau khi tìm thấy token hợp lệ, backend xóa bản ghi refresh token cũ.
*   Backend tạo cặp access token và refresh token mới.

Điều này xác nhận access token hết hạn sau 1 giờ, còn refresh token có hạn dài hơn nhưng được xoay vòng sau mỗi lần làm mới.

### Frontend trước khi sửa

File `LoongMilkGym_MyProject_FrontEnd/src/services/api.js` có interceptor tự động refresh token khi request trả về `401`.

Luồng cũ:

1. Request gặp `401`.
2. Frontend gọi `/auth/refresh-token`.
3. Nếu refresh thành công, lưu access token và refresh token mới.
4. Nếu refresh thất bại, xóa `loongmilkgym_accessToken` và `loongmilkgym_refreshToken`.

Vấn đề nằm ở bước 4. Trong trường hợp nhiều tab hoặc nhiều request cùng refresh, có thể một request đã refresh thành công và cập nhật token mới, nhưng request khác vẫn refresh bằng token cũ nên thất bại. Luồng cũ xóa token ngay, làm mất luôn phiên đăng nhập vừa được cập nhật.

## 4. Vì sao chỉ một số tài khoản bị

Hiện tượng phụ thuộc vào cách tài khoản được sử dụng, không nhất thiết phụ thuộc vào bản thân tài khoản.

Các trường hợp dễ bị:

*   Tài khoản mở nhiều tab cùng lúc.
*   Trang có nhiều API tự động gọi lại sau khi access token hết hạn.
*   Người dùng để trang mở lâu hơn 1 giờ rồi thao tác ở khu vực có nhiều dữ liệu cần tải.
*   Một số request nền chạy đồng thời khi trang được focus lại sau thời gian dài.

Các tài khoản ít bị hơn thường là tài khoản chỉ mở một tab, ít API chạy nền hoặc thao tác chậm hơn sau thời điểm token hết hạn.

## 5. Thay đổi đã thực hiện

File đã sửa:

```text
LoongMilkGym_MyProject_FrontEnd/src/services/api.js
```

Các phần bổ sung:

*   `waitForTokenChange(staleRefreshToken)`: chờ trong thời gian ngắn để kiểm tra xem token trong `localStorage` có được tab/request khác cập nhật hay không.
*   `retryWithLatestAccessToken(original)`: lấy access token mới nhất trong `localStorage`, gắn vào request ban đầu rồi gửi lại request.
*   Khi refresh thất bại, frontend không xóa token ngay. Trước tiên hệ thống thử phục hồi bằng token mới nếu token đã được cập nhật bởi một luồng khác.

## 6. Luồng xử lý sau khi sửa

1. Request gặp `401`.
2. Frontend kiểm tra request đó không thuộc nhóm endpoint xác thực.
3. Frontend gọi refresh token.
4. Nếu refresh thành công, lưu token mới và thử lại request ban đầu.
5. Nếu refresh thất bại, frontend chờ tối đa một khoảng ngắn để xem token có vừa được cập nhật bởi tab/request khác không.
6. Nếu có token mới, frontend dùng token đó để thử lại request.
7. Nếu không có token mới, frontend mới xóa token và yêu cầu đăng nhập lại.

## 7. Cách kiểm tra thủ công

1. Đăng nhập một tài khoản.
2. Mở cùng tài khoản ở 2 tab Chrome.
3. Để qua thời điểm access token hết hạn hoặc tạm thời giảm `JWT_EXPIRES_IN` trong môi trường phát triển để kiểm tra nhanh.
4. Thao tác ở cả hai tab vào khu vực cần xác thực.
5. Kết quả kỳ vọng: một tab/request refresh thành công, các request còn lại dùng token mới để tiếp tục thay vì xóa phiên đăng nhập.

## 8. Lưu ý vận hành

*   Nếu refresh token thật sự hết hạn, bị xóa khỏi DB hoặc người dùng bị khóa, hệ thống vẫn phải đăng xuất. Đây là hành vi đúng.
*   Nếu backend đổi chính sách refresh token trong tương lai, cần kiểm tra lại interceptor ở frontend.
*   Build frontend hiện cần Node.js `20.19+` hoặc `22.12+`. Máy đang dùng Node.js `18.20.8`, nên lệnh build không chạy được trong phiên kiểm tra hiện tại.

## 9. Kết quả kiểm tra hiện tại

*   Đã kiểm tra cú pháp file `src/services/api.js` bằng Node.js: đạt.
*   Chưa chạy được `npm run build` vì phiên bản Node.js hiện tại thấp hơn yêu cầu của Vite.

