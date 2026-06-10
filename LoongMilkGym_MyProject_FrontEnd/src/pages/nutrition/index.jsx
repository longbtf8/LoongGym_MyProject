import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Utensils,
  Plus,
  Trash2,
  Settings,
  ChevronLeft,
  Search,
  AlertTriangle,
  Info,
  Sparkles,
  Check,
  Flame,
  Droplet,
  ScanBarcode,
  CameraOff,
  X
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
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
import LoadingScreen from "@/components/LoadingScreen";
import paths from "@/config/path";

const getLocalDateString = (dateInput = new Date()) => {
  const date = new Date(dateInput);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Sub-component for Barcode Scanning
function BarcodeScannerModal({ onClose, onScanSuccess }) {
  const [manualBarcode, setManualBarcode] = useState("");
  const [cameraError, setCameraError] = useState("");

  useEffect(() => {
    let html5QrcodeScanner;
    
    const timer = setTimeout(() => {
      try {
        html5QrcodeScanner = new Html5Qrcode("barcode-reader-viewport");
        html5QrcodeScanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (width, height) => {
              // Rectangle shape for barcode scanning
              return { width: Math.round(width * 0.8), height: Math.round(height * 0.3) };
            },
            aspectRatio: 1.0
          },
          async (decodedText) => {
            if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
              await html5QrcodeScanner.stop().catch(() => {});
            }
            onScanSuccess(decodedText);
          },
          () => {} // Silent failures for individual frames
        ).catch((err) => {
          console.warn("Camera start failed: ", err);
          setCameraError("Không thể truy cập camera. Bạn có thể tự nhập mã vạch bên dưới.");
        });
      } catch (err) {
        console.error("Scanner init failed: ", err);
        setCameraError("Lỗi khởi tạo camera.");
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
        html5QrcodeScanner.stop().catch(() => {});
      }
    };
  }, [onScanSuccess]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onScanSuccess(manualBarcode.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-[2px] flex items-center justify-center z-[999999] p-4">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[24px] p-5 w-full max-w-[400px] flex flex-col gap-4 shadow-2xl relative">
        <div className="flex justify-between items-center">
          <h3 className="font-extrabold text-base text-[var(--text-color)] flex items-center gap-2 m-0">
            <ScanBarcode className="w-5 h-5 text-primary" /> Quét mã vạch thực phẩm
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="p-1 hover:bg-[var(--bg-color)] rounded-lg text-[var(--text-muted)] cursor-pointer border-0 bg-transparent flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-[var(--border-color)]">
          {!cameraError ? (
            <>
              <div id="barcode-reader-viewport" className="w-full h-full" />
              {/* Laser scanning visual line */}
              <div className="absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-red-500 shadow-md shadow-red-500/50 animate-pulse z-10" />
            </>
          ) : (
            <div className="p-6 text-center flex flex-col items-center gap-2">
              <CameraOff className="w-8 h-8 text-[var(--text-muted)]" />
              <span className="text-xs font-bold text-[var(--text-muted)]">{cameraError}</span>
            </div>
          )}
        </div>

        {/* Manual Barcode input fallback */}
        <form onSubmit={handleManualSubmit} className="flex flex-col gap-2 border-t border-[var(--border-color)] pt-3">
          <label className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-wider">
            Hoặc nhập mã vạch bằng tay
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="VD: 8934563138164"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              className="flex-1 h-9 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-3 text-xs text-[var(--text-color)] outline-none focus:border-primary font-bold"
            />
            <button
              type="submit"
              className="h-9 px-4 bg-primary text-black rounded-xl text-xs font-black hover:bg-primary-hover active:scale-95 transition cursor-pointer border-0"
            >
              Tìm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NutritionPage() {
  const navigate = useNavigate();
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
    }
    setShowSettings(true);
  };

  // Save targets
  const handleSaveTargets = async (e) => {
    e.preventDefault();

    // Frontend validations
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

  // Handle adding food item (both manual & library)
  const handleAddFoodItem = async (e) => {
    e.preventDefault();
    try {
      // 1. Get or create meal log for today
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

      // 2. Prepare payload
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
        if (isNaN(qG) || qG <= 0 || qG > 5000) {
          showToast("Khối lượng món ăn phải từ 1g đến 5,000g.");
          return;
        }

        let foodIdToUse = selectedFood.id;

        // If this is an external API food item, dynamically cache/save it to DB first
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
          }).unwrap();
          
          foodIdToUse = cacheRes?.data?.id;
        }

        payload = {
          foodItemId: foodIdToUse,
          quantityG: qG,
        };
      }

      // 3. Add to meal log
      await addMealItem({ mealLogId, data: payload }).unwrap();
      showToast("🥗 Đã thêm món ăn vào nhật ký hôm nay!");

      // Reset form fields
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

  // Select food from search library autocomplete
  const handleSelectLibraryFood = (food) => {
    setSelectedFood(food);
    setSearchTerm(food.name);
  };

  // Handle scanned barcode lookup
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

  // Calculate preview macros dynamically as quantity changes
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

  if (isLoading || isSearchingBarcode) {
    return <LoadingScreen message={isSearchingBarcode ? "Đang truy xuất mã vạch..." : "Đang tải dữ liệu dinh dưỡng..."} />;
  }

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

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] py-8 px-4 w-full flex justify-center pb-24">
      <div className="max-w-[1000px] w-full flex flex-col gap-6">
        
        {/* Header navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate(paths.dashboard)}
            className="flex items-center gap-1 text-xs font-bold text-[var(--text-muted)] hover:text-primary transition cursor-pointer bg-transparent border-0 p-0"
          >
            <ChevronLeft className="w-4 h-4" /> Bảng điều khiển
          </button>
          
          <button
            onClick={openTargetSettings}
            className="h-9 px-3.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-color)] hover:border-primary/50 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Settings className="w-3.5 h-3.5" /> Thiết lập mục tiêu
          </button>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase font-black text-primary tracking-widest">
            Nhật ký Calo & Dinh dưỡng
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight !m-0">
            Hôm nay ăn gì?
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Theo dõi dinh dưỡng ngày {new Date(todayStr).toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </p>
        </div>

        {/* Main Calorie Progress Ring / Summary Card */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-3xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1.5">
            <span className="text-xs text-[var(--text-muted)] font-black uppercase tracking-wider">
              Lượng Calo nạp vào
            </span>
            <div className="text-4xl font-black tracking-tight flex items-baseline gap-1.5">
              <span>{totals.calories}</span>
              <span className="text-sm font-extrabold text-[var(--text-muted)]">/ {calTargetVal} kcal</span>
            </div>
            <div className={`text-xs font-extrabold flex items-center gap-1 mt-1 ${isCalExceeded ? "text-red-500" : "text-primary"}`}>
              {isCalExceeded ? (
                <>
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Đã vượt {Math.abs(calRemaining)} kcal
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 fill-primary shrink-0" />
                  Còn lại {calRemaining} kcal
                </>
              )}
            </div>
          </div>

          {/* Central progress visual bar */}
          <div className="flex flex-col justify-center gap-1.5">
            <div className="h-4 w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-full overflow-hidden relative">
              <div
                style={{ width: `${Math.min(calPct, 100)}%` }}
                className={`h-full rounded-full transition-all duration-500 ${isCalExceeded ? "bg-red-500" : "bg-primary"}`}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white mix-blend-difference">
                {calPct}% mục tiêu
              </span>
            </div>
            <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-bold">
              <span>0 kcal</span>
              <span>Mục tiêu: {calTargetVal} kcal</span>
            </div>
          </div>

          {/* Water & Fiber micro summary */}
          <div className="border-t md:border-t-0 md:border-l border-[var(--border-color)] pt-4 md:pt-0 md:pl-6 flex flex-col gap-3 justify-center">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[var(--text-muted)] font-bold flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 text-blue-500" /> Nước uống:
              </span>
              <span className="text-xs font-black">
                Mục tiêu: {target.waterMlTarget ?? 2000} ml
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-[var(--text-muted)] font-bold flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-orange-400" /> Chất xơ (Fiber):
              </span>
              <span className="text-xs font-black">
                Mục tiêu: {target.fiberGTarget ?? 25} g
              </span>
            </div>
          </div>
        </div>

        {/* Macros card grid: Protein / Carbs / Fat */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Protein Card */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 rounded-2xl flex flex-col gap-3.5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-[var(--text-muted)]">Protein (Chất đạm)</span>
                <div className="text-xl font-black mt-1">{totals.protein}g / {proTargetVal}g</div>
              </div>
              <span className="w-7 h-7 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black flex items-center justify-center rounded-lg">P</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(proPct, 100)}%` }}
                className={`h-full rounded-full transition-all duration-500 ${isProExceeded ? "bg-red-500" : "bg-primary"}`}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-[var(--text-muted)]">{proPct}% nạp vào</span>
              {isProExceeded && (
                <span className="text-red-500 flex items-center gap-0.5 font-black uppercase">
                  ⚠️ Vượt {Math.round((totals.protein - proTargetVal) * 10) / 10}g
                </span>
              )}
            </div>
          </div>

          {/* Carbs Card */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 rounded-2xl flex flex-col gap-3.5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-[var(--text-muted)]">Carbs (Tinh bột)</span>
                <div className="text-xl font-black mt-1">{totals.carbs}g / {carbTargetVal}g</div>
              </div>
              <span className="w-7 h-7 bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-[10px] font-black flex items-center justify-center rounded-lg">C</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(carbPct, 100)}%` }}
                className={`h-full rounded-full transition-all duration-500 ${isCarbExceeded ? "bg-red-500" : "bg-cyan-400"}`}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-[var(--text-muted)]">{carbPct}% nạp vào</span>
              {isCarbExceeded && (
                <span className="text-red-500 flex items-center gap-0.5 font-black uppercase">
                  ⚠️ Vượt {Math.round((totals.carbs - carbTargetVal) * 10) / 10}g
                </span>
              )}
            </div>
          </div>

          {/* Fat Card */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 rounded-2xl flex flex-col gap-3.5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-[var(--text-muted)]">Fat (Chất béo)</span>
                <div className="text-xl font-black mt-1">{totals.fat}g / {fatTargetVal}g</div>
              </div>
              <span className="w-7 h-7 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black flex items-center justify-center rounded-lg">F</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(fatPct, 100)}%` }}
                className={`h-full rounded-full transition-all duration-500 ${isFatExceeded ? "bg-red-500" : "bg-amber-500"}`}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-[var(--text-muted)]">{fatPct}% nạp vào</span>
              {isFatExceeded && (
                <span className="text-red-500 flex items-center gap-0.5 font-black uppercase">
                  ⚠️ Vượt {Math.round((totals.fat - fatTargetVal) * 10) / 10}g
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Add food form & Logged list (Split side-by-side on tablet/desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-start">
          
          {/* Left Column: Form thêm món ăn (3/5 cols width on Desktop) */}
          <div className="lg:col-span-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 rounded-2xl flex flex-col gap-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <span className="text-xs font-black uppercase text-[var(--text-color)] tracking-wider flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-primary" />
                Ghi nhận ăn uống
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsManual(!isManual);
                  setSelectedFood(null);
                  setSearchTerm("");
                }}
                className="text-[10px] font-extrabold text-primary hover:text-primary-hover bg-transparent border-0 p-0 cursor-pointer"
              >
                {isManual ? "🔍 Tìm món thư viện" : "✍️ Nhập tay thủ công"}
              </button>
            </div>

            <form onSubmit={handleAddFoodItem} className="flex flex-col gap-3.5">
              {!isManual ? (
                /* Search Food from Library + Barcode trigger */
                <div className="flex flex-col gap-1.5 relative">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                      Tìm kiếm món ăn trong thư viện
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsScanning(true)}
                      className="text-[10px] text-primary hover:text-primary-hover font-black flex items-center gap-1 bg-transparent border-0 p-0 cursor-pointer"
                    >
                      <ScanBarcode className="w-3.5 h-3.5 text-primary" /> Quét mã vạch
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Gõ tìm kiếm (vd: ức gà, Milo, sữa chua...)"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (selectedFood && e.target.value !== selectedFood.name) {
                          setSelectedFood(null);
                        }
                      }}
                      className="w-full h-10 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl pl-9 pr-4 text-xs text-[var(--text-color)] outline-none focus:border-primary font-bold"
                    />
                    <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3" />
                  </div>

                  {/* Visual Selected Food Card */}
                  {selectedFood && (
                    <div className="flex items-center gap-3 p-3 bg-[var(--bg-color)] border border-primary/20 rounded-xl relative mt-2 shadow-inner">
                      {selectedFood.imageUrl ? (
                        <img
                          src={selectedFood.imageUrl}
                          alt={selectedFood.name}
                          className="w-12 h-12 object-contain rounded-lg bg-white border border-[var(--border-color)] p-0.5 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-lg shrink-0">
                          🥗
                        </div>
                      )}
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-black text-[var(--text-color)] truncate">{selectedFood.name}</span>
                        {selectedFood.brand && (
                          <span className="text-[9px] text-[var(--text-muted)] font-extrabold truncate">{selectedFood.brand}</span>
                        )}
                        <span className="text-[10px] text-primary font-black mt-0.5">
                          {selectedFood.calories} kcal / {selectedFood.servingSizeG || 100}g
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFood(null);
                          setSearchTerm("");
                        }}
                        className="text-[9px] text-red-500 hover:text-red-400 font-black bg-transparent border-0 cursor-pointer p-1.5 active:scale-95 transition"
                      >
                        Hủy chọn
                      </button>
                    </div>
                  )}

                  {/* Autocomplete Results Box */}
                  {searchTerm.trim().length >= 2 && !selectedFood && (
                    <div className="absolute left-0 right-0 top-[62px] z-[120] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-2xl p-1.5 flex flex-col gap-0.5 max-h-48 overflow-y-auto">
                      {searchResults.length === 0 ? (
                        <span className="p-3 text-[10px] text-[var(--text-muted)] italic font-bold text-center">
                          Không tìm thấy món ăn nào. Nhấp "Nhập tay thủ công" ở góc trên.
                        </span>
                      ) : (
                        searchResults.map((food) => (
                          <button
                            key={food.id}
                            type="button"
                            onClick={() => handleSelectLibraryFood(food)}
                            className="w-full px-2.5 py-1.5 text-left text-xs font-bold rounded-lg hover:bg-[var(--bg-color)] border-0 bg-transparent text-[var(--text-color)] cursor-pointer flex justify-between items-center transition-all gap-2"
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              {food.imageUrl ? (
                                <img
                                  src={food.imageUrl}
                                  alt={food.name}
                                  className="w-6 h-6 object-contain rounded-md bg-white border border-[var(--border-color)] p-0.5 shrink-0"
                                />
                              ) : (
                                <div className="w-6 h-6 flex items-center justify-center rounded-md bg-[var(--bg-color)] border border-[var(--border-color)] text-[10px] shrink-0">
                                  🥗
                                </div>
                              )}
                              <span className="truncate">{food.name}</span>
                            </div>
                            <span className="text-[9px] text-[var(--text-muted)] shrink-0 font-extrabold flex items-center gap-1">
                              {food.calories} kcal / {food.servingSizeG}g
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Manual Custom Form Inputs */
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                      Tên món ăn tự nhập
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Phở bò đặc biệt, Bún chả..."
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      className="w-full h-10 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-3 text-xs text-[var(--text-color)] outline-none focus:border-primary font-bold"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                        Calories (kcal)
                      </label>
                      <input
                        type="number"
                        placeholder="Calo"
                        value={manualCalories}
                        onChange={(e) => setManualCalories(e.target.value)}
                        className="w-full h-10 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-3 text-xs text-[var(--text-color)] outline-none focus:border-primary text-center font-bold"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                        Protein (g)
                      </label>
                      <input
                        type="number"
                        placeholder="Protein"
                        value={manualProtein}
                        onChange={(e) => setManualProtein(e.target.value)}
                        className="w-full h-10 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-3 text-xs text-[var(--text-color)] outline-none focus:border-primary text-center font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                        Carbs (g)
                      </label>
                      <input
                        type="number"
                        placeholder="Tinh bột"
                        value={manualCarbs}
                        onChange={(e) => setManualCarbs(e.target.value)}
                        className="w-full h-10 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-3 text-xs text-[var(--text-color)] outline-none focus:border-primary text-center font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                        Fat (g)
                      </label>
                      <input
                        type="number"
                        placeholder="Chất béo"
                        value={manualFat}
                        onChange={(e) => setManualFat(e.target.value)}
                        className="w-full h-10 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-3 text-xs text-[var(--text-color)] outline-none focus:border-primary text-center font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity in grams input (common for both) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                  Khối lượng đã ăn (g)
                </label>
                <input
                  type="number"
                  placeholder="Điền số gram (vd: 100)"
                  value={quantityG}
                  onChange={(e) => setQuantityG(e.target.value)}
                  className="w-full h-10 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-3 text-xs text-[var(--text-color)] outline-none focus:border-primary text-center font-bold"
                  required
                />
              </div>

              {/* Realtime macro conversion summary preview */}
              {previewData && (
                <div className="p-3 bg-[var(--bg-color)] border border-primary/20 rounded-xl flex items-center justify-between text-[10px] font-black">
                  <span className="text-primary flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 fill-primary" />
                    Ước tính ({quantityG}g):
                  </span>
                  <span>{previewData.calories} kcal</span>
                  <span>P: {previewData.protein}g</span>
                  <span>C: {previewData.carbs}g</span>
                  <span>F: {previewData.fat}g</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isAddingItem || (!isManual && !selectedFood)}
                className="w-full h-10 bg-primary text-black rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-primary-hover active:scale-[0.98] transition cursor-pointer shadow-md shadow-primary/5 mt-1 disabled:opacity-55 border-0"
              >
                <Plus className="w-4 h-4" />
                {isAddingItem ? "Đang lưu..." : "Thêm món vào nhật ký"}
              </button>
            </form>
          </div>

          {/* Right Column: Danh sách món đã ăn hôm nay (2/5 cols width on Desktop) */}
          <div className="lg:col-span-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 rounded-2xl flex flex-col gap-4 shadow-sm min-h-[300px]">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <span className="text-xs font-black uppercase text-[var(--text-color)] tracking-wider">
                Món đã ăn hôm nay
              </span>
              <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-lg font-black uppercase">
                {nutritionData?.mealLogs?.[0]?.items?.length || 0} món
              </span>
            </div>

            <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
              {!nutritionData?.mealLogs?.[0]?.items || nutritionData.mealLogs[0].items.length === 0 ? (
                <span className="text-xs text-[var(--text-muted)] italic font-bold py-10 text-center">
                  Bạn chưa log món ăn nào hôm nay.
                </span>
              ) : (
                nutritionData.mealLogs[0].items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="font-extrabold text-xs text-[var(--text-color)] truncate !m-0">
                        {item.customFoodName || item.foodItem?.name || "Món ăn"}
                      </h4>
                      <div className="text-[9px] text-[var(--text-muted)] font-semibold mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                        <span>{item.quantityG}g</span>
                        <span>•</span>
                        <span>{item.calories} kcal</span>
                        <span>•</span>
                        <span>P: {item.proteinG}g</span>
                        <span>•</span>
                        <span>C: {item.carbsG}g</span>
                        <span>•</span>
                        <span>F: {item.fatG}g</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-[var(--text-muted)] cursor-pointer transition border-0 bg-transparent shrink-0 flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* SETTINGS / TARGETS MODAL */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-[2px] flex items-center justify-center z-[999999] p-4">
            <form
              onSubmit={handleSaveTargets}
              className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[24px] p-5 w-full max-w-[420px] flex flex-col gap-4 shadow-2xl animate-slide-up"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-base flex items-center gap-2 text-[var(--text-color)] m-0">
                  <Settings className="w-5 h-5 text-primary" />
                  Mục tiêu dinh dưỡng
                </h3>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                    Mục tiêu Calories (kcal)
                  </label>
                  <input
                    type="number"
                    value={targetCalories}
                    onChange={(e) => setTargetCalories(e.target.value)}
                    className="w-full h-10 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-3 text-xs text-[var(--text-color)] outline-none focus:border-primary font-bold text-center"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider text-center">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      value={targetProtein}
                      onChange={(e) => setTargetProtein(e.target.value)}
                      className="w-full h-10 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-3 text-xs text-[var(--text-color)] outline-none focus:border-primary font-bold text-center"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider text-center">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      value={targetCarbs}
                      onChange={(e) => setTargetCarbs(e.target.value)}
                      className="w-full h-10 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-3 text-xs text-[var(--text-color)] outline-none focus:border-primary font-bold text-center"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider text-center">
                      Fat (g)
                    </label>
                    <input
                      type="number"
                      value={targetFat}
                      onChange={(e) => setTargetFat(e.target.value)}
                      className="w-full h-10 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-3 text-xs text-[var(--text-color)] outline-none focus:border-primary font-bold text-center"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider text-center">
                      Chất xơ (g)
                    </label>
                    <input
                      type="number"
                      value={targetFiber}
                      onChange={(e) => setTargetFiber(e.target.value)}
                      className="w-full h-10 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-3 text-xs text-[var(--text-color)] outline-none focus:border-primary font-bold text-center"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider text-center">
                      Nước (ml)
                    </label>
                    <input
                      type="number"
                      value={targetWater}
                      onChange={(e) => setTargetWater(e.target.value)}
                      className="w-full h-10 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-3 text-xs text-[var(--text-color)] outline-none focus:border-primary font-bold text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="flex-1 h-10 rounded-xl border border-[var(--border-color)] text-[var(--text-color)] text-xs font-bold hover:bg-[var(--bg-color)] cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={isSavingTarget}
                  className="flex-1 h-10 rounded-xl bg-primary text-black text-xs font-black hover:bg-primary-hover disabled:opacity-60 cursor-pointer border-0"
                >
                  {isSavingTarget ? "Đang lưu..." : "Xác nhận & Lưu"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* BARCODE SCANNER MODAL */}
        {isScanning && (
          <BarcodeScannerModal
            onClose={() => setIsScanning(false)}
            onScanSuccess={handleBarcodeScanned}
          />
        )}

        {/* Global Toast */}
        {toast.show && (
          <div className="fixed bottom-6 right-6 z-[999999] bg-[var(--bg-secondary)] border border-primary/30 text-[var(--text-color)] rounded-xl px-4 py-3 flex items-center gap-2.5 shadow-2xl animate-slide-down">
            <Check className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold">{toast.message}</span>
          </div>
        )}

      </div>
    </div>
  );
}
