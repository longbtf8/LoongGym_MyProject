import React, { useState, useEffect } from "react";
import {
  Heart,
  Moon,
  Zap,
  Activity,
  Smile,
  ShieldAlert,
  Scale,
  Camera,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
  HelpCircle,
  PlusCircle
} from "lucide-react";
import {
  useGetTodayOverviewQuery,
  useLogRecoveryMutation,
  useLogInjuryMutation,
  useUpdateInjuryMutation,
  useLogBodyMetricMutation,
  useUploadProgressPhotoMutation
} from "@/services/recovery/recoveryApi";

export default function Recovery() {
  const [activeTab, setActiveTab] = useState("recovery"); // recovery, metrics, injuries
  const [alert, setAlert] = useState(null);
  const [activeInfo, setActiveInfo] = useState(null); // sleep, soreness, energy, stress, hrv, rhr

  // Queries & Mutations
  const todayDateStr = new Date().toISOString().split("T")[0];
  const { data: overviewData, isLoading, refetch } = useGetTodayOverviewQuery(todayDateStr);
  const [logRecovery, { isLoading: isLoggingRecovery }] = useLogRecoveryMutation();
  const [logInjury, { isLoading: isLoggingInjury }] = useLogInjuryMutation();
  const [updateInjury, { isLoading: isUpdatingInjury }] = useUpdateInjuryMutation();
  const [logBodyMetric, { isLoading: isLoggingMetric }] = useLogBodyMetricMutation();
  const [uploadProgressPhoto, { isLoading: isUploadingPhoto }] = useUploadProgressPhotoMutation();

  // Alert Auto-dismiss
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const triggerAlert = (type, text) => {
    setAlert({ type, text });
  };

  const toggleInfo = (key) => {
    setActiveInfo(activeInfo === key ? null : key);
  };

  // --- TAB 1: RECOVERY FORM STATES ---
  const [sleepHours, setSleepHours] = useState(8);
  const [sorenessLevel, setSorenessLevel] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(8);
  const [stressLevel, setStressLevel] = useState(2);
  const [hrvMs, setHrvMs] = useState("");
  const [restingHeartRate, setRestingHeartRate] = useState("");
  const [recoveryNotes, setRecoveryNotes] = useState("");

  // Sleep Calculator States
  const [bedtime, setBedtime] = useState("22:30");
  const [wakeTime, setWakeTime] = useState("06:30");
  const [showSleepCalc, setShowSleepCalc] = useState(false);

  // Pre-fill Recovery fields when database data arrives
  useEffect(() => {
    if (overviewData?.data?.recovery) {
      const rec = overviewData.data.recovery;
      setSleepHours(rec.sleepHours);
      setSorenessLevel(rec.sorenessLevel);
      setEnergyLevel(rec.energyLevel);
      setStressLevel(rec.stressLevel);
      setHrvMs(rec.hrvMs || "");
      setRestingHeartRate(rec.restingHeartRate || "");
      setRecoveryNotes(rec.notes || "");
    }
  }, [overviewData]);

  // Live score calculation algorithm
  const calculateLiveScore = () => {
    // 1. Sleep hours score (35% weight)
    let sleepScore = 0;
    if (sleepHours >= 7.5 && sleepHours <= 9.0) {
      sleepScore = 100;
    } else if (sleepHours >= 6.0 && sleepHours < 7.5) {
      sleepScore = 70 + ((sleepHours - 6.0) / (7.5 - 6.0)) * (100 - 70);
    } else if (sleepHours >= 4.0 && sleepHours < 6.0) {
      sleepScore = 30 + ((sleepHours - 4.0) / (6.0 - 4.0)) * (70 - 30);
    } else if (sleepHours < 4.0) {
      sleepScore = 10 + (Math.max(0, sleepHours) / 4.0) * (30 - 10);
    } else if (sleepHours > 9.0 && sleepHours <= 10.5) {
      sleepScore = 100 - ((sleepHours - 9.0) / (10.5 - 9.0)) * (100 - 85);
    } else {
      sleepScore = Math.max(50, 85 - ((Math.min(24, sleepHours) - 10.5) / (24.0 - 10.5)) * (85 - 50));
    }

    // 2. Soreness score (25% weight)
    const sorenessLevelInt = Math.max(1, Math.min(10, Math.round(sorenessLevel)));
    const sorenessMapping = {
      1: 100,
      2: 95,
      3: 90,
      4: 80,
      5: 70,
      6: 55,
      7: 45,
      8: 30,
      9: 20,
      10: 5,
    };
    const sorenessScore = sorenessMapping[sorenessLevelInt] || 70;

    // 3. Energy score (20% weight)
    const energyLevelInt = Math.max(1, Math.min(10, Math.round(energyLevel)));
    const energyMapping = {
      10: 100,
      9: 95,
      8: 85,
      7: 70,
      6: 60,
      5: 45,
      4: 35,
      3: 20,
      2: 10,
      1: 5,
    };
    const energyScore = energyMapping[energyLevelInt] || 60;

    // 4. Stress score (20% weight)
    const stressLevelInt = Math.max(1, Math.min(10, Math.round(stressLevel)));
    const stressMapping = {
      1: 100,
      2: 95,
      3: 85,
      4: 70,
      5: 60,
      6: 45,
      7: 35,
      8: 20,
      9: 10,
      10: 5,
    };
    const stressScore = stressMapping[stressLevelInt] || 60;

    const totalScore = sleepScore * 0.35 + sorenessScore * 0.25 + energyScore * 0.20 + stressScore * 0.20;
    return Math.round(totalScore);
  };

  const liveScore = calculateLiveScore();

  // Calculate sleep from Bedtime and Wake time
  const handleCalculateSleep = () => {
    const [bedH, bedM] = bedtime.split(":").map(Number);
    const [wakeH, wakeM] = wakeTime.split(":").map(Number);

    let bedDate = new Date(2026, 0, 1, bedH, bedM);
    let wakeDate = new Date(2026, 0, 1, wakeH, wakeM);

    if (wakeDate < bedDate) {
      wakeDate.setDate(wakeDate.getDate() + 1);
    }

    const diffMs = wakeDate - bedDate;
    const hours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
    setSleepHours(hours);
    setShowSleepCalc(false);
    triggerAlert("success", `Đã tính toán thời gian ngủ: ${hours} tiếng`);
  };

  const handleSubmitRecovery = async (e) => {
    e.preventDefault();

    // Front-end Validations
    if (restingHeartRate && (Number(restingHeartRate) < 30 || Number(restingHeartRate) > 220)) {
      triggerAlert("error", "Nhịp tim nghỉ ngơi phải nằm trong khoảng 30 - 220 BPM");
      return;
    }
    if (hrvMs && (Number(hrvMs) < 10 || Number(hrvMs) > 250)) {
      triggerAlert("error", "Chỉ số HRV phải nằm trong khoảng 10 - 250 ms");
      return;
    }

    try {
      await logRecovery({
        logDate: todayDateStr,
        sleepHours,
        sorenessLevel,
        energyLevel,
        stressLevel,
        hrvMs: hrvMs ? Number(hrvMs) : null,
        restingHeartRate: restingHeartRate ? Number(restingHeartRate) : null,
        notes: recoveryNotes || null
      }).unwrap();
      triggerAlert("success", "Đã lưu nhật ký phục hồi thành công!");
    } catch (err) {
      triggerAlert("error", err?.data?.message || "Không thể lưu nhật ký phục hồi");
    }
  };

  // --- TAB 2: METRICS & PHOTOS STATES ---
  const [weightKg, setWeightKg] = useState("");
  const [bodyFatPercent, setBodyFatPercent] = useState("");
  const [muscleMassKg, setMuscleMassKg] = useState("");
  const [waistCm, setWaistCm] = useState("");
  const [chestCm, setChestCm] = useState("");
  const [armCm, setArmCm] = useState("");
  const [thighCm, setThighCm] = useState("");
  const [metricsNotes, setMetricsNotes] = useState("");

  const [photoType, setPhotoType] = useState("front");
  const [photoUrl, setPhotoUrl] = useState("");
  const [localPhotoFile, setLocalPhotoFile] = useState(null);

  const handleLogMetrics = async (e) => {
    e.preventDefault();

    // Front-end Validations
    if (weightKg && (Number(weightKg) < 30 || Number(weightKg) > 250)) {
      triggerAlert("error", "Cân nặng phải nằm trong khoảng 30 - 250 kg");
      return;
    }
    if (bodyFatPercent && (Number(bodyFatPercent) < 2 || Number(bodyFatPercent) > 60)) {
      triggerAlert("error", "Tỉ lệ mỡ cơ thể phải nằm trong khoảng 2% - 60%");
      return;
    }
    if (muscleMassKg && (Number(muscleMassKg) < 10 || Number(muscleMassKg) > 150)) {
      triggerAlert("error", "Khối lượng cơ phải nằm trong khoảng 10 - 150 kg");
      return;
    }
    const checkMeasurements = [chestCm, waistCm, armCm, thighCm];
    for (const val of checkMeasurements) {
      if (val && (Number(val) < 10 || Number(val) > 200)) {
        triggerAlert("error", "Số đo các vòng phải nằm trong khoảng 10 - 200 cm");
        return;
      }
    }

    try {
      await logBodyMetric({
        weightKg: weightKg ? Number(weightKg) : null,
        bodyFatPercent: bodyFatPercent ? Number(bodyFatPercent) : null,
        muscleMassKg: muscleMassKg ? Number(muscleMassKg) : null,
        waistCm: waistCm ? Number(waistCm) : null,
        chestCm: chestCm ? Number(chestCm) : null,
        armCm: armCm ? Number(armCm) : null,
        thighCm: thighCm ? Number(thighCm) : null,
        notes: metricsNotes || null
      }).unwrap();
      triggerAlert("success", "Ghi nhận chỉ số cơ thể thành công!");
      setWeightKg("");
      setBodyFatPercent("");
      setMuscleMassKg("");
      setWaistCm("");
      setChestCm("");
      setArmCm("");
      setThighCm("");
      setMetricsNotes("");
      refetch();
    } catch (err) {
      triggerAlert("error", err?.data?.message || "Không thể lưu chỉ số cơ thể");
    }
  };

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    let finalUrl = photoUrl;
    
    if (localPhotoFile) {
      finalUrl = URL.createObjectURL(localPhotoFile);
    }

    if (!finalUrl) {
      triggerAlert("error", "Vui lòng chọn tệp ảnh hoặc nhập đường dẫn URL ảnh");
      return;
    }

    try {
      await uploadProgressPhoto({
        photoUrl: finalUrl,
        photoType,
        takenAt: todayDateStr,
        visibility: "private"
      }).unwrap();
      triggerAlert("success", "Đăng tải ảnh tiến trình thành công!");
      setPhotoUrl("");
      setLocalPhotoFile(null);
      refetch();
    } catch (err) {
      triggerAlert("error", err?.data?.message || "Không thể đăng tải ảnh");
    }
  };

  // --- TAB 3: INJURY STATES ---
  const [bodyPart, setBodyPart] = useState("");
  const [severity, setSeverity] = useState("mild");
  const [painLevel, setPainLevel] = useState(3);
  const [injuryDesc, setInjuryDesc] = useState("");
  const [startedAt, setStartedAt] = useState(todayDateStr);

  const handleLogInjury = async (e) => {
    e.preventDefault();
    if (!bodyPart.trim()) {
      triggerAlert("error", "Vui lòng nhập vị trí chấn thương");
      return;
    }

    const VALID_BODY_PARTS_KEYWORDS = [
      "vai", "ngực", "lưng", "xô", "bụng", "mông", "đùi", "bắp chân", "tay", "cổ tay", "cổ chân", 
      "khớp gối", "gối", "khuỷu tay", "khớp vai", "cổ", "hông", "khớp", "cơ", "gân", "khớp háng", 
      "gót chân", "cẳng tay", "bắp tay", "tay sau", "tay trước", "shoulder", "chest", "back", 
      "lat", "abs", "core", "glute", "thigh", "quad", "hamstring", "calf", "calves", "arm", 
      "bicep", "tricep", "forearm", "wrist", "ankle", "knee", "elbow", "neck", "hip", "joint", 
      "muscle", "tendon", "groin", "heel"
    ];

    const normalized = bodyPart.trim().toLowerCase();
    const isRelated = VALID_BODY_PARTS_KEYWORDS.some(keyword => normalized.includes(keyword));
    if (!isRelated) {
      triggerAlert(
        "error",
        "Bộ phận này không liên quan đến tập luyện thể thao (ví dụ: Vai, Gối, Cổ tay, Lưng, Đùi...). Nếu đau nhức cơ quan khác, hãy đi khám bác sĩ ngay để nhận lời khuyên y tế."
      );
      return;
    }

    try {
      await logInjury({
        bodyPart,
        severity,
        painLevel,
        description: injuryDesc,
        startedAt,
        status: "active"
      }).unwrap();
      triggerAlert("success", "Ghi nhận chấn thương thành công!");
      setBodyPart("");
      setInjuryDesc("");
      refetch();
    } catch (err) {
      triggerAlert("error", err?.data?.message || "Không thể lưu chấn thương");
    }
  };

  const handleResolveInjury = async (id) => {
    try {
      await updateInjury({
        id,
        status: "resolved",
        resolvedAt: todayDateStr
      }).unwrap();
      triggerAlert("success", "Chúc mừng! Đã phục hồi chấn thương.");
      refetch();
    } catch (err) {
      triggerAlert("error", err?.data?.message || "Không thể cập nhật chấn thương");
    }
  };

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

        {/* ALERT NOTIFICATION */}
        {alert && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[99999] pointer-events-none w-full max-w-md px-4 flex justify-center">
            <div
              className={`flex items-center gap-3.5 px-4.5 py-3 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.35)] border backdrop-blur-xl animate-slide-down pointer-events-auto max-w-sm w-full ${
                alert.type === "success"
                  ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
                  : alert.type === "error"
                  ? "bg-red-950/80 border-red-500/40 text-red-300"
                  : "bg-neutral-900/90 border-neutral-700/50 text-white"
              }`}
            >
              <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-xl bg-white/10">
                {alert.type === "success" ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                ) : alert.type === "error" ? (
                  <AlertTriangle className="w-4.5 h-4.5 text-red-400" />
                ) : (
                  <Info className="w-4.5 h-4.5 text-blue-400" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="text-[10px] font-black tracking-wider uppercase opacity-60">
                  {alert.type === "success" ? "Thành công" : alert.type === "error" ? "Cảnh báo" : "Thông tin"}
                </p>
                <p className="text-xs font-bold leading-normal text-white">{alert.text}</p>
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
        {activeInjuries.length > 0 && (
          <div className="bg-red-500/10 border-2 border-red-500/30 rounded-3xl p-5 flex flex-col sm:flex-row items-start gap-4 animate-pulse-slow shadow-lg">
            <div className="bg-red-500 text-black p-2 rounded-2xl">
              <AlertTriangle className="w-6 h-6 font-bold" />
            </div>
            <div className="flex-1">
              <h4 className="font-extrabold text-sm sm:text-base text-red-400 uppercase tracking-wide">
                Cảnh báo chấn thương đang hoạt động!
              </h4>
              <p className="text-xs text-[var(--text-color)] font-medium mt-1">
                Hệ thống ghi nhận bạn đang gặp chấn thương vùng{" "}
                <strong className="text-red-400">
                  {activeInjuries.map((i) => i.bodyPart).join(", ")}
                </strong>
                . Vui lòng giảm 30-50% cường độ tập, tránh các bài tập tác động trực tiếp vùng này.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {activeInjuries.map((injury) => (
                  <button
                    key={injury.id}
                    onClick={() => handleResolveInjury(injury.id)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-black text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl border-0 flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã Khỏi: {injury.bodyPart}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB BUTTONS */}
        <div className="flex bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1.5 rounded-3xl self-start overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab("recovery")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all border-0 cursor-pointer ${
              activeTab === "recovery"
                ? "bg-primary text-black shadow-md"
                : "bg-transparent text-[var(--text-muted)] hover:text-[var(--text-color)]"
            }`}
          >
            <Moon className="w-4 h-4" />
            Nhật Ký Phục Hồi
          </button>
          <button
            onClick={() => setActiveTab("metrics")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all border-0 cursor-pointer ${
              activeTab === "metrics"
                ? "bg-primary text-black shadow-md"
                : "bg-transparent text-[var(--text-muted)] hover:text-[var(--text-color)]"
            }`}
          >
            <Scale className="w-4 h-4" />
            Số Đo & Tiến Trình
          </button>
          <button
            onClick={() => setActiveTab("injuries")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all border-0 cursor-pointer ${
              activeTab === "injuries"
                ? "bg-primary text-black shadow-md"
                : "bg-transparent text-[var(--text-muted)] hover:text-[var(--text-color)]"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Theo Dõi Chấn Thương
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* MAIN TAB COMPONENT (2/3 columns) */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* TAB 1: DAILY RECOVERY LOG */}
            {activeTab === "recovery" && (
              <form
                onSubmit={handleSubmitRecovery}
                className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[32px] p-6 shadow-xl flex flex-col gap-6"
              >
                <div>
                  <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Đánh Giá Cơ Thể Hôm Nay
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
                    Hệ thống sẽ tự động tổng hợp chỉ số phục hồi dựa trên dữ liệu bạn cung cấp.
                  </p>
                </div>

                {/* SLEEP INPUT WITH CALCULATOR */}
                <div className="flex flex-col gap-3 bg-[var(--bg-color)] border border-[var(--border-color)] p-4 rounded-2xl relative">
                  <div className="flex justify-between items-center">
                    <label className="text-xs sm:text-sm font-extrabold flex items-center gap-2 text-[var(--text-color)]">
                      <Moon className="w-4.5 h-4.5 text-purple-400" />
                      Thời gian ngủ thực tế
                      <button
                        type="button"
                        onClick={() => toggleInfo("sleep")}
                        className="p-0.5 hover:bg-primary/20 text-primary rounded-full border-0 bg-transparent cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-110"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </label>
                    <span className="text-sm font-black text-primary bg-primary/10 px-2.5 py-0.5 rounded-lg">
                      {sleepHours} tiếng
                    </span>
                  </div>

                  {activeInfo === "sleep" && (
                    <div className="absolute top-12 left-4 right-4 z-20 bg-[var(--bg-secondary)] border border-primary/30 p-3.5 rounded-xl text-[11px] text-[var(--text-muted)] leading-relaxed shadow-xl backdrop-blur-md animate-slide-up">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-extrabold text-primary flex items-center gap-1">
                          <Info className="w-3.5 h-3.5" /> Giải thích thuật ngữ
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleInfo("sleep")}
                          className="text-[var(--text-muted)] hover:text-primary border-0 bg-transparent cursor-pointer font-bold text-xs"
                        >
                          Đóng
                        </button>
                      </div>
                      👉 <strong>Giấc ngủ lý tưởng:</strong> Từ 7.5 - 9 tiếng là lý tưởng nhất (đạt 100 điểm ngủ). Thiếu ngủ trầm trọng (dưới 5 tiếng) hoặc ngủ quá nhiều (trên 11 tiếng) làm tăng Cortisol (hóc môn căng thẳng) gây dị hóa, cản trở tổng hợp cơ bắp và làm giảm sự tập trung.
                    </div>
                  )}

                  <input
                    type="range"
                    min="2"
                    max="14"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(Number(e.target.value))}
                    className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    <span>Thiếu ngủ (2h)</span>
                    <span>Tối ưu (7.5 - 9h)</span>
                    <span>Quá nhiều (14h)</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowSleepCalc(!showSleepCalc)}
                    className="self-start text-[10px] text-primary hover:underline font-bold flex items-center gap-1 border-0 bg-transparent cursor-pointer p-0"
                  >
                    <Clock className="w-3 h-3" />
                    {showSleepCalc ? "Ẩn công cụ tính" : "Tính từ giờ ngủ & giờ dậy"}
                  </button>

                  {showSleepCalc && (
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-3.5 rounded-xl flex flex-col sm:flex-row items-center gap-4 mt-2 animate-slide-up">
                      <div className="flex flex-col gap-1.5 w-full">
                        <span className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">Giờ đi ngủ</span>
                        <input
                          type="time"
                          value={bedtime}
                          onChange={(e) => setBedtime(e.target.value)}
                          className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-color)] outline-none focus:border-primary w-full"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 w-full">
                        <span className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">Giờ thức dậy</span>
                        <input
                          type="time"
                          value={wakeTime}
                          onChange={(e) => setWakeTime(e.target.value)}
                          className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-color)] outline-none focus:border-primary w-full"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleCalculateSleep}
                        className="bg-primary text-black hover:bg-primary-hover px-4 py-2 rounded-xl text-xs font-black mt-4 sm:mt-5 w-full sm:w-auto border-0 cursor-pointer transition-all"
                      >
                        Áp Dụng
                      </button>
                    </div>
                  )}
                </div>

                {/* SORENESS INPUT */}
                <div className="flex flex-col gap-3 bg-[var(--bg-color)] border border-[var(--border-color)] p-4 rounded-2xl relative">
                  <div className="flex justify-between items-center">
                    <label className="text-xs sm:text-sm font-extrabold flex items-center gap-2 text-[var(--text-color)]">
                      <Activity className="w-4.5 h-4.5 text-emerald-400" />
                      Độ đau mỏi cơ bắp
                      <button
                        type="button"
                        onClick={() => toggleInfo("soreness")}
                        className="p-0.5 hover:bg-emerald-500/20 text-emerald-400 rounded-full border-0 bg-transparent cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-110"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </label>
                    <span className="text-sm font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg">
                      Mức {sorenessLevel}/10
                    </span>
                  </div>

                  {activeInfo === "soreness" && (
                    <div className="absolute top-12 left-4 right-4 z-20 bg-[var(--bg-secondary)] border border-emerald-500/30 p-3.5 rounded-xl text-[11px] text-[var(--text-muted)] leading-relaxed shadow-xl backdrop-blur-md animate-slide-up">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-extrabold text-emerald-400 flex items-center gap-1">
                          <Info className="w-3.5 h-3.5" /> Giải thích thuật ngữ
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleInfo("soreness")}
                          className="text-[var(--text-muted)] hover:text-emerald-400 border-0 bg-transparent cursor-pointer font-bold text-xs"
                        >
                          Đóng
                        </button>
                      </div>
                      👉 <strong>Đau mỏi cơ (DOMS):</strong> Là tình trạng cơ bắp bị xé rách vi mô sau các buổi tập kháng lực. Mức nhẹ (1-3) là bình thường, sẵn sàng tập tiếp. Mức vừa (4-7) nên khởi động kỹ và giảm 20% tạ. Mức nặng (8-10) là cơ bắp bị quá tải nặng, có nguy cơ chấn thương cao, nên nghỉ ngơi hoặc giãn cơ nhẹ.
                    </div>
                  )}

                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setSorenessLevel(num)}
                        className={`h-9 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                          sorenessLevel === num
                            ? "bg-emerald-500 text-black border-emerald-500 shadow-md scale-105"
                            : "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-emerald-500 hover:text-[var(--text-color)]"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-[var(--text-muted)]">
                    {sorenessLevel <= 3
                      ? "🟢 Cơ bắp hoàn toàn bình phục, sẵn sàng tập nặng."
                      : sorenessLevel <= 5
                      ? "🟡 Đau cơ nhẹ (DOMS), hoạt động bình thường, cân nhắc giãn cơ."
                      : sorenessLevel <= 7
                      ? "🟠 Đau cơ vừa, cảm thấy căng cứng, nên giảm 20-30% tạ."
                      : "🔴 Đau mỏi dữ dội, nguy cơ chấn thương cao, nên nghỉ hoặc cardio nhẹ."}
                  </span>
                </div>

                {/* ENERGY LEVEL */}
                <div className="flex flex-col gap-3 bg-[var(--bg-color)] border border-[var(--border-color)] p-4 rounded-2xl relative">
                  <div className="flex justify-between items-center">
                    <label className="text-xs sm:text-sm font-extrabold flex items-center gap-2 text-[var(--text-color)]">
                      <Zap className="w-4.5 h-4.5 text-primary" />
                      Mức năng lượng cơ thể
                      <button
                        type="button"
                        onClick={() => toggleInfo("energy")}
                        className="p-0.5 hover:bg-primary/20 text-primary rounded-full border-0 bg-transparent cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-110"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </label>
                    <span className="text-sm font-black text-primary bg-primary/10 px-2.5 py-0.5 rounded-lg">
                      Mức {energyLevel}/10
                    </span>
                  </div>

                  {activeInfo === "energy" && (
                    <div className="absolute top-12 left-4 right-4 z-20 bg-[var(--bg-secondary)] border border-primary/30 p-3.5 rounded-xl text-[11px] text-[var(--text-muted)] leading-relaxed shadow-xl backdrop-blur-md animate-slide-up">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-extrabold text-primary flex items-center gap-1">
                          <Info className="w-3.5 h-3.5" /> Giải thích thuật ngữ
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleInfo("energy")}
                          className="text-[var(--text-muted)] hover:text-primary border-0 bg-transparent cursor-pointer font-bold text-xs"
                        >
                          Đóng
                        </button>
                      </div>
                      👉 <strong>Năng lượng (CNS Energy):</strong> Thể hiện mức năng lượng vật lý và Hệ thần kinh trung ương (Central Nervous System). Năng lượng cao (8-10) báo hiệu Glycogen đầy kho dự trữ, thích hợp đẩy tạ nặng (PR). Năng lượng thấp (1-3) chứng tỏ cơ thể cạn kiệt, tập nặng rất dễ chấn thương do thần kinh mỏi.
                    </div>
                  )}

                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setEnergyLevel(num)}
                        className={`h-9 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                          energyLevel === num
                            ? "bg-primary text-black border-primary shadow-md scale-105"
                            : "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-primary hover:text-[var(--text-color)]"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-[var(--text-muted)]">
                    {energyLevel <= 3
                      ? "🔴 Kiệt quệ tinh thần và thể chất, không nên tập tạ."
                      : energyLevel <= 5
                      ? "🟡 Hơi uể oải, năng lượng trung bình."
                      : energyLevel <= 7
                      ? "🟢 Sức khỏe ổn định, sẵn sàng cho buổi tập bình thường."
                      : "🔥 Tràn đầy năng lượng sung mãn, sẵn sàng phá PR tạ!"}
                  </span>
                </div>

                {/* STRESS LEVEL */}
                <div className="flex flex-col gap-3 bg-[var(--bg-color)] border border-[var(--border-color)] p-4 rounded-2xl relative">
                  <div className="flex justify-between items-center">
                    <label className="text-xs sm:text-sm font-extrabold flex items-center gap-2 text-[var(--text-color)]">
                      <Smile className="w-4.5 h-4.5 text-orange-400" />
                      Mức độ căng thẳng (Stress)
                      <button
                        type="button"
                        onClick={() => toggleInfo("stress")}
                        className="p-0.5 hover:bg-orange-500/20 text-orange-400 rounded-full border-0 bg-transparent cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-110"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </label>
                    <span className="text-sm font-black text-orange-400 bg-orange-400/10 px-2.5 py-0.5 rounded-lg">
                      Mức {stressLevel}/10
                    </span>
                  </div>

                  {activeInfo === "stress" && (
                    <div className="absolute top-12 left-4 right-4 z-20 bg-[var(--bg-secondary)] border border-orange-500/30 p-3.5 rounded-xl text-[11px] text-[var(--text-muted)] leading-relaxed shadow-xl backdrop-blur-md animate-slide-up">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-extrabold text-orange-400 flex items-center gap-1">
                          <Info className="w-3.5 h-3.5" /> Giải thích thuật ngữ
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleInfo("stress")}
                          className="text-[var(--text-muted)] hover:text-orange-400 border-0 bg-transparent cursor-pointer font-bold text-xs"
                        >
                          Đóng
                        </button>
                      </div>
                      👉 <strong>Mức độ căng thẳng:</strong> Stress tâm lý làm gia tăng hormone Cortisol - khắc tinh của cơ bắp. Khi Cortisol tăng cao, cơ thể sẽ ưu tiên tích trữ mỡ thừa và phân hủy sợi cơ để tạo năng lượng (dị hóa), đồng thời làm chậm tốc độ tổng hợp protein và phục hồi cơ tới 50%.
                    </div>
                  )}

                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setStressLevel(num)}
                        className={`h-9 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                          stressLevel === num
                            ? "bg-orange-400 text-black border-orange-400 shadow-md scale-105"
                            : "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-orange-400 hover:text-[var(--text-color)]"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-[var(--text-muted)]">
                    {stressLevel <= 3
                      ? "🟢 Hoàn toàn thư giãn, tinh thần thoải mái."
                      : stressLevel <= 6
                      ? "🟡 Căng thẳng nhẹ từ công việc/học tập, bình thường."
                      : stressLevel <= 8
                      ? "🟠 Áp lực nặng nề, cơ thể sinh ra nhiều Cortisol, làm chậm hồi phục cơ."
                      : "🔴 Stress cực hạn, nên tập trung vào hít thở sâu, yoga hoặc giãn cơ."}
                  </span>
                </div>

                {/* TIM MẠCH (RHR & HRV) INPUTS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-[10px] uppercase font-black tracking-wider text-[var(--text-muted)] flex items-center gap-1">
                      Nhịp Tim Nghỉ Ngơi (BPM)
                      <button
                        type="button"
                        onClick={() => toggleInfo("rhr")}
                        className="p-0.5 hover:bg-rose-500/20 text-rose-400 rounded-full border-0 bg-transparent cursor-pointer transition-all duration-200 hover:scale-110"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </label>
                    {activeInfo === "rhr" && (
                      <div className="absolute top-8 left-0 right-0 z-20 bg-[var(--bg-secondary)] border border-rose-500/30 p-2.5 rounded-xl text-[10px] text-[var(--text-muted)] leading-relaxed shadow-xl backdrop-blur-md animate-slide-up">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-extrabold text-rose-400 flex items-center gap-1">
                            <Info className="w-3 h-3" /> RHR (Nhịp tim nghỉ ngơi)
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleInfo("rhr")}
                            className="text-[var(--text-muted)] hover:text-rose-400 border-0 bg-transparent cursor-pointer font-bold text-[10px]"
                          >
                            Đóng
                          </button>
                        </div>
                        💓 <strong>RHR (Resting Heart Rate):</strong> Thường đo lúc mới thức dậy. RHR của người khỏe mạnh từ 60-80 BPM, vận động viên thể thao thường dưới 60 BPM. Nếu nhịp tim nghỉ ngơi của bạn hôm nay tăng vọt từ 5-10 nhịp so với trung bình, đó là báo hiệu cơ thể chưa phục hồi hoàn toàn hoặc thiếu ngủ trầm trọng.
                      </div>
                    )}
                    <input
                      type="number"
                      placeholder="Ví dụ: 65 (30 - 220)"
                      value={restingHeartRate}
                      onChange={(e) => setRestingHeartRate(e.target.value)}
                      className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-color)] outline-none focus:border-primary w-full"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-[10px] uppercase font-black tracking-wider text-[var(--text-muted)] flex items-center gap-1">
                      Biến Thiên Nhịp Tim (HRV - ms)
                      <button
                        type="button"
                        onClick={() => toggleInfo("hrv")}
                        className="p-0.5 hover:bg-blue-500/20 text-blue-400 rounded-full border-0 bg-transparent cursor-pointer transition-all duration-200 hover:scale-110"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </label>
                    {activeInfo === "hrv" && (
                      <div className="absolute top-8 left-0 right-0 z-20 bg-[var(--bg-secondary)] border border-blue-500/30 p-2.5 rounded-xl text-[10px] text-[var(--text-muted)] leading-relaxed shadow-xl backdrop-blur-md animate-slide-up">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-extrabold text-blue-400 flex items-center gap-1">
                            <Info className="w-3 h-3" /> HRV (Biến thiên nhịp tim)
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleInfo("hrv")}
                            className="text-[var(--text-muted)] hover:text-blue-400 border-0 bg-transparent cursor-pointer font-bold text-[10px]"
                          >
                            Đóng
                          </button>
                        </div>
                        📈 <strong>HRV (Heart Rate Variability):</strong> Đo lường biến thiên thời gian giữa các nhịp tim liên tiếp. Chỉ số HRV cao chứng tỏ Hệ thần kinh đối giao cảm hoạt động tốt, cơ thể sẵn sàng chịu tải tạ nặng. HRV thấp cảnh báo bạn đang kiệt sức hoặc bị stress (cơ thể cần được nghỉ ngơi).
                      </div>
                    )}
                    <input
                      type="number"
                      placeholder="Ví dụ: 55 (10 - 250)"
                      value={hrvMs}
                      onChange={(e) => setHrvMs(e.target.value)}
                      className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-color)] outline-none focus:border-primary w-full"
                    />
                  </div>
                </div>

                {/* WEARABLES INFO BOX */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-3.5">
                  <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] sm:text-xs text-[var(--text-muted)] leading-relaxed">
                    <strong className="text-[var(--text-color)]">💡 Gợi ý thiết bị đeo:</strong> Nếu sở hữu đồng hồ thông minh (Apple Watch, Garmin, Fitbit, Samsung Watch), bạn có thể lấy chỉ số <strong className="text-primary">HRV</strong> và <strong className="text-primary">Resting Heart Rate</strong> tự động đo lúc ngủ. Các chỉ số sinh học này phản ánh cực kỳ chính xác hoạt động của Hệ thần kinh thực vật (Autonomic Nervous System), giúp thuật toán phân tích trạng thái hồi phục của bạn tốt nhất.
                  </p>
                </div>

                {/* NOTE TEXTAREA */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-black tracking-wider text-[var(--text-muted)]">
                    Ghi Chú Phục Hồi Thêm
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Hôm nay thấy cơ ngực hơi nhức nhẹ, đầu óc minh mẫn..."
                    value={recoveryNotes}
                    onChange={(e) => setRecoveryNotes(e.target.value)}
                    className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-color)] outline-none resize-none focus:border-primary"
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isLoggingRecovery}
                  className="bg-primary hover:bg-primary-hover text-black h-12 rounded-2xl text-xs font-black uppercase tracking-wider border-0 flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md mt-2"
                >
                  <CheckCircle2 className="w-4.5 h-4.5" />
                  {isLoggingRecovery ? "Đang lưu..." : "Lưu nhật ký phục hồi"}
                </button>
              </form>
            )}

            {/* TAB 2: BODY METRICS & PROGRESS PHOTOS */}
            {activeTab === "metrics" && (
              <div className="flex flex-col gap-6">

                {/* BODY METRICS INPUT */}
                <form
                  onSubmit={handleLogMetrics}
                  className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[32px] p-6 shadow-xl flex flex-col gap-6"
                >
                  <div>
                    <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
                      <Scale className="w-5 h-5 text-primary" />
                      Ghi Nhận Chỉ Số Cơ Thể
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
                      Theo dõi cân nặng và số đo cơ thể theo thời gian để đánh giá chính xác tiến trình tập luyện.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-black tracking-wider text-[var(--text-muted)]">Cân nặng (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Ví dụ: 72.5 (30 - 250)"
                        value={weightKg}
                        onChange={(e) => setWeightKg(e.target.value)}
                        className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-color)] outline-none focus:border-primary w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-black tracking-wider text-[var(--text-muted)]">Tỉ lệ mỡ (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Ví dụ: 14.5 (2 - 60)"
                        value={bodyFatPercent}
                        onChange={(e) => setBodyFatPercent(e.target.value)}
                        className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-color)] outline-none focus:border-primary w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-black tracking-wider text-[var(--text-muted)]">Khối lượng cơ (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Ví dụ: 35.8 (10 - 150)"
                        value={muscleMassKg}
                        onChange={(e) => setMuscleMassKg(e.target.value)}
                        className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-color)] outline-none focus:border-primary w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[var(--border-color)] pt-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-black tracking-wider text-[var(--text-muted)]">Vòng ngực (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="10 - 200 cm"
                        value={chestCm}
                        onChange={(e) => setChestCm(e.target.value)}
                        className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-color)] outline-none focus:border-primary w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-black tracking-wider text-[var(--text-muted)]">Vòng eo (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="10 - 200 cm"
                        value={waistCm}
                        onChange={(e) => setWaistCm(e.target.value)}
                        className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-color)] outline-none focus:border-primary w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-black tracking-wider text-[var(--text-muted)]">Bắp tay (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="10 - 200 cm"
                        value={armCm}
                        onChange={(e) => setArmCm(e.target.value)}
                        className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-color)] outline-none focus:border-primary w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-black tracking-wider text-[var(--text-muted)]">Vòng đùi (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="10 - 200 cm"
                        value={thighCm}
                        onChange={(e) => setThighCm(e.target.value)}
                        className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-color)] outline-none focus:border-primary w-full"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-black tracking-wider text-[var(--text-muted)]">Ghi chú số đo</label>
                    <input
                      type="text"
                      placeholder="Đo lúc mới ngủ dậy chưa ăn uống..."
                      value={metricsNotes}
                      onChange={(e) => setMetricsNotes(e.target.value)}
                      className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-color)] outline-none focus:border-primary w-full"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingMetric}
                    className="bg-primary hover:bg-primary-hover text-black h-12 rounded-2xl text-xs font-black uppercase tracking-wider border-0 flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                  >
                    <CheckCircle2 className="w-4.5 h-4.5" />
                    {isLoggingMetric ? "Đang lưu..." : "Lưu số đo cơ thể"}
                  </button>
                </form>

                {/* PROGRESS PHOTOS UPLOAD */}
                <form
                  onSubmit={handlePhotoUpload}
                  className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[32px] p-6 shadow-xl flex flex-col gap-5"
                >
                  <div>
                    <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
                      <Camera className="w-5 h-5 text-primary" />
                      Nhật Ký Ảnh Tiến Trình
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
                      Cân nặng chỉ là một phần, hình ảnh thực tế sẽ phản ánh chuẩn xác cơ thể của bạn.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex flex-col gap-2 w-full">
                      <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Góc chụp ảnh</span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: "front", label: "Mặt Trước" },
                          { value: "side", label: "Mặt Bên" },
                          { value: "back", label: "Mặt Sau" }
                        ].map((item) => (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => setPhotoType(item.value)}
                            className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                              photoType === item.value
                                ? "bg-primary text-black border-primary"
                                : "bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-muted)]"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 bg-[var(--bg-color)] border border-[var(--border-color)] p-5 rounded-2xl text-center">
                    <span className="text-xs font-bold text-[var(--text-color)]">Chọn ảnh từ thiết bị</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLocalPhotoFile(e.target.files[0])}
                      className="text-xs text-[var(--text-muted)] mx-auto"
                    />
                    <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Hoặc nhập URL ảnh trực tuyến</div>
                    <input
                      type="text"
                      placeholder="https://example.com/photo.jpg"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-[var(--text-color)] outline-none focus:border-primary w-full"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUploadingPhoto}
                    className="bg-primary hover:bg-primary-hover text-black h-12 rounded-2xl text-xs font-black uppercase tracking-wider border-0 flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                  >
                    <PlusCircle className="w-4.5 h-4.5" />
                    {isUploadingPhoto ? "Đang xử lý..." : "Thêm ảnh vào bộ sưu tập"}
                  </button>
                </form>
              </div>
            )}

            {/* TAB 3: INJURY TRACKER */}
            {activeTab === "injuries" && (
              <div className="flex flex-col gap-6">

                {/* LOG NEW INJURY */}
                <form
                  onSubmit={handleLogInjury}
                  className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[32px] p-6 shadow-xl flex flex-col gap-5"
                >
                  <div>
                    <h3 className="text-base sm:text-lg font-black flex items-center gap-2 text-red-400">
                      <AlertTriangle className="w-5 h-5" />
                      Báo Cáo Chấn Thương Mới
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
                      Ghi lại các cơn đau cơ khớp bất thường để hệ thống AI Coach và Lịch tập điều chỉnh phù hợp.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-black tracking-wider text-[var(--text-muted)]">Bộ phận cơ thể bị đau</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Vai phải, Khớp gối trái..."
                        value={bodyPart}
                        onChange={(e) => setBodyPart(e.target.value)}
                        className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-color)] outline-none focus:border-primary w-full"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-black tracking-wider text-[var(--text-muted)]">Mức độ chấn thương</label>
                      <select
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value)}
                        className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-color)] outline-none focus:border-primary w-full cursor-pointer"
                      >
                        <option value="mild">Nhẹ (Căng nhẹ, vẫn hoạt động được)</option>
                        <option value="moderate">Vừa (Đau khi vận động khớp, cần giảm tạ)</option>
                        <option value="severe">Nặng (Đau chói nhói dữ dội, cần dừng tập)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 bg-[var(--bg-color)] border border-[var(--border-color)] p-4 rounded-2xl">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm font-extrabold flex items-center gap-2 text-[var(--text-color)]">Độ đau đớn cảm nhận</span>
                      <span className="text-sm font-black text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-lg">Mức {painLevel}/10</span>
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPainLevel(num)}
                          className={`h-9 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                            painLevel === num
                              ? "bg-red-500 text-black border-red-500 shadow-md scale-105"
                              : "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-red-500 hover:text-[var(--text-color)]"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-black tracking-wider text-[var(--text-muted)]">Ngày bắt đầu đau</label>
                      <input
                        type="date"
                        value={startedAt}
                        onChange={(e) => setStartedAt(e.target.value)}
                        className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-color)] outline-none focus:border-primary w-full"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-black tracking-wider text-[var(--text-muted)]">Mô tả cụ thể triệu chứng</label>
                    <textarea
                      rows={3}
                      placeholder="Đau chói khi đẩy tạ ngực (Bench Press), khi giơ tay qua đầu cảm thấy nhói nhẹ..."
                      value={injuryDesc}
                      onChange={(e) => setInjuryDesc(e.target.value)}
                      className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-color)] outline-none resize-none focus:border-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingInjury}
                    className="bg-red-500 hover:bg-red-600 text-black h-12 rounded-2xl text-xs font-black uppercase tracking-wider border-0 flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                  >
                    <AlertTriangle className="w-4.5 h-4.5 font-bold" />
                    {isLoggingInjury ? "Đang ghi nhận..." : "Ghi nhận chấn thương"}
                  </button>
                </form>

                {/* HISTORICAL INJURIES */}
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[32px] p-6 shadow-xl flex flex-col gap-4">
                  <h3 className="text-base sm:text-lg font-black">Nhật Ký Chấn Thương & Phục Hồi</h3>
                  <p className="text-xs text-[var(--text-muted)] font-medium">Lịch sử ghi nhận trạng thái cơ khớp.</p>
                  
                  {activeInjuries.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-[var(--border-color)] rounded-2xl text-xs font-bold text-[var(--text-muted)]">
                      Không có chấn thương đang ghi nhận. Cơ thể bạn đang rất khỏe mạnh! 🟢
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {activeInjuries.map((injury) => (
                        <div
                          key={injury.id}
                          className="bg-[var(--bg-color)] border border-[var(--border-color)] p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-extrabold text-[var(--text-color)]">{injury.bodyPart}</span>
                              <span
                                className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  injury.severity === "severe"
                                    ? "bg-red-500/10 text-red-400"
                                    : injury.severity === "moderate"
                                    ? "bg-orange-500/10 text-orange-400"
                                    : "bg-yellow-500/10 text-yellow-400"
                                }`}
                              >
                                {injury.severity === "severe" ? "Nặng" : injury.severity === "moderate" ? "Vừa" : "Nhẹ"}
                              </span>
                              <span className="text-[10px] text-red-400 font-bold">Đau: {injury.painLevel}/10</span>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] font-medium mt-1 leading-relaxed">{injury.description || "Không có mô tả chi tiết."}</p>
                            <span className="text-[10px] font-bold text-[var(--text-muted)] block mt-1">Bắt đầu: {new Date(injury.startedAt).toLocaleDateString("vi-VN")}</span>
                          </div>

                          <button
                            onClick={() => handleResolveInjury(injury.id)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-black text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl border-0 flex items-center gap-1 cursor-pointer transition-all self-stretch sm:self-auto justify-center"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Đã Phục Hồi
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR ANALYSIS & EDUCATIONAL KNOWLEDGE (1/3 column) */}
          <div className="flex flex-col gap-6">

            {/* RECOVERY SCORE PREVIEW (GLASSMORPHISM) */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[32px] p-6 shadow-xl relative overflow-hidden flex flex-col items-center text-center">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/15 rounded-full blur-2xl"></div>

              <h3 className="text-xs sm:text-sm font-black text-[var(--text-color)] tracking-wider uppercase mb-5 flex items-center gap-1.5 self-start">
                <Sparkles className="w-4.5 h-4.5 text-primary" />
                Kết quả phục hồi hôm nay
              </h3>

              {/* PERFECTLY CENTERED SVG AND ABSOLUTE CONTENT GAUGE */}
              <div className="relative w-36 h-36 flex items-center justify-center mx-auto my-4">
                <svg className="w-36 h-36 transform -rotate-90 absolute top-0 left-0">
                  <circle
                    cx="72"
                    cy="72"
                    r="64"
                    className="stroke-neutral-200 dark:stroke-neutral-800"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="64"
                    className={`transition-all duration-1000 ease-out ${
                      liveScore >= 80
                        ? "stroke-emerald-500"
                        : liveScore >= 50
                        ? "stroke-yellow-500"
                        : "stroke-red-500"
                    }`}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={402.12}
                    strokeDashoffset={402.12 - (liveScore / 100) * 402.12}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-[var(--text-color)]">
                    {liveScore}%
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-wider mt-1 ${
                    liveScore >= 80
                      ? "text-emerald-500"
                      : liveScore >= 50
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}>
                    {liveScore >= 80 ? "Hoàn Hảo" : liveScore >= 50 ? "Sẵn Sàng" : "Cần Nghỉ Ngơi"}
                  </span>
                  <span className="text-[8px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">
                    {recovery ? "Đã lưu" : "Ước tính"}
                  </span>
                </div>
              </div>

              {recovery ? (
                <div className="flex flex-col gap-2 mt-4 w-full">
                  <div className="flex justify-between items-center text-xs font-bold border-b border-[var(--border-color)] pb-2">
                    <span className="text-[var(--text-muted)]">Giờ ngủ</span>
                    <span>{recovery.sleepHours} tiếng</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold border-b border-[var(--border-color)] pb-2">
                    <span className="text-[var(--text-muted)]">Đau cơ bắp</span>
                    <span>Mức {recovery.sorenessLevel}/10</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold border-b border-[var(--border-color)] pb-2">
                    <span className="text-[var(--text-muted)]">Mức năng lượng</span>
                    <span>Mức {recovery.energyLevel}/10</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-[var(--text-muted)]">Căng thẳng</span>
                    <span>Mức {recovery.stressLevel}/10</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed mt-2">
                  Bạn chưa lưu chỉ số sức khỏe của hôm nay. Vòng tròn trên đang biểu diễn điểm số ước tính dựa vào vị trí thanh trượt hiện tại của bạn.
                </p>
              )}
            </div>

            {/* EDUCATIONAL KNOWLEDGE BOX */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[32px] p-6 shadow-xl flex flex-col gap-4">
              <h3 className="text-xs sm:text-sm font-black text-[var(--text-color)] tracking-wider uppercase flex items-center gap-1.5">
                <Info className="w-4.5 h-4.5 text-primary" />
                Góc Nghiên Cứu Sức Khỏe
              </h3>

              <div className="flex flex-col gap-4">
                <div className="border-l-2 border-primary pl-3">
                  <h4 className="text-xs font-black text-[var(--text-color)] uppercase tracking-wide">HRV (Biến thiên nhịp tim) là gì?</h4>
                  <p className="text-[10px] sm:text-xs text-[var(--text-muted)] font-medium leading-relaxed mt-1">
                    HRV đo lường sự dao động thời gian giữa các nhịp đập liên tiếp của tim. Chỉ số HRV cao thể hiện cơ thể đang ở trạng thái thư giãn (Hệ đối giao cảm chiếm ưu thế) và sẵn sàng tập luyện cường độ cao. HRV thấp cảnh báo cơ thể đang stress hoặc quá tải.
                  </p>
                </div>

                <div className="border-l-2 border-purple-400 pl-3">
                  <h4 className="text-xs font-black text-[var(--text-color)] uppercase tracking-wide">Nhịp tim nghỉ ngơi (RHR)</h4>
                  <p className="text-[10px] sm:text-xs text-[var(--text-muted)] font-medium leading-relaxed mt-1">
                    Nhịp tim nghỉ ngơi của người trưởng thành khỏe mạnh thường dao động từ 60-80 bpm. Vận động viên thể hình có thể đạt 45-60 bpm. RHR tăng vọt 5-10 nhịp so với ngày thường là biểu hiện rõ nét của việc thiếu ngủ hoặc sắp ốm.
                  </p>
                </div>

                <div className="border-l-2 border-emerald-400 pl-3">
                  <h4 className="text-xs font-black text-[var(--text-color)] uppercase tracking-wide">Nguyên tắc Supercompensation</h4>
                  <p className="text-[10px] sm:text-xs text-[var(--text-muted)] font-medium leading-relaxed mt-1">
                    Cơ bắp chỉ phát triển trong lúc nghỉ ngơi và ngủ sâu, không phải lúc tập. Tập tạ chỉ đóng vai trò kích thích phá hủy sợi cơ. Nếu không có thời gian phục hồi, cơ thể sẽ rơi vào trạng thái dị hóa (cơ teo đi) và chấn thương.
                  </p>
                </div>
              </div>
            </div>

            {/* LATEST BODY METRICS */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[32px] p-6 shadow-xl flex flex-col gap-4">
              <h3 className="text-xs sm:text-sm font-black text-[var(--text-color)] tracking-wider uppercase flex items-center gap-1.5">
                <Scale className="w-4.5 h-4.5 text-primary" />
                Số Đo Cơ Thể Gần Nhất
              </h3>

              {latestMetrics ? (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[var(--bg-color)] border border-[var(--border-color)] p-2 rounded-xl text-center">
                      <span className="text-[9px] font-bold text-[var(--text-muted)] block">Cân nặng</span>
                      <span className="text-xs font-black text-primary">{latestMetrics.weightKg ? `${latestMetrics.weightKg}kg` : "--"}</span>
                    </div>
                    <div className="bg-[var(--bg-color)] border border-[var(--border-color)] p-2 rounded-xl text-center">
                      <span className="text-[9px] font-bold text-[var(--text-muted)] block">Tỉ lệ mỡ</span>
                      <span className="text-xs font-black text-primary">{latestMetrics.bodyFatPercent ? `${latestMetrics.bodyFatPercent}%` : "--"}</span>
                    </div>
                    <div className="bg-[var(--bg-color)] border border-[var(--border-color)] p-2 rounded-xl text-center">
                      <span className="text-[9px] font-bold text-[var(--text-muted)] block">Khối cơ</span>
                      <span className="text-xs font-black text-primary">{latestMetrics.muscleMassKg ? `${latestMetrics.muscleMassKg}kg` : "--"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-2 border-t border-[var(--border-color)]">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Vòng ngực:</span>
                      <span>{latestMetrics.chestCm ? `${latestMetrics.chestCm}cm` : "--"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Vòng eo:</span>
                      <span>{latestMetrics.waistCm ? `${latestMetrics.waistCm}cm` : "--"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Bắp tay:</span>
                      <span>{latestMetrics.armCm ? `${latestMetrics.armCm}cm` : "--"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Vòng đùi:</span>
                      <span>{latestMetrics.thighCm ? `${latestMetrics.thighCm}cm` : "--"}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-[var(--text-muted)] block text-right mt-1">
                    Cập nhật ngày: {new Date(latestMetrics.measuredAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)] font-medium text-center py-4">Chưa có chỉ số cơ thể được lưu.</p>
              )}
            </div>

            {/* LATEST PROGRESS PHOTOS */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[32px] p-6 shadow-xl flex flex-col gap-4">
              <h3 className="text-xs sm:text-sm font-black text-[var(--text-color)] tracking-wider uppercase flex items-center gap-1.5">
                <Camera className="w-4.5 h-4.5 text-primary" />
                Ảnh Tiến Trình Gần Nhất
              </h3>

              {latestPhotos.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] font-medium text-center py-4">Chưa có hình ảnh tiến trình nào.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {latestPhotos.map((photo) => (
                    <div key={photo.id} className="relative rounded-xl overflow-hidden aspect-square bg-neutral-900 border border-[var(--border-color)]">
                      <img src={photo.photoUrl} alt={photo.photoType} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] font-black uppercase px-1 rounded">
                        {photo.photoType === "front" ? "Trước" : photo.photoType === "side" ? "Bên" : "Sau"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
