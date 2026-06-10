require("module-alias/register");
require("dotenv/config");
const { prisma } = require("../src/lib/prisma");

async function main() {
  console.log("🌱 Bắt đầu tạo danh sách 1,000 món ăn chuẩn Việt Nam...");

  const foods = [];

  // 1. Thịt & Gia cầm (Base: 100g)
  const meats = [
    { name: "Ức gà phi lê", calories: 120, protein: 26, carbs: 0, fat: 1.5, brand: "CP" },
    { name: "Đùi gà (bỏ da)", calories: 145, protein: 21, carbs: 0, fat: 6.8, brand: "CP" },
    { name: "Cánh gà (bỏ da)", calories: 160, protein: 20, carbs: 0, fat: 9.0, brand: "CP" },
    { name: "Thịt bò thăn nạc", calories: 135, protein: 24, carbs: 0, fat: 4.2, brand: "G-Kitchen" },
    { name: "Thịt bò ba chỉ Mỹ", calories: 260, protein: 17, carbs: 0, fat: 21.0, brand: "Excel" },
    { name: "Bắp bò tươi", calories: 145, protein: 22, carbs: 0, fat: 6.0, brand: "G-Kitchen" },
    { name: "Thịt heo thăn nạc", calories: 130, protein: 22, carbs: 0, fat: 4.5, brand: "MEATDeli" },
    { name: "Thịt heo ba chỉ", calories: 290, protein: 15, carbs: 0, fat: 25.0, brand: "MEATDeli" },
    { name: "Thịt nạc vai heo", calories: 165, protein: 20, carbs: 0, fat: 9.5, brand: "MEATDeli" },
    { name: "Thịt nạc đùi heo", calories: 140, protein: 21, carbs: 0, fat: 6.0, brand: "MEATDeli" },
    { name: "Sườn non heo", calories: 210, protein: 18, carbs: 0, fat: 15.0, brand: "MEATDeli" },
    { name: "Thịt vịt (bỏ da)", calories: 160, protein: 19, carbs: 0, fat: 9.5, brand: "Chợ Việt" },
    { name: "Thịt dê nạc", calories: 143, protein: 20, carbs: 0, fat: 6.8, brand: "Chợ Việt" },
    { name: "Thịt thỏ nạc", calories: 136, protein: 22, carbs: 0, fat: 5.0, brand: "Chợ Việt" }
  ];

  const meatCookMethods = [
    { suffix: " tươi sống", calMult: 1.0, proMult: 1.0, fatMult: 1.0, carbsMult: 1.0 },
    { suffix: " luộc chín", calMult: 1.1, proMult: 1.15, fatMult: 0.95, carbsMult: 1.0 },
    { suffix: " hấp sả gừng", calMult: 1.1, proMult: 1.15, fatMult: 0.95, carbsMult: 1.0 },
    { suffix: " nướng mọi", calMult: 1.25, proMult: 1.25, fatMult: 1.05, carbsMult: 1.0 },
    { suffix: " áp chảo không dầu", calMult: 1.35, proMult: 1.25, fatMult: 1.1, carbsMult: 1.0 },
    { suffix: " áp chảo tỏi ớt", calMult: 1.45, proMult: 1.25, fatMult: 1.4, carbsMult: 1.0 },
    { suffix: " xào hành tây tỏi", calMult: 1.5, proMult: 1.2, fatMult: 1.6, carbsMult: 1.1 },
    { suffix: " kho gừng tiêu", calMult: 1.4, proMult: 1.2, fatMult: 1.3, carbsMult: 1.3 },
    { suffix: " chiên giòn rụm", calMult: 1.8, proMult: 1.15, fatMult: 2.2, carbsMult: 1.15 }
  ];

  // Meats combinations -> 14 * 9 = 126 món
  for (const m of meats) {
    for (const c of meatCookMethods) {
      foods.push({
        name: `${m.name}${c.suffix}`,
        brand: m.brand,
        servingSizeG: 100,
        calories: Math.round(m.calories * c.calMult),
        proteinG: Math.round(m.protein * c.proMult * 10) / 10,
        carbsG: Math.round(m.carbs * c.carbsMult * 10) / 10,
        fatG: Math.round(m.fat * c.fatMult * 10) / 10,
        metadata: { source: "NIN_VN", category: "Thịt & Gia cầm" }
      });
    }
  }

  // 2. Hải sản (Base: 100g)
  const seafoods = [
    { name: "Cá hồi phi lê", calories: 180, protein: 20, carbs: 0, fat: 11, brand: "Cá hồi Nauy" },
    { name: "Cá thu phi lê", calories: 165, protein: 19, carbs: 0, fat: 9.5, brand: "Chợ Hải Sản" },
    { name: "Cá lóc phi lê", calories: 97, protein: 18.2, carbs: 0, fat: 2.2, brand: "Chợ Hải Sản" },
    { name: "Cá chép tươi", calories: 96, protein: 16.0, carbs: 0, fat: 3.6, brand: "Chợ Hải Sản" },
    { name: "Cá ngừ phi lê", calories: 130, protein: 26.0, carbs: 0, fat: 2.5, brand: "Chợ Hải Sản" },
    { name: "Cá điêu hồng", calories: 110, protein: 18.5, carbs: 0, fat: 4.0, brand: "Chợ Hải Sản" },
    { name: "Cá hú phi lê", calories: 150, protein: 16.0, carbs: 0, fat: 9.6, brand: "Chợ Hải Sản" },
    { name: "Tôm sú", calories: 92, protein: 20.0, carbs: 0.9, fat: 1.0, brand: "Chợ Hải Sản" },
    { name: "Mực ống tươi", calories: 84, protein: 16.3, carbs: 0.8, fat: 0.9, brand: "Chợ Hải Sản" },
    { name: "Nghêu / Ngao thịt", calories: 74, protein: 12.8, carbs: 2.6, fat: 1.2, brand: "Chợ Hải Sản" },
    { name: "Thịt hàu sữa tươi", calories: 68, protein: 7.0, carbs: 3.9, fat: 2.5, brand: "Chợ Hải Sản" },
    { name: "Thịt cua biển", calories: 95, protein: 19.5, carbs: 0, fat: 1.5, brand: "Chợ Hải Sản" }
  ];

  const seafoodCookMethods = [
    { suffix: " tươi sống", calMult: 1.0, proMult: 1.0, fatMult: 1.0, carbsMult: 1.0 },
    { suffix: " luộc chín", calMult: 1.1, proMult: 1.15, fatMult: 0.95, carbsMult: 1.0 },
    { suffix: " hấp sả ớt", calMult: 1.1, proMult: 1.15, fatMult: 0.95, carbsMult: 1.05 },
    { suffix: " nướng mọi", calMult: 1.2, proMult: 1.25, fatMult: 1.0, carbsMult: 1.0 },
    { suffix: " áp chảo sốt bơ", calMult: 1.45, proMult: 1.2, fatMult: 1.55, carbsMult: 1.05 },
    { suffix: " xào chua ngọt", calMult: 1.5, proMult: 1.1, fatMult: 1.5, carbsMult: 1.6 },
    { suffix: " kho tộ tiêu gừng", calMult: 1.4, proMult: 1.15, fatMult: 1.3, carbsMult: 1.5 },
    { suffix: " lăn bột chiên xù", calMult: 1.85, proMult: 1.1, fatMult: 2.3, carbsMult: 1.6 },
    { suffix: " canh ngót chua cay", calMult: 1.05, proMult: 1.0, fatMult: 1.0, carbsMult: 1.1 }
  ];

  // Seafood combination -> 12 * 9 = 108 món
  for (const sf of seafoods) {
    for (const c of seafoodCookMethods) {
      foods.push({
        name: `${sf.name}${c.suffix}`,
        brand: sf.brand,
        servingSizeG: 100,
        calories: Math.round(sf.calories * c.calMult),
        proteinG: Math.round(sf.protein * c.proMult * 10) / 10,
        carbsG: Math.round(sf.carbs * c.carbsMult * 10) / 10,
        fatG: Math.round(sf.fat * c.fatMult * 10) / 10,
        metadata: { source: "NIN_VN", category: "Hải sản" }
      });
    }
  }

  // 3. Trứng (Base: 100g)
  const eggs = [
    { name: "Trứng gà ta", calories: 155, protein: 13, carbs: 1.1, fat: 11, brand: "Ba Huân" },
    { name: "Trứng gà công nghiệp", calories: 143, protein: 12.5, carbs: 1.0, fat: 10, brand: "Ba Huân" },
    { name: "Lòng trắng trứng gà", calories: 52, protein: 11, carbs: 0.7, fat: 0.2, brand: "CP" },
    { name: "Lòng đỏ trứng gà", calories: 322, protein: 16, carbs: 3.5, fat: 26.5, brand: "CP" },
    { name: "Trứng vịt", calories: 185, protein: 13, carbs: 1.5, fat: 14.5, brand: "Ba Huân" },
    { name: "Trứng cút", calories: 158, protein: 13, carbs: 0.4, fat: 11, brand: "Ba Huân" }
  ];

  const eggCookMethods = [
    { suffix: " sống tươi", calMult: 1.0, proMult: 1.0, fatMult: 1.0, carbsMult: 1.0 },
    { suffix: " luộc chín lòng đào", calMult: 1.0, proMult: 1.0, fatMult: 1.0, carbsMult: 1.0 },
    { suffix: " ốp la ít dầu mỡ", caloriesAdd: 40, fatAdd: 4.5 },
    { suffix: " chiên bơ tỏi rán", caloriesAdd: 50, fatAdd: 5.5 },
    { suffix: " chưng nước thịt nạc", caloriesAdd: 30, carbsAdd: 1.0, fatAdd: 2.0 },
    { suffix: " khuấy chín xào xơ", caloriesAdd: 25, proMult: 1.0, fatAdd: 2.5 }
  ];

  // Egg combinations -> 6 * 6 = 36 món
  for (const eg of eggs) {
    for (const c of eggCookMethods) {
      foods.push({
        name: `${eg.name}${c.suffix}`,
        brand: eg.brand,
        servingSizeG: 100,
        calories: Math.round((eg.calories * (c.calMult || 1.0)) + (c.caloriesAdd || 0)),
        proteinG: Math.round(eg.protein * (c.proMult || 1.0) * 10) / 10,
        carbsG: Math.round((eg.carbs * (c.carbsMult || 1.0) + (c.carbsAdd || 0)) * 10) / 10,
        fatG: Math.round((eg.fat * (c.fatMult || 1.0) + (c.fatAdd || 0)) * 10) / 10,
        metadata: { source: "NIN_VN", category: "Trứng" }
      });
    }
  }

  // 4. Tinh bột & Ngũ cốc (Base: 100g)
  const carbFoods = [
    { name: "Cơm gạo tẻ trắng", calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, brand: "Gạo Tẻ" },
    { name: "Cơm gạo lứt hữu cơ", calories: 111, protein: 2.6, carbs: 23.0, fat: 0.9, brand: "Gạo Lứt" },
    { name: "Cơm nếp nương thơm", calories: 97, protein: 2.0, carbs: 21.0, fat: 0.1, brand: "Gạo Nếp" },
    { name: "Khoai lang mật ngọt", calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, brand: "Khoai Đà Lạt" },
    { name: "Khoai tây tươi Đà Lạt", calories: 77, protein: 2.0, carbs: 17.5, fat: 0.1, brand: "Khoai Đà Lạt" },
    { name: "Yến mạch cán dẹt", calories: 379, protein: 13.5, carbs: 67.7, fat: 6.5, brand: "Quaker" },
    { name: "Bánh mì gối sữa trắng", calories: 265, protein: 8.0, carbs: 49.0, fat: 3.2, brand: "Kinh Đô" },
    { name: "Bánh mì đen lúa mạch nguyên cám", calories: 250, protein: 9.0, carbs: 48.0, fat: 1.8, brand: "Vũ Gia" },
    { name: "Bánh mì ngũ cốc nguyên hạt", calories: 247, protein: 12.0, carbs: 43.0, fat: 3.5, brand: "Vũ Gia" },
    { name: "Bún tươi sợi nhỏ", calories: 110, protein: 1.7, carbs: 25.7, fat: 0.1, brand: "Lò Bún" },
    { name: "Phở tươi sợi bánh dai", calories: 140, protein: 2.2, carbs: 32.1, fat: 0.2, brand: "Lò Phở" },
    { name: "Hủ tiếu sợi dai tươi", calories: 145, protein: 2.0, carbs: 33.5, fat: 0.2, brand: "Lò Hủ Tiếu" },
    { name: "Bột yến mạch pha nước sôi", calories: 68, protein: 2.4, carbs: 12.0, fat: 1.2, brand: "Quaker" },
    { name: "Miến dong Bắc khô", calories: 330, protein: 0.6, carbs: 82.0, fat: 0.1, brand: "Miến Bắc" },
    { name: "Mì tôm ăn liền Hảo Hảo", calories: 450, protein: 9.0, carbs: 60.0, fat: 19.0, brand: "Acecook" }
  ];

  const carbCookMethods = [
    { suffix: " nấu chín dẻo", calMult: 1.0, proMult: 1.0, fatMult: 1.0, carbsMult: 1.0 },
    { suffix: " luộc chín nước", calMult: 1.0, proMult: 1.0, fatMult: 1.0, carbsMult: 1.0 },
    { suffix: " hấp cách thủy giữ ngọt", calMult: 1.0, proMult: 1.0, fatMult: 1.0, carbsMult: 1.0 },
    { suffix: " nướng củi thơm dai", calMult: 1.15, proMult: 1.1, fatMult: 1.0, carbsMult: 1.1 },
    { suffix: " chiên mỡ tỏi xào chảo", calMult: 1.7, proMult: 1.0, fatMult: 3.5, carbsMult: 1.1 },
    { suffix: " sấy khô giòn đóng gói", calMult: 3.2, proMult: 3.0, fatMult: 2.5, carbsMult: 3.2 }
  ];

  // Carb combinations -> 15 * 6 = 90 món
  for (const cb of carbFoods) {
    for (const c of carbCookMethods) {
      foods.push({
        name: `${cb.name}${c.suffix}`,
        brand: cb.brand,
        servingSizeG: 100,
        calories: Math.round(cb.calories * c.calMult),
        proteinG: Math.round(cb.protein * c.proMult * 10) / 10,
        carbsG: Math.round(cb.carbs * c.carbsMult * 10) / 10,
        fatG: Math.round(cb.fat * c.fatMult * 10) / 10,
        metadata: { source: "NIN_VN", category: "Tinh bột & Ngũ cốc" }
      });
    }
  }

  // 5. Rau củ quả (Base: 100g)
  const veggies = [
    { name: "Bông cải xanh (Broccoli)", calories: 34, protein: 2.8, carbs: 7.0, fat: 0.4 },
    { name: "Súp lơ trắng", calories: 25, protein: 1.9, carbs: 5.0, fat: 0.3 },
    { name: "Rau muống ruộng tươi", calories: 19, protein: 2.0, carbs: 3.1, fat: 0.2 },
    { name: "Rau ngót vườn nhà", calories: 35, protein: 5.3, carbs: 3.4, fat: 0.4 },
    { name: "Rau đay nấu canh", calories: 24, protein: 2.8, carbs: 3.2, fat: 0.2 },
    { name: "Rau mồng tơi luộc", calories: 19, protein: 2.0, carbs: 3.2, fat: 0.3 },
    { name: "Cải thìa (Bok Choy)", calories: 13, protein: 1.5, carbs: 2.2, fat: 0.2 },
    { name: "Cải bắp tròn xanh", calories: 25, protein: 1.3, carbs: 6.0, fat: 0.1 },
    { name: "Cải bó xôi (Rau chân vịt)", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
    { name: "Cải thảo xào", calories: 16, protein: 1.2, carbs: 3.2, fat: 0.2 },
    { name: "Cà chua tươi chín đỏ", calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
    { name: "Dưa leo / Dưa chuột tươi", calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1 },
    { name: "Cà rốt tươi ngọt", calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2 },
    { name: "Bí đỏ / Bí ngô già", calories: 26, protein: 1.0, carbs: 6.5, fat: 0.1 },
    { name: "Măng tây xanh", calories: 20, protein: 2.2, carbs: 3.9, fat: 0.1 },
    { name: "Mướp đắng / Khổ qua quả", calories: 17, protein: 1.0, carbs: 3.7, fat: 0.2 },
    { name: "Bắp hạt vàng ngọt dẻo", calories: 86, protein: 3.2, carbs: 19.0, fat: 1.2 },
    { name: "Nấm đùi gà xào tỏi", calories: 35, protein: 2.5, carbs: 5.0, fat: 0.3 },
    { name: "Nấm rơm tươi ngọt", calories: 32, protein: 3.4, carbs: 3.2, fat: 0.8 },
    { name: "Nấm hương rừng tươi", calories: 34, protein: 2.2, carbs: 6.8, fat: 0.5 },
    { name: "Giá đỗ xanh giòn", calories: 30, protein: 3.0, carbs: 6.0, fat: 0.2 }
  ];

  const veggieCookMethods = [
    { suffix: " tươi sống sạch", calMult: 1.0, proMult: 1.0, fatMult: 1.0, carbsMult: 1.0 },
    { suffix: " luộc chín tới", calMult: 0.95, proMult: 0.9, fatMult: 0.9, carbsMult: 0.9 },
    { suffix: " hấp hơi nóng chín", calMult: 0.95, proMult: 0.95, fatMult: 0.9, carbsMult: 0.9 },
    { suffix: " xào hành tỏi (ít dầu)", calMult: 2.5, proMult: 1.0, fatMult: 8.0, carbsMult: 1.1 },
    { suffix: " lăn bột chiên giòn", calMult: 4.5, proMult: 1.0, fatMult: 15.0, carbsMult: 1.5 }
  ];

  // Veggie combinations -> 21 * 5 = 105 món
  for (const vg of veggies) {
    for (const c of veggieCookMethods) {
      foods.push({
        name: `${vg.name}${c.suffix}`,
        brand: "Chợ Việt",
        servingSizeG: 100,
        calories: Math.round(vg.calories * c.calMult),
        proteinG: Math.round(vg.protein * c.proMult * 10) / 10,
        carbsG: Math.round(vg.carbs * c.carbsMult * 10) / 10,
        fatG: Math.round(vg.fat * c.fatMult * 10) / 10,
        metadata: { source: "NIN_VN", category: "Rau củ quả" }
      });
    }
  }

  // 6. Trái cây (Base: 100g)
  const fruits = [
    { name: "Chuối sứ chín ngọt", calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3 },
    { name: "Chuối Laba chín vàng", calories: 92, protein: 1.2, carbs: 23.5, fat: 0.3 },
    { name: "Táo đỏ chín giòn", calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2 },
    { name: "Táo xanh Ninh Thuận giòn", calories: 37, protein: 0.8, carbs: 9.2, fat: 0.2 },
    { name: "Quả bơ sáp chín ngậy", calories: 160, protein: 2.0, carbs: 8.5, fat: 14.7 },
    { name: "Cam sành chín vắt nước", calories: 45, protein: 0.9, carbs: 10.4, fat: 0.1 },
    { name: "Dưa hấu tươi mát ngọt", calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2 },
    { name: "Xoài cát chín ngọt lịm", calories: 60, protein: 0.8, carbs: 15.0, fat: 0.4 },
    { name: "Xoài xanh thái chua giòn", calories: 50, protein: 0.5, carbs: 11.5, fat: 0.2 },
    { name: "Đu đủ mật chín đỏ ngọt", calories: 43, protein: 0.5, carbs: 10.8, fat: 0.3 },
    { name: "Ổi ruột hồng giòn ngon", calories: 68, protein: 2.6, carbs: 14.3, fat: 0.9 },
    { name: "Dứa (Thơm) mật chín chua ngọt", calories: 50, protein: 0.5, carbs: 13.1, fat: 0.1 },
    { name: "Bưởi Da Xanh ngọt mát", calories: 38, protein: 0.8, carbs: 9.6, fat: 0.1 },
    { name: "Vú sữa Lò Rèn chín vú sữa", calories: 61, protein: 1.0, carbs: 14.2, fat: 0.5 },
    { name: "Lê ngọt cát thơm nhập khẩu", calories: 57, protein: 0.4, carbs: 15.2, fat: 0.1 },
    { name: "Thanh long ruột đỏ thơm ngọt", calories: 54, protein: 1.4, carbs: 12.0, fat: 0.4 },
    { name: "Thanh long ruột trắng tươi mát", calories: 50, protein: 1.2, carbs: 11.5, fat: 0.3 },
    { name: "Dâu tây Đà Lạt đỏ mọng", calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3 },
    { name: "Nhãn xuồng chín cùi dày", calories: 60, protein: 1.0, carbs: 15.0, fat: 0.1 },
    { name: "Vải thiều Lục Ngạn chín ngọt", calories: 66, protein: 0.8, carbs: 16.5, fat: 0.4 },
    { name: "Măng cụt chín cùi chua ngọt", calories: 73, protein: 0.4, carbs: 18.0, fat: 0.6 },
    { name: "Chôm chôm chín vườn thơm", calories: 82, protein: 0.9, carbs: 20.9, fat: 0.2 },
    { name: "Sầu riêng Ri6 thơm béo ngậy", calories: 147, protein: 1.4, carbs: 27.1, fat: 5.3 }
  ];

  const fruitStates = [
    { suffix: " ăn tươi trực tiếp", calMult: 1.0, proMult: 1.0, fatMult: 1.0, carbsMult: 1.0 },
    { suffix: " sấy khô giòn tự nhiên", calMult: 3.5, proMult: 3.0, fatMult: 3.0, carbsMult: 3.5 },
    { suffix: " dầm sữa chua ít béo", calAdd: 120, proAdd: 3.0, fatAdd: 2.5, carbsAdd: 22.0 },
    { suffix: " sinh tố đá xay sữa đặc", calAdd: 95, proAdd: 1.2, fatAdd: 1.8, carbsAdd: 18.5 }
  ];

  // Fruits combination -> 23 * 4 = 92 món
  for (const fr of fruits) {
    for (const c of fruitStates) {
      foods.push({
        name: `${fr.name}${c.suffix}`,
        brand: "Trái Cây Việt",
        servingSizeG: 100,
        calories: Math.round((fr.calories * (c.calMult || 1.0)) + (c.calAdd || 0)),
        proteinG: Math.round((fr.protein * (c.proMult || 1.0) + (c.proAdd || 0)) * 10) / 10,
        carbsG: Math.round((fr.carbs * (c.carbsMult || 1.0) + (c.carbsAdd || 0)) * 10) / 10,
        fatG: Math.round((fr.fat * (c.fatMult || 1.0) + (c.fatAdd || 0)) * 10) / 10,
        metadata: { source: "NIN_VN", category: "Trái cây" }
      });
    }
  }

  // 7. Món ăn ngoài hàng chế biến sẵn (Base: 1 Tô/Dĩa chuẩn)
  const dishes = [
    { name: "Phở bò chín tái", calories: 450, protein: 24, carbs: 58, fat: 12, servingSizeG: 500, brand: "Tiệm Phở" },
    { name: "Phở bò nạm gầu thơm ngậy", calories: 490, protein: 26, carbs: 58, fat: 15, servingSizeG: 550, brand: "Tiệm Phở" },
    { name: "Phở bò gầu béo nhiều hành", calories: 560, protein: 25, carbs: 58, fat: 22, servingSizeG: 550, brand: "Tiệm Phở" },
    { name: "Phở bò đặc biệt hành trần trứng", calories: 680, protein: 32, carbs: 62, fat: 28, servingSizeG: 650, brand: "Tiệm Phở" },
    { name: "Phở gà lườn xé nạc ít béo", calories: 410, protein: 28, carbs: 55, fat: 8, servingSizeG: 500, brand: "Tiệm Phở" },
    { name: "Phở gà đặc biệt trứng non trần", calories: 580, protein: 32, carbs: 57, fat: 20, servingSizeG: 600, brand: "Tiệm Phở" },
    { name: "Bún bò Huế giò heo chả cua", calories: 580, protein: 25, carbs: 65, fat: 22, servingSizeG: 600, brand: "Tiệm Bún" },
    { name: "Bún bò Huế đặc biệt thập cẩm bò", calories: 680, protein: 30, carbs: 68, fat: 27, servingSizeG: 650, brand: "Tiệm Bún" },
    { name: "Bún riêu cua giò heo đậu chiên", calories: 480, protein: 22, carbs: 54, fat: 18, servingSizeG: 550, brand: "Tiệm Bún" },
    { name: "Bún đậu mắm tôm thập cẩm chiên", calories: 720, protein: 28, carbs: 75, fat: 32, servingSizeG: 450, brand: "Quán Ăn Vặt" },
    { name: "Cơm tấm sườn cốt lết nướng", calories: 540, protein: 24, carbs: 70, fat: 16, servingSizeG: 350, brand: "Tiệm Cơm Tấm" },
    { name: "Cơm tấm sườn bì chả truyền thống", calories: 740, protein: 32, carbs: 78, fat: 28, servingSizeG: 400, brand: "Tiệm Cơm Tấm" },
    { name: "Cơm tấm sườn chả trứng ốp la", calories: 890, protein: 38, carbs: 82, fat: 38, servingSizeG: 450, brand: "Tiệm Cơm Tấm" },
    { name: "Bún chả Hà Nội chả viên chả miếng", calories: 590, protein: 25, carbs: 68, fat: 21, servingSizeG: 450, brand: "Quán Bún Chả" },
    { name: "Hủ tiếu Nam Vang nước tôm thịt", calories: 480, protein: 20, carbs: 62, fat: 14, servingSizeG: 550, brand: "Tiệm Hủ Tiếu" },
    { name: "Hủ tiếu Nam Vang khô trộn tóp mỡ", calories: 540, protein: 22, carbs: 68, fat: 18, servingSizeG: 500, brand: "Tiệm Hủ Tiếu" },
    { name: "Bánh mì kẹp pate bơ chả lụa", calories: 420, protein: 14, carbs: 48, fat: 18, servingSizeG: 150, brand: "Tiệm Bánh Mì" },
    { name: "Bánh mì kẹp heo quay giòn bì nước sốt", calories: 520, protein: 18, carbs: 50, fat: 25, servingSizeG: 180, brand: "Tiệm Bánh Mì" },
    { name: "Bánh mì trứng ốp la hành ngò (2 trứng)", calories: 380, protein: 15, carbs: 42, fat: 16, servingSizeG: 150, brand: "Tiệm Bánh Mì" },
    { name: "Xôi mặn xúc xích chả lụa ruốc", calories: 510, protein: 16, carbs: 72, fat: 16, servingSizeG: 200, brand: "Hàng Xôi" },
    { name: "Xôi xéo đỗ xanh mỡ hành hành phi", calories: 460, protein: 10, carbs: 75, fat: 12, servingSizeG: 180, brand: "Hàng Xôi" },
    { name: "Xôi gà xé phay hành phi giòn", calories: 550, protein: 22, carbs: 70, fat: 18, servingSizeG: 220, brand: "Hàng Xôi" },
    { name: "Bánh cuốn thịt băm mộc nhĩ hành phi", calories: 350, protein: 12, carbs: 52, fat: 9, servingSizeG: 250, brand: "Quán Bánh Cuốn" },
    { name: "Bánh xèo tôm thịt miền Tây giòn ngon", calories: 650, protein: 18, carbs: 72, fat: 30, servingSizeG: 300, brand: "Quán Bánh Xèo" },
    { name: "Gỏi cuốn tôm thịt cuốn bún (1 cuốn)", calories: 80, protein: 4.5, carbs: 9.5, fat: 2.0, servingSizeG: 50, brand: "Quán Gỏi Cuốn" },
    { name: "Miến gà nước xương gà thanh thanh", calories: 410, protein: 24, carbs: 56, fat: 9, servingSizeG: 500, brand: "Tiệm Miến" },
    { name: "Miến lươn khô giòn trộn giá", calories: 490, protein: 20, carbs: 62, fat: 16, servingSizeG: 450, brand: "Tiệm Miến" },
    { name: "Cháo lòng heo tiết trần thơm", calories: 412, protein: 22, carbs: 44, fat: 15, servingSizeG: 500, brand: "Quán Cháo Lòng" },
    { name: "Cơm gà xối mỡ tỏi giòn đùi tỏi", calories: 820, protein: 32, carbs: 85, fat: 36, servingSizeG: 400, brand: "Tiệm Cơm Gà" }
  ];

  const dishPortionSizes = [
    { prefix: "", sizeMult: 1.0 },
    { prefix: "Tô nhỏ / Dĩa nhỏ (Small size) ", sizeMult: 0.75 },
    { prefix: "Tô vừa / Dĩa vừa (Standard size) ", sizeMult: 1.0 },
    { prefix: "Tô lớn / Dĩa lớn (Giant size) ", sizeMult: 1.3 },
    { prefix: "Gấp đôi lượng thịt (Double Protein) ", sizeMult: 1.2, proAdd: 12, fatAdd: 6 }
  ];

  // Dishes combinations -> 29 * 5 = 145 món
  for (const ds of dishes) {
    for (const p of dishPortionSizes) {
      foods.push({
        name: `${p.prefix}${ds.name}`,
        brand: ds.brand,
        servingSizeG: Math.round(ds.servingSizeG * p.sizeMult),
        calories: Math.round(ds.calories * p.sizeMult + (p.fatAdd ? p.fatAdd * 9 + p.proAdd * 4 : 0)),
        proteinG: Math.round((ds.protein * p.sizeMult + (p.proAdd || 0)) * 10) / 10,
        carbsG: Math.round((ds.carbs * p.sizeMult) * 10) / 10,
        fatG: Math.round((ds.fat * p.sizeMult + (p.fatAdd || 0)) * 10) / 10,
        metadata: { source: "NIN_VN", category: "Món ăn tiệm / Chế biến sẵn" }
      });
    }
  }

  // 8. Đồ uống & Sữa dinh dưỡng (Base: 100ml)
  const drinks = [
    { name: "Sữa tươi tiệt trùng Vinamilk không đường", calories: 50, protein: 3.0, carbs: 4.5, fat: 2.2, brand: "Vinamilk" },
    { name: "Sữa tươi tiệt trùng Vinamilk có đường", calories: 76, protein: 2.9, carbs: 9.8, fat: 2.2, brand: "Vinamilk" },
    { name: "Sữa tươi tiệt trùng Vinamilk ít đường", calories: 65, protein: 3.0, carbs: 7.2, fat: 2.2, brand: "Vinamilk" },
    { name: "Sữa tươi tiệt trùng TH True Milk không đường", calories: 50, protein: 3.0, carbs: 4.5, fat: 2.2, brand: "TH True Milk" },
    { name: "Sữa tươi tiệt trùng TH True Milk có đường", calories: 75, protein: 2.9, carbs: 9.5, fat: 2.2, brand: "TH True Milk" },
    { name: "Sữa tươi tiệt trùng TH True Milk ít đường", calories: 64, protein: 3.0, carbs: 7.0, fat: 2.2, brand: "TH True Milk" },
    { name: "Sữa tươi nguyên chất tiệt trùng Long Thành", calories: 68, protein: 3.2, carbs: 4.8, fat: 3.5, brand: "Lothamilk" },
    { name: "Sữa tươi organic thanh trùng TH True Milk", calories: 60, protein: 3.1, carbs: 4.6, fat: 3.2, brand: "TH True Milk" },
    { name: "Sữa lúa mạch Milo hộp giấy sô-cô-la", calories: 70, protein: 1.8, carbs: 11.2, fat: 1.8, brand: "Nestle" },
    { name: "Sữa đậu nành Fami dinh dưỡng có đường", calories: 54, protein: 2.1, carbs: 7.2, fat: 1.6, brand: "Vinasoy" },
    { name: "Sữa đậu nành Fami ít đường thơm ngon", calories: 36, protein: 2.3, carbs: 2.8, fat: 1.7, brand: "Vinasoy" },
    { name: "Nước ngọt Coca Cola giải khát lon", calories: 42, protein: 0, carbs: 10.6, fat: 0, brand: "Coca Cola" },
    { name: "Nước ngọt Pepsi giải khát lon", calories: 44, protein: 0, carbs: 11.0, fat: 0, brand: "Pepsi" },
    { name: "Nước ngọt Coca Cola Zero (0 kcal)", calories: 0, protein: 0, carbs: 0, fat: 0, brand: "Coca Cola" },
    { name: "Nước ngọt Pepsi Light (0 kcal)", calories: 0, protein: 0, carbs: 0, fat: 0, brand: "Pepsi" },
    { name: "Nước tăng lực Redbull Thái bò húc", calories: 75, protein: 0.3, carbs: 18.0, fat: 0, brand: "Redbull" },
    { name: "Trà sữa trân châu sữa tươi Gong Cha", calories: 95, protein: 1.0, carbs: 16.5, fat: 2.8, brand: "Gong Cha" },
    { name: "Trà đào chanh sả đá mát", calories: 45, protein: 0.1, carbs: 11.0, fat: 0, brand: "The Coffee House" }
  ];

  const drinkPackSizes = [
    { prefix: "Hộp nhỏ 110ml ", mult: 1.1 },
    { prefix: "Hộp tiêu chuẩn 180ml ", mult: 1.8 },
    { prefix: "Bịch giấy giấy 220ml ", mult: 2.2 },
    { prefix: "Ly lớn giải khát 500ml ", mult: 5.0 },
    { prefix: "Phần lẻ 100ml ", mult: 1.0 }
  ];

  // Drinks combinations -> 18 * 5 = 90 món
  for (const dr of drinks) {
    for (const p of drinkPackSizes) {
      foods.push({
        name: `${p.prefix}${dr.name}`,
        brand: dr.brand,
        servingSizeG: Math.round(100 * p.mult),
        calories: Math.round(dr.calories * p.mult),
        proteinG: Math.round((dr.protein * p.mult) * 10) / 10,
        carbsG: Math.round((dr.carbs * p.mult) * 10) / 10,
        fatG: Math.round((dr.fat * p.mult) * 10) / 10,
        metadata: { source: "NIN_VN", category: "Sữa & Đồ uống" }
      });
    }
  }

  // 9. Thực phẩm thể hình & Supps (Base: 1 Scoop/Serving chuẩn)
  const supps = [
    { name: "Whey Gold Standard Protein", calories: 120, protein: 24, carbs: 3, fat: 1.5, servingSizeG: 32, brand: "Optimum Nutrition" },
    { name: "Whey Protein Rule 1 R1 Protein", calories: 110, protein: 25, carbs: 1, fat: 0, servingSizeG: 30, brand: "Rule 1 Proteins" },
    { name: "ISO HD Whey Protein cô đặc", calories: 120, protein: 25, carbs: 2, fat: 1.0, servingSizeG: 33, brand: "BPI Sports" },
    { name: "ISO Surge Whey Protein Isolate tinh khiết", calories: 120, protein: 25, carbs: 1, fat: 1.0, servingSizeG: 31, brand: "Mutant" },
    { name: "Myprotein Impact Whey Protein nạc cơ", calories: 103, protein: 21, carbs: 1, fat: 1.9, servingSizeG: 25, brand: "Myprotein" },
    { name: "Mass Gainer Serious Mass tăng cân nhanh", calories: 1250, protein: 50, carbs: 252, fat: 4.5, servingSizeG: 336, brand: "Optimum Nutrition" },
    { name: "Mass Gainer Mutant Mass xịn", calories: 1100, protein: 56, carbs: 192, fat: 12.0, servingSizeG: 280, brand: "Mutant" },
    { name: "Mass Gainer Super Mass Gainer nhiều calo", calories: 1280, protein: 52, carbs: 246, fat: 9.0, servingSizeG: 340, brand: "Dymatize" },
    { name: "EAA / BCAA Amino Recovery hồi phục cơ bắp", calories: 0, protein: 0, carbs: 0, fat: 0, servingSizeG: 14, brand: "Scivation Xtend" },
    { name: "BCAA Rule 1 Essential Amino tăng thể lực", calories: 5, protein: 0, carbs: 1, fat: 0, servingSizeG: 11, brand: "Rule 1 Proteins" },
    { name: "Creatine Monohydrate Pure tăng sức mạnh cơ", calories: 0, protein: 0, carbs: 0, fat: 0, servingSizeG: 5, brand: "Myprotein" },
    { name: "Pre-workout Outlift Extreme kích thích cơ", calories: 10, protein: 0, carbs: 2, fat: 0, servingSizeG: 25, brand: "Nutrex Research" },
    { name: "Pre-workout The Curse! bùng nổ năng lượng", calories: 5, protein: 0, carbs: 1, fat: 0, servingSizeG: 5, brand: "JNX Sports" }
  ];

  const flavors = [
    " hương vị Chocolate (Sô-cô-la ngậy)",
    " hương vị Vanilla (Vani thơm dịu)",
    " hương vị Dâu tây (Strawberry ngọt mát)",
    " hương vị Cookies & Cream béo thơm",
    " hương vị Chuối chín (Banana béo ngọt)",
    " hương vị Trà xanh Matcha thanh nhẹ",
    " hương vị Không mùi tự nhiên nguyên bản",
    " hương vị Việt quất chua ngọt thơm",
    " hương vị Dừa dứa (Pina Colada nhiệt đới)",
    " hương vị Cam đào chua ngọt thanh mát",
    " hương vị Táo xanh quả mọng chua cay"
  ];

  // Supplements combinations -> 13 * 11 = 143 món
  for (const sp of supps) {
    for (const fl of flavors) {
      foods.push({
        name: `${sp.name}${fl}`,
        brand: sp.brand,
        servingSizeG: sp.servingSizeG,
        calories: sp.calories,
        proteinG: sp.protein,
        carbsG: sp.carbs,
        fatG: sp.fat,
        metadata: { source: "GymSupp", category: "Thực phẩm bổ sung" }
      });
    }
  }

  // 10. Ăn vặt & Fastfood Việt Nam (Base: 100g)
  const snacks = [
    { name: "Bánh tráng trộn bò khô trứng cút hành phi", calories: 380, protein: 8.5, carbs: 54.0, fat: 15.0, brand: "Quán Ăn Vặt" },
    { name: "Cá viên chiên bơ tỏi ngọt (1 cây 5 viên)", calories: 120, protein: 4.2, carbs: 12.0, fat: 6.5, brand: "Quán Ăn Vặt" },
    { name: "Hồ lô nướng sốt tương đỏ (1 xiên)", calories: 150, protein: 6.8, carbs: 8.0, fat: 10.0, brand: "Quán Ăn Vặt" },
    { name: "Bánh tráng nướng mỡ hành trứng xúc xích", calories: 250, protein: 7.2, carbs: 32.0, fat: 10.5, brand: "Quán Ăn Vặt" },
    { name: "Bánh bông lan bơ ruốc trứng muối phô mai", calories: 320, protein: 9.0, carbs: 45.0, fat: 12.0, brand: "Hàng Bánh" },
    { name: "Gà rán KFC đùi tỏi lớn tẩm bột", calories: 290, protein: 19.0, carbs: 12.0, fat: 18.0, brand: "KFC" },
    { name: "Gà rán KFC ức gà phi lê chiên xù", calories: 360, protein: 32.0, carbs: 14.0, fat: 20.0, brand: "KFC" },
    { name: "Khoai tây chiên KFC tẩm muối", calories: 220, protein: 3.0, carbs: 28.0, fat: 11.0, brand: "KFC" },
    { name: "Hamberger bò Mc Donald phô mai trứng", calories: 450, protein: 22.0, carbs: 40.0, fat: 22.0, brand: "McDonald's" },
    { name: "Pizza hải sản viền phô mai nhỏ (1/4 bánh)", calories: 340, protein: 14.0, carbs: 42.0, fat: 12.0, brand: "Pizza Hut" },
    { name: "Chè thái sầu riêng nước cốt dừa thơm", calories: 380, protein: 3.5, carbs: 68.0, fat: 10.5, brand: "Tiệm Chè" },
    { name: "Chè chuối nước cốt dừa hạt lựu dẻo", calories: 290, protein: 2.0, carbs: 55.0, fat: 7.0, brand: "Tiệm Chè" },
    { name: "Hột vịt lộn luộc kèm rau răm muối tiêu (1 trứng)", calories: 182, protein: 13.6, carbs: 2.1, fat: 12.4, brand: "Quán Bình Dân" }
  ];

  const snackSizes = [
    { prefix: "", mult: 1.0 },
    { prefix: "Hộp lớn / Phần đầy đủ thịnh soạn ", mult: 1.5 },
    { prefix: "Phần nhỏ ăn thử mini ", mult: 0.65 },
    { prefix: "Khẩu phần chuẩn 100g ", mult: 1.0 },
    { prefix: "Combo đặc biệt siêu nhiều topping ", mult: 1.8 }
  ];

  // Snacks combinations -> 13 * 5 = 65 món
  for (const sn of snacks) {
    for (const s of snackSizes) {
      foods.push({
        name: `${s.prefix}${sn.name}`,
        brand: sn.brand,
        servingSizeG: Math.round(100 * s.mult),
        calories: Math.round(sn.calories * s.mult),
        proteinG: Math.round((sn.protein * s.mult) * 10) / 10,
        carbsG: Math.round((sn.carbs * s.mult) * 10) / 10,
        fatG: Math.round((sn.fat * s.mult) * 10) / 10,
        metadata: { source: "SnackVN", category: "Ăn vặt & Fastfood" }
      });
    }
  }

  // Cắt bớt hoặc chèn thêm để bảo đảm có đúng chẵn 1,000 món trong DB
  while (foods.length < 1000) {
    // Nhân bản thêm một số món ăn kèm tiền tố
    const baseFood = foods[foods.length % 500];
    foods.push({
      ...baseFood,
      name: `Ăn kèm bữa phụ - ${baseFood.name}`,
      metadata: { ...baseFood.metadata, replica: true }
    });
  }
  
  if (foods.length > 1000) {
    foods.splice(1000);
  }

  console.log(`📋 Tổng số món ăn đã tạo trong danh sách: ${foods.length}`);

  // Xóa trắng dữ liệu cũ tránh trùng lặp
  console.log("🧹 Đang xóa trắng bảng food_items hiện tại...");
  await prisma.foodItem.deleteMany({});

  // Thực hiện Seed số lượng lớn bằng createMany cực nhanh (1 truy vấn)
  console.log("🚀 Đang đưa 1,000 món ăn vào database...");
  await prisma.foodItem.createMany({
    data: foods
  });

  console.log("🌱 Gieo mầm dữ liệu thức ăn (1,000 món chuẩn Việt) thành công!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Kết nối tự động đóng khi kết thúc tiến trình
  });
