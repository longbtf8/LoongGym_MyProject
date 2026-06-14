import { useState, useMemo, useEffect } from "react";
import {
  useGetTodayNutritionQuery,
  useSaveNutritionTargetMutation,
  useCreateMealLogMutation,
  useAddMealLogItemMutation,
  useDeleteMealLogItemMutation,
  useSearchFoodsQuery,
  useLazyGetFoodByBarcodeQuery,
  useCreateOrGetFoodItemMutation,
} from "@/services/nutrition/nutritionApi";

const getLocalDateString = (dateInput = new Date()) => {
  const date = new Date(dateInput);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function useNutritionData() {
  const todayStr = getLocalDateString();

  // Queries & Mutations
  const { data: nutritionRes, isLoading } = useGetTodayNutritionQuery(todayStr);
  const nutritionData = nutritionRes?.data;

  const [saveTarget, { isLoading: isSavingTarget }] = useSaveNutritionTargetMutation();
  const [createMealLog] = useCreateMealLogMutation();
  const [addMealItem, { isLoading: isAddingItem }] = useAddMealLogItemMutation();
  const [deleteMealItem] = useDeleteMealLogItemMutation();
  
  // Barcode Lookup queries & mutations
  const [triggerBarcodeLookup, { isFetching: isSearchingBarcode }] = useLazyGetFoodByBarcodeQuery();
  const [createOrGetFood] = useCreateOrGetFoodItemMutation();

  // Local States
  const [showSettings, setShowSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantityG, setQuantityG] = useState(100);
  const [isManual, setIsManual] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });

  // Manual Food Form States
  const [manualName, setManualName] = useState("");
  const [manualCalories, setManualCalories] = useState("");
  const [manualProtein, setManualProtein] = useState("");
  const [manualCarbs, setManualCarbs] = useState("");
  const [manualFat, setManualFat] = useState("");

  // Targets Form States
  const [targetCalories, setTargetCalories] = useState("");
  const [targetProtein, setTargetProtein] = useState("");
  const [targetCarbs, setTargetCarbs] = useState("");
  const [targetFat, setTargetFat] = useState("");
  const [targetFiber, setTargetFiber] = useState("");
  const [targetWater, setTargetWater] = useState("");

  // Search results query
  const { data: searchFoodsRes } = useSearchFoodsQuery(searchTerm, {
    skip: searchTerm.trim().length < 2,
  });
  const searchResults = searchFoodsRes?.data || [];

  const getFoodUnit = (food) => {
    if (!food) return "g";
    if (food.metadata) {
      try {
        const meta = typeof food.metadata === "string" ? JSON.parse(food.metadata) : food.metadata;
        if (meta?.unit) return meta.unit;
      } catch {}
    }
    if (food.unit) return food.unit;
    return "g";
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  // Populate target inputs when modal opens
  const openTargetSettings = () => {
    if (nutritionData?.target) {
      setTargetCalories(nutritionData.target.caloriesTarget ?? 2000);
      setTargetProtein(Math.round(Number(nutritionData.target.proteinGTarget ?? 150)));
      setTargetCarbs(Math.round(Number(nutritionData.target.carbsGTarget ?? 200)));
      setTargetFat(Math.round(Number(nutritionData.target.fatGTarget ?? 60)));
      setTargetFiber(Math.round(Number(nutritionData.target.fiberGTarget ?? 25)));
      setTargetWater(nutritionData.target.waterMlTarget ?? 2000);
    } else {
      setTargetCalories(2000);
      setTargetProtein(150);
      setTargetCarbs(200);
      setTargetFat(60);
      setTargetFiber(25);
      setTargetWater(2000);
    }
    setShowSettings(true);
  };

  // Save targets
  const handleSaveTargets = async (e) => {
    e.preventDefault();

    const calTarget = Number(targetCalories);
    const protTarget = Number(targetProtein);
    const cbTarget = Number(targetCarbs);
    const ftTarget = Number(targetFat);
    const fibTarget = Number(targetFiber);
    const watTarget = Number(targetWater);

    if (isNaN(calTarget) || calTarget <= 0 || calTarget > 10000) {
      showToast("Lượng calo mục tiêu phải từ 1 đến 10,000 kcal.");
      return;
    }
    if (isNaN(protTarget) || protTarget < 0 || protTarget > 1000) {
      showToast("Lượng protein mục tiêu phải từ 0 đến 1,000g.");
      return;
    }
    if (isNaN(cbTarget) || cbTarget < 0 || cbTarget > 1000) {
      showToast("Lượng tinh bột (carbs) mục tiêu phải từ 0 đến 1,000g.");
      return;
    }
    if (isNaN(ftTarget) || ftTarget < 0 || ftTarget > 1000) {
      showToast("Lượng chất béo mục tiêu phải từ 0 đến 1,000g.");
      return;
    }
    if (isNaN(fibTarget) || fibTarget < 0 || fibTarget > 1000) {
      showToast("Lượng chất xơ mục tiêu phải từ 0 đến 1,000g.");
      return;
    }
    if (isNaN(watTarget) || watTarget <= 0 || watTarget > 10000) {
      showToast("Lượng nước mục tiêu phải từ 1 đến 10,000 ml.");
      return;
    }

    try {
      await saveTarget({
        targetDate: todayStr,
        caloriesTarget: calTarget,
        proteinGTarget: protTarget,
        carbsGTarget: cbTarget,
        fatGTarget: ftTarget,
        fiberGTarget: fibTarget,
        waterMlTarget: watTarget,
      }).unwrap();
      setShowSettings(false);
      showToast("🎯 Cập nhật mục tiêu dinh dưỡng thành công!");
    } catch {
      showToast("Không thể cập nhật mục tiêu dinh dưỡng.");
    }
  };

  // Handle adding food item
  const handleAddFoodItem = async (e) => {
    e.preventDefault();
    try {
      let mealLogId = nutritionData?.mealLogs?.[0]?.id;
      if (!mealLogId) {
        const createRes = await createMealLog({
          mealDate: todayStr,
          mealType: "Today",
          note: "Nhật ký bữa ăn tổng hợp",
        }).unwrap();
        mealLogId = createRes?.data?.id;
      }

      if (!mealLogId) {
        showToast("Không thể tạo nhật ký ăn uống.");
        return;
      }

      let payload = {};
      if (isManual) {
        if (!manualName.trim() || !manualCalories) {
          showToast("Vui lòng điền tên món ăn và lượng calories.");
          return;
        }

        const qG = Number(quantityG) || 100;
        const cal = Number(manualCalories);
        const prot = Number(manualProtein) || 0;
        const cb = Number(manualCarbs) || 0;
        const ft = Number(manualFat) || 0;

        if (isNaN(qG) || qG <= 0 || qG > 5000) {
          showToast("Khối lượng món ăn phải từ 1g đến 5,000g.");
          return;
        }
        if (isNaN(cal) || cal < 0 || cal > 10000) {
          showToast("Lượng calories phải từ 0 đến 10,000 kcal.");
          return;
        }
        if (isNaN(prot) || prot < 0 || prot > 1000) {
          showToast("Lượng protein phải từ 0 đến 1,000g.");
          return;
        }
        if (isNaN(cb) || cb < 0 || cb > 1000) {
          showToast("Lượng tinh bột (carbs) phải từ 0 đến 1,000g.");
          return;
        }
        if (isNaN(ft) || ft < 0 || ft > 1000) {
          showToast("Lượng chất béo phải từ 0 đến 1,000g.");
          return;
        }

        payload = {
          customFoodName: manualName,
          quantityG: qG,
          calories: cal,
          proteinG: prot,
          carbsG: cb,
          fatG: ft,
        };
      } else {
        if (!selectedFood) {
          showToast("Vui lòng chọn món ăn từ danh sách tìm kiếm.");
          return;
        }

        const qG = Number(quantityG);
        const unit = getFoodUnit(selectedFood);
        if (isNaN(qG) || qG <= 0 || qG > 5000) {
          showToast(`Khối lượng/Thể tích phải từ 1${unit} đến 5,000${unit}.`);
          return;
        }

        let foodIdToUse = selectedFood.id;

        if (selectedFood.isExternal) {
          const cacheRes = await createOrGetFood({
            name: selectedFood.name,
            brand: selectedFood.brand,
            calories: selectedFood.calories,
            proteinG: selectedFood.proteinG,
            carbsG: selectedFood.carbsG,
            fatG: selectedFood.fatG,
            barcode: selectedFood.barcode,
            imageUrl: selectedFood.imageUrl,
            servingSizeG: selectedFood.servingSizeG,
            unit: selectedFood.unit,
          }).unwrap();
          
          foodIdToUse = cacheRes?.data?.id;
        }

        payload = {
          foodItemId: foodIdToUse,
          quantityG: qG,
        };
      }

      await addMealItem({ mealLogId, data: payload }).unwrap();
      showToast("🥗 Đã thêm món ăn vào nhật ký hôm nay!");

      setSearchTerm("");
      setSelectedFood(null);
      setManualName("");
      setManualCalories("");
      setManualProtein("");
      setManualCarbs("");
      setManualFat("");
    } catch (err) {
      showToast(err?.data?.message || "Không thể thêm món ăn.");
    }
  };

  // Delete food item
  const handleDeleteItem = async (itemId) => {
    try {
      await deleteMealItem(itemId).unwrap();
      showToast("🗑️ Đã xóa món ăn khỏi nhật ký.");
    } catch {
      showToast("Không thể xóa món ăn.");
    }
  };

  const handleSelectLibraryFood = (food) => {
    setSelectedFood(food);
    setSearchTerm(food.name);
  };

  const handleBarcodeScanned = async (barcode) => {
    setIsScanning(false);
    showToast("🔍 Đang tìm kiếm sản phẩm cho mã vạch " + barcode + "...");
    try {
      const res = await triggerBarcodeLookup(barcode).unwrap();
      if (res?.data) {
        setSelectedFood(res.data);
        setSearchTerm(res.data.name);
        setIsManual(false);
        showToast("✅ Đã tìm thấy: " + res.data.name);
      } else {
        showToast("Không tìm thấy món ăn cho mã vạch này. Bạn hãy nhập tay thủ công nhé!");
      }
    } catch (err) {
      showToast(err?.data?.message || "Không tìm thấy sản phẩm.");
    }
  };

  const previewData = useMemo(() => {
    if (!selectedFood) return null;
    const servingSize = Number(selectedFood.servingSizeG) || 100;
    const factor = quantityG / servingSize;
    return {
      calories: Math.round((selectedFood.calories || 0) * factor),
      protein: Math.round((Number(selectedFood.proteinG || selectedFood.protein) || 0) * factor * 10) / 10,
      carbs: Math.round((Number(selectedFood.carbsG || selectedFood.carbs) || 0) * factor * 10) / 10,
      fat: Math.round((Number(selectedFood.fatG || selectedFood.fat) || 0) * factor * 10) / 10,
    };
  }, [selectedFood, quantityG]);

  const totals = nutritionData?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const target = nutritionData?.target || {
    caloriesTarget: 2000,
    proteinGTarget: 150,
    carbsGTarget: 200,
    fatGTarget: 60,
    fiberGTarget: 25,
    waterMlTarget: 2000,
  };

  // Convert inputs to numbers safely
  const calTargetVal = target.caloriesTarget ?? 2000;
  const proTargetVal = Number(target.proteinGTarget ?? 150);
  const carbTargetVal = Number(target.carbsGTarget ?? 200);
  const fatTargetVal = Number(target.fatGTarget ?? 60);

  const calRemaining = calTargetVal - totals.calories;
  const isCalExceeded = totals.calories > calTargetVal;

  const getPercent = (value, targetVal) => {
    if (!targetVal) return 0;
    return Math.round((value / targetVal) * 100);
  };

  const proPct = getPercent(totals.protein, proTargetVal);
  const carbPct = getPercent(totals.carbs, carbTargetVal);
  const fatPct = getPercent(totals.fat, fatTargetVal);
  const calPct = getPercent(totals.calories, calTargetVal);

  const isProExceeded = totals.protein > proTargetVal;
  const isCarbExceeded = totals.carbs > carbTargetVal;
  const isFatExceeded = totals.fat > fatTargetVal;

  return {
    todayStr,
    totals,
    target,
    calTargetVal,
    proTargetVal,
    carbTargetVal,
    fatTargetVal,
    calRemaining,
    isCalExceeded,
    proPct,
    carbPct,
    fatPct,
    calPct,
    isProExceeded,
    isCarbExceeded,
    isFatExceeded,
    showSettings,
    setShowSettings,
    searchTerm,
    setSearchTerm,
    selectedFood,
    setSelectedFood,
    quantityG,
    setQuantityG,
    isManual,
    setIsManual,
    isScanning,
    setIsScanning,
    toast,
    showToast,
    manualName,
    setManualName,
    manualCalories,
    setManualCalories,
    manualProtein,
    setManualProtein,
    manualCarbs,
    setManualCarbs,
    manualFat,
    setManualFat,
    targetCalories,
    setTargetCalories,
    targetProtein,
    setTargetProtein,
    targetCarbs,
    setTargetCarbs,
    targetFat,
    setTargetFat,
    targetFiber,
    setTargetFiber,
    targetWater,
    setTargetWater,
    searchResults,
    getFoodUnit,
    openTargetSettings,
    handleSaveTargets,
    handleAddFoodItem,
    handleDeleteItem,
    handleSelectLibraryFood,
    handleBarcodeScanned,
    previewData,
    isLoading: isLoading || isSearchingBarcode,
    isSavingTarget,
    isAddingItem,
  };
}
