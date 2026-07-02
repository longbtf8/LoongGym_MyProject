import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Settings, Check } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";
import paths from "@/config/path";
import { useNutritionData } from "./hooks/useNutritionData";
import BarcodeScannerModal from "./components/BarcodeScannerModal";
import MacroTargetsModal from "./components/MacroTargetsModal";
import NutritionOverviewCard from "./components/NutritionOverviewCard";
import MacrosGrid from "./components/MacrosGrid";
import AddFoodForm from "./components/AddFoodForm";
import LoggedFoodsList from "./components/LoggedFoodsList";
import AIFoodSuggestions from "./components/AIFoodSuggestions";

export default function NutritionPage() {
  const navigate = useNavigate();
  
  const {
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
    handleAutoCalculateTargets,
    handleAddFoodItem,
    handleQuickAddFood,
    handleDeleteItem,
    handleSelectLibraryFood,
    handleBarcodeScanned,
    previewData,
    isLoading,
    isSavingTarget,
    isAddingItem,
    mealLogs,
    userCacheKey,
  } = useNutritionData();

  if (isLoading) {
    return <LoadingScreen message="Đang tải dữ liệu dinh dưỡng..." />;
  }

  const nutritionData = { totals, target, mealLogs: [{ items: searchResults }] }; // Mock structure for target settings
  // Real nutrition data references
  const actualNutritionData = { target, totals, mealLogs };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-0 pb-8 px-4 lg:py-8 w-full flex justify-center pb-24">
      <div className="max-w-[1000px] w-full flex flex-col gap-6 animate-fade-in">
        
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
            <Settings className="w-3.5 h-3.5 animate-spin-slow" /> Thiết lập mục tiêu
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

        {/* Main Calorie Progress / Summary Card */}
        <NutritionOverviewCard
          totals={totals}
          calTargetVal={calTargetVal}
          calRemaining={calRemaining}
          isCalExceeded={isCalExceeded}
          calPct={calPct}
          target={target}
        />

        {/* Macros card grid: Protein / Carbs / Fat */}
        <MacrosGrid
          totals={totals}
          proTargetVal={proTargetVal}
          proPct={proPct}
          isProExceeded={isProExceeded}
          carbTargetVal={carbTargetVal}
          carbPct={carbPct}
          isCarbExceeded={isCarbExceeded}
          fatTargetVal={fatTargetVal}
          fatPct={fatPct}
          isFatExceeded={isFatExceeded}
        />

        {/* AI recommended suggestions section */}
        <AIFoodSuggestions
          userCacheKey={userCacheKey}
          calRemaining={calRemaining}
          handleQuickAddFood={handleQuickAddFood}
        />

        {/* Bottom Section: Add food form & Logged list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-start">
          
          {/* Left Column: Form thêm món ăn */}
          <AddFoodForm
            isManual={isManual}
            setIsManual={setIsManual}
            setSelectedFood={setSelectedFood}
            setSearchTerm={setSearchTerm}
            handleAddFoodItem={handleAddFoodItem}
            setIsScanning={setIsScanning}
            searchTerm={searchTerm}
            selectedFood={selectedFood}
            searchResults={searchResults}
            handleSelectLibraryFood={handleSelectLibraryFood}
            getFoodUnit={getFoodUnit}
            manualName={manualName}
            setManualName={setManualName}
            manualCalories={manualCalories}
            setManualCalories={setManualCalories}
            manualProtein={manualProtein}
            setManualProtein={setManualProtein}
            manualCarbs={manualCarbs}
            setManualCarbs={setManualCarbs}
            manualFat={manualFat}
            setManualFat={setManualFat}
            quantityG={quantityG}
            setQuantityG={setQuantityG}
            previewData={previewData}
            isAddingItem={isAddingItem}
          />

          {/* Right Column: Danh sách món đã ăn hôm nay */}
          <LoggedFoodsList
            nutritionData={actualNutritionData}
            getFoodUnit={getFoodUnit}
            handleDeleteItem={handleDeleteItem}
          />

        </div>

        {/* SETTINGS / TARGETS MODAL */}
        <MacroTargetsModal
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          targetCalories={targetCalories}
          setTargetCalories={setTargetCalories}
          targetProtein={targetProtein}
          setTargetProtein={setTargetProtein}
          targetCarbs={targetCarbs}
          setTargetCarbs={setTargetCarbs}
          targetFat={targetFat}
          setTargetFat={setTargetFat}
          targetFiber={targetFiber}
          setTargetFiber={setTargetFiber}
          targetWater={targetWater}
          setTargetWater={setTargetWater}
          handleSaveTargets={handleSaveTargets}
          handleAutoCalculateTargets={handleAutoCalculateTargets}
          isSavingTarget={isSavingTarget}
        />

        {/* BARCODE SCANNER MODAL */}
        {isScanning && (
          <BarcodeScannerModal
            onClose={() => setIsScanning(false)}
            onScanSuccess={handleBarcodeScanned}
          />
        )}

        {/* Global Toast */}
        {toast.show && (
          <div className="fixed left-1/2 top-[72px] -translate-x-1/2 z-[999999] bg-[var(--bg-secondary)]/90 backdrop-blur-sm border border-primary/30 text-[var(--text-color)] rounded-2xl px-4 py-2.5 flex items-center gap-2 shadow-lg animate-slide-down">
            <Check className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold leading-none">{toast.message}</span>
          </div>
        )}

      </div>
    </div>
  );
}
