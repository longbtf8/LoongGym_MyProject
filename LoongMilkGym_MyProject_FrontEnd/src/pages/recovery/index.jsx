import React from "react";
import { Link } from "react-router-dom";
import { Heart, Calendar, Info, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { useRecoveryData } from "./hooks/useRecoveryData";
import ActiveInjuryBanner from "./components/ActiveInjuryBanner";
import RecoveryTab from "./components/RecoveryTab";
import MetricsTab from "./components/MetricsTab";
import InjuriesTab from "./components/InjuriesTab";
import RecoveryOverview from "./components/RecoveryOverview";
import paths from "@/config/path";

export default function Recovery() {
  const {
    activeTab,
    setActiveTab,
    alert,
    activeInfo,
    toggleInfo,
    overviewData,
    isLoading,
    // Daily recovery states & handles
    sleepHours,
    setSleepHours,
    sorenessLevel,
    setSorenessLevel,
    energyLevel,
    setEnergyLevel,
    stressLevel,
    setStressLevel,
    hrvMs,
    setHrvMs,
    restingHeartRate,
    setRestingHeartRate,
    recoveryNotes,
    setRecoveryNotes,
    bedtime,
    setBedtime,
    wakeTime,
    setWakeTime,
    showSleepCalc,
    setShowSleepCalc,
    liveScore,
    handleCalculateSleep,
    handleSubmitRecovery,
    isLoggingRecovery,
    // Metrics states & handles
    weightKg,
    setWeightKg,
    bodyFatPercent,
    setBodyFatPercent,
    muscleMassKg,
    setMuscleMassKg,
    waistCm,
    setWaistCm,
    chestCm,
    setChestCm,
    armCm,
    setArmCm,
    thighCm,
    setThighCm,
    metricsNotes,
    setMetricsNotes,
    photoType,
    setPhotoType,
    photoUrl,
    setPhotoUrl,
    localPhotoFile,
    setLocalPhotoFile,
    handleLogMetrics,
    handlePhotoUpload,
    handleDeletePhoto,
    isLoggingMetric,
    isUploadingPhoto,
    // Injury states & handles
    bodyPart,
    setBodyPart,
    severity,
    setSeverity,
    painLevel,
    setPainLevel,
    injuryDesc,
    setInjuryDesc,
    startedAt,
    setStartedAt,
    handleLogInjury,
    handleResolveInjury,
    isLoggingInjury,
    todayDateStr,
  } = useRecoveryData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-[var(--text-muted)]">Đang tải dữ liệu phục hồi...</span>
        </div>
      </div>
    );
  }

  const { recovery, activeInjuries = [], latestMetrics, latestPhotos = [] } = overviewData?.data || {};

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 pb-28 lg:pb-12 transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">

        {/* BACK TO DASHBOARD LINK */}
        <div className="self-start">
          <Link 
            to={paths.dashboard} 
            className="inline-flex items-center gap-2 text-xs font-black uppercase text-[var(--text-muted)] hover:text-primary no-underline transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Quay lại bảng điều khiển
          </Link>
        </div>

        {/* ALERT NOTIFICATION */}
        {alert && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[99999] pointer-events-none w-full max-w-md px-4 flex justify-center">
            <div className="flex items-center gap-3.5 px-4.5 py-3 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border backdrop-blur-xl animate-slide-down pointer-events-auto max-w-sm w-full bg-[var(--bg-secondary)]/95 border-[var(--border-color)] text-[var(--text-color)]">
              <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl ${
                alert.type === "success" ? "bg-emerald-500/15" : alert.type === "error" ? "bg-red-500/15" : "bg-primary/15"
              }`}>
                {alert.type === "success" ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                ) : alert.type === "error" ? (
                  <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
                ) : (
                  <Info className="w-4.5 h-4.5 text-primary" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className={`text-[9px] font-black tracking-wider uppercase ${
                  alert.type === "success" ? "text-emerald-500" : alert.type === "error" ? "text-red-500" : "text-primary"
                }`}>
                  {alert.type === "success" ? "Thành công" : alert.type === "error" ? "Cảnh báo" : "Thông tin"}
                </p>
                <p className="text-xs font-bold leading-normal text-[var(--text-color)]">{alert.text}</p>
              </div>
            </div>
          </div>
        )}

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
              <Heart className="w-8 h-8 text-primary animate-pulse" />
              Theo Dõi Phục Hồi & Sức Khỏe
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium mt-1">
              Phân tích cơ thể, giấc ngủ, chỉ số tim mạch và quản lý chấn thương để tập luyện tối ưu.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] px-3 py-1.5 rounded-full text-xs font-bold self-start md:self-auto">
            <Calendar className="w-4 h-4 text-primary" />
            Hôm nay: {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>

        {/* ACTIVE INJURY WARNING BANNER */}
        <ActiveInjuryBanner
          activeInjuries={activeInjuries}
          handleResolveInjury={handleResolveInjury}
        />

        {/* TAB BUTTONS */}
        <div className="flex bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1.5 rounded-3xl self-start overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab("recovery")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all border-0 cursor-pointer ${
              activeTab === "recovery" ? "bg-primary text-black shadow-md" : "bg-transparent text-[var(--text-muted)] hover:text-[var(--text-color)]"
            }`}
          >
            Nhật Ký Phục Hồi
          </button>
          <button
            onClick={() => setActiveTab("metrics")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all border-0 cursor-pointer ${
              activeTab === "metrics" ? "bg-primary text-black shadow-md" : "bg-transparent text-[var(--text-muted)] hover:text-[var(--text-color)]"
            }`}
          >
            Số Đo & Tiến Trình
          </button>
          <button
            onClick={() => setActiveTab("injuries")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all border-0 cursor-pointer ${
              activeTab === "injuries" ? "bg-primary text-black shadow-md" : "bg-transparent text-[var(--text-muted)] hover:text-[var(--text-color)]"
            }`}
          >
            Theo Dõi Chấn Thương
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* MAIN TAB COMPONENT (2/3 columns) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {activeTab === "recovery" && (
              <RecoveryTab
                sleepHours={sleepHours}
                setSleepHours={setSleepHours}
                sorenessLevel={sorenessLevel}
                setSorenessLevel={setSorenessLevel}
                energyLevel={energyLevel}
                setEnergyLevel={setEnergyLevel}
                stressLevel={stressLevel}
                setStressLevel={setStressLevel}
                hrvMs={hrvMs}
                setHrvMs={setHrvMs}
                restingHeartRate={restingHeartRate}
                setRestingHeartRate={setRestingHeartRate}
                recoveryNotes={recoveryNotes}
                setRecoveryNotes={setRecoveryNotes}
                bedtime={bedtime}
                setBedtime={setBedtime}
                wakeTime={wakeTime}
                setWakeTime={setWakeTime}
                showSleepCalc={showSleepCalc}
                setShowSleepCalc={setShowSleepCalc}
                activeInfo={activeInfo}
                toggleInfo={toggleInfo}
                handleCalculateSleep={handleCalculateSleep}
                handleSubmitRecovery={handleSubmitRecovery}
                isLoggingRecovery={isLoggingRecovery}
              />
            )}

            {activeTab === "metrics" && (
              <MetricsTab
                weightKg={weightKg}
                setWeightKg={setWeightKg}
                bodyFatPercent={bodyFatPercent}
                setBodyFatPercent={setBodyFatPercent}
                muscleMassKg={muscleMassKg}
                setMuscleMassKg={setMuscleMassKg}
                waistCm={waistCm}
                setWaistCm={setWaistCm}
                chestCm={chestCm}
                setChestCm={setChestCm}
                armCm={armCm}
                setArmCm={setArmCm}
                thighCm={thighCm}
                setThighCm={setThighCm}
                metricsNotes={metricsNotes}
                setMetricsNotes={setMetricsNotes}
                photoType={photoType}
                setPhotoType={setPhotoType}
                photoUrl={photoUrl}
                setPhotoUrl={setPhotoUrl}
                localPhotoFile={localPhotoFile}
                setLocalPhotoFile={setLocalPhotoFile}
                handleLogMetrics={handleLogMetrics}
                handlePhotoUpload={handlePhotoUpload}
                isLoggingMetric={isLoggingMetric}
                isUploadingPhoto={isUploadingPhoto}
              />
            )}

            {activeTab === "injuries" && (
              <InjuriesTab
                bodyPart={bodyPart}
                setBodyPart={setBodyPart}
                severity={severity}
                setSeverity={setSeverity}
                painLevel={painLevel}
                setPainLevel={setPainLevel}
                injuryDesc={injuryDesc}
                setInjuryDesc={setInjuryDesc}
                startedAt={startedAt}
                setStartedAt={setStartedAt}
                handleLogInjury={handleLogInjury}
                handleResolveInjury={handleResolveInjury}
                activeInjuries={activeInjuries}
                isLoggingInjury={isLoggingInjury}
                todayDateStr={todayDateStr}
              />
            )}
          </div>

          {/* OVERVIEW PANEL (1/3 column) */}
          <div className="lg:col-span-1">
            <RecoveryOverview
              liveScore={liveScore}
              recovery={recovery}
              latestMetrics={latestMetrics}
              latestPhotos={latestPhotos}
              handleDeletePhoto={handleDeletePhoto}
            />
          </div>

        </div>

      </div>
    </div>
  );
}
