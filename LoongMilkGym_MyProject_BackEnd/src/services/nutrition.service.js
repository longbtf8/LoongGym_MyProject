const { prisma } = require("@/lib/prisma");
const AppError = require("@/utils/AppError");
const { httpCodes } = require("@/config/constants");

// Helper to normalize dates to midnight UTC to prevent timezone shifts
const normalizeDate = (dateStr) => {
  const date = new Date(dateStr);
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
};

const getTodayNutrition = async (userId, dateStr) => {
  const targetDateStr = dateStr || new Date().toISOString().split("T")[0];
  const targetDate = normalizeDate(targetDateStr);

  // 1. Get nutrition target
  const target = await prisma.nutritionTarget.findUnique({
    where: {
      userId_targetDate: {
        userId,
        targetDate,
      },
    },
  });

  // 2. Get meal logs with items
  const mealLogs = await prisma.mealLog.findMany({
    where: {
      userId,
      mealDate: targetDate,
    },
    include: {
      items: {
        include: {
          foodItem: true,
        },
      },
    },
  });

  // 3. Compute totals
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  mealLogs.forEach((log) => {
    log.items.forEach((item) => {
      totalCalories += item.calories || 0;
      totalProtein += Number(item.proteinG) || 0;
      totalCarbs += Number(item.carbsG) || 0;
      totalFat += Number(item.fatG) || 0;
    });
  });

  return {
    targetDate: targetDateStr,
    target: target || {
      caloriesTarget: 2000,
      proteinGTarget: 150,
      carbsGTarget: 200,
      fatGTarget: 60,
      fiberGTarget: 25,
      waterMlTarget: 2000,
    },
    mealLogs,
    totals: {
      calories: totalCalories,
      protein: Math.round(totalProtein * 100) / 100,
      carbs: Math.round(totalCarbs * 100) / 100,
      fat: Math.round(totalFat * 100) / 100,
    },
  };
};

const saveNutritionTarget = async (userId, data) => {
  const targetDate = normalizeDate(data.targetDate);

  return prisma.nutritionTarget.upsert({
    where: {
      userId_targetDate: {
        userId,
        targetDate,
      },
    },
    update: {
      caloriesTarget: data.caloriesTarget,
      proteinGTarget: data.proteinGTarget,
      carbsGTarget: data.carbsGTarget,
      fatGTarget: data.fatGTarget,
      fiberGTarget: data.fiberGTarget,
      waterMlTarget: data.waterMlTarget,
    },
    create: {
      userId,
      targetDate,
      caloriesTarget: data.caloriesTarget,
      proteinGTarget: data.proteinGTarget,
      carbsGTarget: data.carbsGTarget,
      fatGTarget: data.fatGTarget,
      fiberGTarget: data.fiberGTarget,
      waterMlTarget: data.waterMlTarget,
    },
  });
};

const createMealLog = async (userId, data) => {
  const mealDate = normalizeDate(data.mealDate);

  return prisma.mealLog.create({
    data: {
      userId,
      mealDate,
      mealType: data.mealType,
      note: data.note,
    },
  });
};

const addMealLogItem = async (userId, mealLogId, data) => {
  // 1. Verify meal log ownership
  const mealLog = await prisma.mealLog.findUnique({
    where: { id: mealLogId },
  });

  if (!mealLog) {
    throw new AppError("Không tìm thấy nhật ký bữa ăn.", httpCodes.notFound);
  }

  if (mealLog.userId !== userId) {
    throw new AppError("Bạn không có quyền chỉnh sửa nhật ký này.", httpCodes.forbidden);
  }

  let finalName = data.customFoodName;
  let finalCalories = data.calories || 0;
  let finalProtein = data.proteinG || 0;
  let finalCarbs = data.carbsG || 0;
  let finalFat = data.fatG || 0;

  // 2. Fetch food item from library if present
  if (data.foodItemId) {
    const foodItem = await prisma.foodItem.findUnique({
      where: { id: data.foodItemId },
    });

    if (!foodItem) {
      throw new AppError("Không tìm thấy món ăn trong thư viện.", httpCodes.notFound);
    }

    finalName = foodItem.name;
    const servingSize = Number(foodItem.servingSizeG) || 100;
    const factor = data.quantityG / servingSize;

    finalCalories = Math.round((foodItem.calories || 0) * factor);
    finalProtein = Math.round((Number(foodItem.proteinG) || 0) * factor * 100) / 100;
    finalCarbs = Math.round((Number(foodItem.carbsG) || 0) * factor * 100) / 100;
    finalFat = Math.round((Number(foodItem.fatG) || 0) * factor * 100) / 100;
  }

  // 3. Create meal log item
  return prisma.mealLogItem.create({
    data: {
      mealLogId,
      foodItemId: data.foodItemId || null,
      customFoodName: finalName,
      quantityG: data.quantityG,
      calories: finalCalories,
      proteinG: finalProtein,
      carbsG: finalCarbs,
      fatG: finalFat,
    },
  });
};

const deleteMealLogItem = async (userId, itemId) => {
  const item = await prisma.mealLogItem.findUnique({
    where: { id: itemId },
    include: {
      mealLog: true,
    },
  });

  if (!item) {
    throw new AppError("Không tìm thấy món ăn trong nhật ký.", httpCodes.notFound);
  }

  if (item.mealLog.userId !== userId) {
    throw new AppError("Bạn không có quyền xóa món ăn này.", httpCodes.forbidden);
  }

  return prisma.mealLogItem.delete({
    where: { id: itemId },
  });
};

const fetchWithTimeout = async (url, options = {}, timeout = 2500) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

const isLiquidByName = (name) => {
  if (!name) return false;
  const lowerName = name.toLowerCase();
  if (lowerName.includes("vú sữa")) return false;
  if (lowerName.includes("bánh sữa")) return false;
  if (lowerName.includes("kẹo sữa")) return false;
  if (lowerName.includes("sữa chua khô")) return false;
  
  const liquidKeywords = [
    "nước", "sữa", "bia", "rượu", "beverage", "drink", "water", "juice", "soda", "coke", 
    "milk", "yogurt drink", "tea", "coffee", "trà", "cà phê", "cafe", "sting", "pepsi", "coca", "redbull",
    "monster", "monter", "chất lỏng", "canh", "súp", "soup", "smoothie", "shake", "nước ngọt"
  ];
  return liquidKeywords.some(keyword => lowerName.includes(keyword));
};

const detectFoodUnitAndSize = (p) => {
  let unit = "g";
  let size = 100;

  // 1. Try to read serving_size string (e.g. "250 ml", "100 g", "330ml")
  const servingSizeStr = ((p.serving_size || p.quantity || "") + "").toLowerCase();
  
  if (
    servingSizeStr.includes("ml") || 
    servingSizeStr.includes(" l") || 
    servingSizeStr.includes("cl") ||
    servingSizeStr.includes("fluid") ||
    servingSizeStr.includes("oz")
  ) {
    unit = "ml";
  } else {
    // Check categories or name for beverage/drink keywords
    const categoriesList = p.categories_tags || [];
    const categoriesStr = (Array.isArray(categoriesList) ? categoriesList.join(", ") : (p.categories || "")).toLowerCase();
    const nameStr = ((p.product_name_vi || p.product_name || "") + "").toLowerCase();
    
    if (isLiquidByName(nameStr) || isLiquidByName(categoriesStr)) {
      unit = "ml";
    }
  }

  // 2. Try to parse serving size quantity
  if (p.serving_quantity) {
    const parsed = Number(p.serving_quantity);
    if (!isNaN(parsed) && parsed > 0) {
      size = parsed;
    }
  } else {
    // Try to extract number from serving_size string (e.g. "250 ml" -> 250)
    const match = servingSizeStr.match(/(\d+[\.,]?\d*)\s*(ml|g|l|cl)/);
    if (match) {
      const val = parseFloat(match[1].replace(",", "."));
      if (!isNaN(val) && val > 0) {
        if (match[2] === "l") {
          size = val * 1000; // convert L to ml
        } else {
          size = val;
        }
      }
    }
  }

  return { unit, size };
};

const searchFoods = async (searchQuery) => {
  const query = searchQuery ? searchQuery.trim() : "";
  if (!query) {
    const list = await prisma.foodItem.findMany({
      take: 20,
      orderBy: { name: "asc" },
    });
    return list.map((item) => {
      let imageUrl = null;
      let unit = "g";
      if (item.metadata) {
        try {
          const meta = typeof item.metadata === "string" ? JSON.parse(item.metadata) : item.metadata;
          imageUrl = meta?.imageUrl || null;
          unit = meta?.unit || "g";
        } catch {}
      }
      return { ...item, imageUrl, unit };
    });
  }

  // 1. Local Search
  const localFoods = await prisma.foodItem.findMany({
    where: {
      name: {
        contains: query,
      },
    },
    take: 10,
    orderBy: { name: "asc" },
  });

  const formattedLocalFoods = localFoods.map((item) => {
    let imageUrl = null;
    let unit = "g";
    if (item.metadata) {
      try {
        const meta = typeof item.metadata === "string" ? JSON.parse(item.metadata) : item.metadata;
        imageUrl = meta?.imageUrl || null;
        unit = meta?.unit || "g";
      } catch {}
    }
    return { ...item, imageUrl, unit };
  });

  // 2. Open Food Facts API Search (only if search query is at least 2 chars)
  let externalFoods = [];
  if (query.length >= 2) {
    try {
      const res = await fetchWithTimeout(
        `https://vn.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10`
      );
      if (res.ok) {
        const data = await res.json();
        const products = data.products || [];
        externalFoods = products
          .filter((p) => p.product_name || p.product_name_vi)
          .map((p) => {
            const name = p.product_name_vi || p.product_name || "Món ăn";
            const brand = p.brands || "";
            const nutriments = p.nutriments || {};
            const calories = Math.round(Number(nutriments["energy-kcal_100g"] || nutriments["energy-kcal_serving"] || 0));
            const protein = Number(nutriments.proteins_100g || nutriments.proteins || 0);
            const carbs = Number(nutriments.carbohydrates_100g || nutriments.carbohydrates || 0);
            const fat = Number(nutriments.fat_100g || nutriments.fat || 0);
            const imageUrl = p.image_front_small_url || p.image_small_url || p.image_url || null;
            
            const { unit, size } = detectFoodUnitAndSize(p);

            return {
              id: `ext-${p.code || Math.random().toString(36).substring(2, 9)}`,
              name: brand ? `${name} (${brand})` : name,
              brand: brand || null,
              servingSizeG: size,
              calories,
              proteinG: protein,
              carbsG: carbs,
              fatG: fat,
              isExternal: true,
              barcode: p.code || null,
              imageUrl,
              unit,
            };
          });
      }
    } catch (err) {
      // Ignore external search failures to ensure local search is resilient
    }
  }

  // Merge results
  const combined = [...formattedLocalFoods];
  externalFoods.forEach((ext) => {
    if (!combined.some((loc) => loc.name.toLowerCase() === ext.name.toLowerCase())) {
      combined.push(ext);
    }
  });

  return combined.slice(0, 15);
};

const getFoodByBarcode = async (barcode) => {
  const cleanBarcode = barcode.trim();
  if (!cleanBarcode) {
    throw new AppError("Mã vạch không hợp lệ.", httpCodes.badRequest);
  }

  // 1. Check local DB first using findMany and JS filter for maximum safety
  const allFoods = await prisma.foodItem.findMany();
  const localItem = allFoods.find((item) => {
    try {
      const meta = typeof item.metadata === "string" ? JSON.parse(item.metadata) : item.metadata;
      return meta && meta.barcode === cleanBarcode;
    } catch {
      return false;
    }
  });

  if (localItem) {
    let imageUrl = null;
    let unit = "g";
    try {
      const meta = typeof localItem.metadata === "string" ? JSON.parse(localItem.metadata) : localItem.metadata;
      imageUrl = meta?.imageUrl || null;
      unit = meta?.unit || "g";
    } catch {}
    return {
      ...localItem,
      imageUrl,
      unit,
    };
  }

  // 2. Fetch from Open Food Facts barcode API
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`);
    if (res.ok) {
      const data = await res.json();
      if (data.status === 1 && data.product) {
        const p = data.product;
        const name = p.product_name_vi || p.product_name || "Món ăn quét mã";
        const brand = p.brands || "";
        const nutriments = p.nutriments || {};
        const calories = Math.round(Number(nutriments["energy-kcal_100g"] || nutriments["energy-kcal_serving"] || 0));
        const protein = Number(nutriments.proteins_100g || nutriments.proteins || 0);
        const carbs = Number(nutriments.carbohydrates_100g || nutriments.carbohydrates || 0);
        const fat = Number(nutriments.fat_100g || nutriments.fat || 0);
        const imageUrl = p.image_front_small_url || p.image_small_url || p.image_url || null;

        const { unit, size } = detectFoodUnitAndSize(p);

        // Save to local cache
        const cachedFood = await prisma.foodItem.create({
          data: {
            name: brand ? `${name} (${brand})` : name,
            brand: brand || null,
            servingSizeG: size,
            calories,
            proteinG: protein,
            carbsG: carbs,
            fatG: fat,
            metadata: {
              barcode: cleanBarcode,
              source: "openfoodfacts",
              imageUrl,
              unit,
            },
          },
        });

        return {
          ...cachedFood,
          imageUrl,
          unit,
        };
      }
    }
  } catch (err) {
    // Ignore and let it fall through
  }

  throw new AppError("Không tìm thấy món ăn cho mã vạch này. Bạn hãy nhập tay thủ công nhé!", httpCodes.notFound);
};

const createOrGetFoodItem = async (data) => {
  // Check if it already exists in DB by barcode or exact name
  if (data.barcode) {
    const allFoods = await prisma.foodItem.findMany();
    const existing = allFoods.find((item) => {
      try {
        const meta = typeof item.metadata === "string" ? JSON.parse(item.metadata) : item.metadata;
        return meta && meta.barcode === data.barcode;
      } catch {
        return false;
      }
    });

    if (existing) {
      let imageUrl = null;
      let unit = "g";
      try {
        const meta = typeof existing.metadata === "string" ? JSON.parse(existing.metadata) : existing.metadata;
        imageUrl = meta?.imageUrl || null;
        unit = meta?.unit || "g";
      } catch {}
      return {
        ...existing,
        imageUrl,
        unit,
      };
    }
  }

  const existingByName = await prisma.foodItem.findFirst({
    where: { name: data.name },
  });

  if (existingByName) {
    let imageUrl = null;
    let unit = "g";
    try {
      const meta = typeof existingByName.metadata === "string" ? JSON.parse(existingByName.metadata) : existingByName.metadata;
      imageUrl = meta?.imageUrl || null;
      unit = meta?.unit || "g";
    } catch {}
    return {
      ...existingByName,
      imageUrl,
      unit,
    };
  }

  // Otherwise create it
  const created = await prisma.foodItem.create({
    data: {
      name: data.name,
      brand: data.brand || null,
      servingSizeG: data.servingSizeG || 100,
      calories: data.calories,
      proteinG: data.proteinG || 0,
      carbsG: data.carbsG || 0,
      fatG: data.fatG || 0,
      metadata: {
        barcode: data.barcode || null,
        source: "openfoodfacts",
        imageUrl: data.imageUrl || null,
        unit: data.unit || "g",
      },
    },
  });

  return {
    ...created,
    imageUrl: data.imageUrl || null,
    unit: data.unit || "g",
  };
};

module.exports = {
  getTodayNutrition,
  saveNutritionTarget,
  createMealLog,
  addMealLogItem,
  deleteMealLogItem,
  searchFoods,
  getFoodByBarcode,
  createOrGetFoodItem,
};
