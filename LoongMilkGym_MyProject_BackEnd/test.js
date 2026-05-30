const crypto = require("crypto");
require("module-alias/register");
const randomRefreshToken = require("./src/utils/randomRefreshToken");

console.log("=== DEMO SINH TOKEN VÀ BĂM (HASH) TOKEN ===");

// 1. Sinh token ngẫu nhiên bằng utility helper (được gửi qua email cho người dùng)
const token = randomRefreshToken();
console.log("\n1. Token ngẫu nhiên sinh ra (gửi qua email):");
console.log(`-> Giá trị: "${token}"`);
console.log(`-> Độ dài: ${token.length} ký tự`);

// 2. Băm token bằng thuật toán SHA-256 (lưu trữ trong Database để đối chiếu)
const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
console.log("\n2. Token sau khi băm SHA-256 (lưu vào database):");
console.log(`-> Giá trị: "${tokenHash}"`);
console.log(`-> Độ dài: ${tokenHash.length} ký tự`);

// 3. So khớp khi người dùng gửi mã token lên để reset mật khẩu
console.log("\n3. Khi người dùng nhấp vào link và gửi token lên Server để reset:");
const tokenGuiLen = token; // Giả sử người dùng gửi đúng token
const tokenGuiLenHash = crypto.createHash("sha256").update(tokenGuiLen).digest("hex");

console.log(`-> Token người dùng gửi lên: "${tokenGuiLen}"`);
console.log(`-> Server băm token gửi lên: "${tokenGuiLenHash}"`);
console.log(`-> So sánh với DB: ${tokenGuiLenHash === tokenHash ? "✅ TRÙNG KHỚP - Cho phép đổi mật khẩu" : "❌ KHÔNG KHỚP - Chặn lại"}`);
