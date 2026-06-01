const crypto = require("crypto");

console.log("========================================");
console.log("  VÍ DỤ ĐƠN GIẢN VỀ BĂM (HASH)");
console.log("========================================\n");

// ==============================
// BƯỚC 1: KHI ĐĂNG NHẬP
// ==============================
console.log("--- BƯỚC 1: KHI USER ĐĂNG NHẬP ---\n");

// Server tạo ra 1 token gốc
const tokenGoc = "abcdef123";
console.log(`Server tạo token gốc: "${tokenGoc}"`);

// Server băm token gốc đó
const tokenBam = crypto.createHash("sha256").update(tokenGoc).digest("hex");
console.log(`Server băm token gốc: "${tokenBam}"`);

// Server lưu bản BĂM vào Database (KHÔNG lưu token gốc)
console.log(`\nDatabase lưu: "${tokenBam}" (bản băm)`);

// Server trả token GỐC về cho Client (trình duyệt)
console.log(`Client nhận:  "${tokenGoc}" (token gốc, KHÔNG phải bản băm)\n`);

// ==============================
// BƯỚC 2: KHI CLIENT GỬI LÊN
// ==============================
console.log("--- BƯỚC 2: KHI CLIENT GỬI TOKEN LÊN ĐỂ REFRESH ---\n");

// Client gửi lên token GỐC (cái nó nhận được lúc đăng nhập)
const tokenClientGuiLen = "abcdef123"; // chính là token gốc!
console.log(`Client gửi lên: "${tokenClientGuiLen}" (token gốc)`);
console.log(`⚠️  Client KHÔNG gửi bản băm lên! Client KHÔNG biết bản băm là gì!\n`);

// Server nhận được token gốc từ Client
// Server TỰ BĂM LẠI token đó
const serverBamLai = crypto.createHash("sha256").update(tokenClientGuiLen).digest("hex");
console.log(`Server nhận và tự băm lại: "${serverBamLai}"`);

// Server so sánh bản băm vừa tạo với bản băm trong Database
console.log(`Database đang lưu:         "${tokenBam}"`);
console.log(`\nKết quả so sánh: ${serverBamLai === tokenBam ? "✅ KHỚP!" : "❌ KHÔNG KHỚP!"}`);

// ==============================
// BƯỚC 3: GIẢI THÍCH TẠI SAO AN TOÀN
// ==============================
console.log("\n--- BƯỚC 3: NẾU HACKER HACK ĐƯỢC DATABASE ---\n");

const caiHackerThay = tokenBam;
console.log(`Hacker nhìn thấy trong DB: "${caiHackerThay}"`);
console.log(`Hacker thử gửi bản băm này lên Server làm refresh token...`);

// Server nhận bản băm từ hacker, rồi BĂM TIẾP bản băm đó
const serverBamCaiHackerGui = crypto.createHash("sha256").update(caiHackerThay).digest("hex");
console.log(`Server băm cái hacker gửi: "${serverBamCaiHackerGui}"`);
console.log(`Database đang lưu:         "${tokenBam}"`);
console.log(`\nKết quả: ${serverBamCaiHackerGui === tokenBam ? "✅ KHỚP!" : "❌ KHÔNG KHỚP! Hacker bị chặn!"}`);
console.log(`\n→ Vì Server luôn băm cái nhận được, nên bản băm bị băm thêm 1 lần nữa`);
console.log(`→ Kết quả khác hoàn toàn với bản băm trong DB → THẤT BẠI!`);
