import { useState, useEffect } from "react";
import {
  useGetTodayOverviewQuery,
  useLogRecoveryMutation,
  useLogInjuryMutation,
  useUpdateInjuryMutation,
  useLogBodyMetricMutation,
  useUploadProgressPhotoMutation,
  useDeleteProgressPhotoMutation
} from "@/services/recovery/recoveryApi";

export function useRecoveryData() {
  const [activeTab, setActiveTab] = useState("recovery"); // recovery, metrics, injuries
  const [alert, setAlert] = useState(null);
  const [activeInfo, setActiveInfo] = useState(null); // sleep, soreness, energy, stress, hrv, rhr

  const todayDateStr = new Date().toISOString().split("T")[0];
  const { data: overviewData, isLoading, refetch } = useGetTodayOverviewQuery(todayDateStr);
  
  const [logRecovery, { isLoading: isLoggingRecovery }] = useLogRecoveryMutation();
  const [logInjury, { isLoading: isLoggingInjury }] = useLogInjuryMutation();
  const [updateInjury, { isLoading: isUpdatingInjury }] = useUpdateInjuryMutation();
  const [logBodyMetric, { isLoading: isLoggingMetric }] = useLogBodyMetricMutation();
  const [uploadProgressPhoto, { isLoading: isUploadingPhoto }] = useUploadProgressPhotoMutation();
  const [deleteProgressPhoto, { isLoading: isDeletingPhoto }] = useDeleteProgressPhotoMutation();

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

    const sorenessLevelInt = Math.max(1, Math.min(10, Math.round(sorenessLevel)));
    const sorenessMapping = { 1: 100, 2: 95, 3: 90, 4: 80, 5: 70, 6: 55, 7: 45, 8: 30, 9: 20, 10: 5 };
    const sorenessScore = sorenessMapping[sorenessLevelInt] || 70;

    const energyLevelInt = Math.max(1, Math.min(10, Math.round(energyLevel)));
    const energyMapping = { 10: 100, 9: 95, 8: 85, 7: 70, 6: 60, 5: 45, 4: 35, 3: 20, 2: 10, 1: 5 };
    const energyScore = energyMapping[energyLevelInt] || 60;

    const stressLevelInt = Math.max(1, Math.min(10, Math.round(stressLevel)));
    const stressMapping = { 1: 100, 2: 95, 3: 85, 4: 70, 5: 60, 6: 45, 7: 35, 8: 20, 9: 10, 10: 5 };
    const stressScore = stressMapping[stressLevelInt] || 60;

    const totalScore = sleepScore * 0.35 + sorenessScore * 0.25 + energyScore * 0.20 + stressScore * 0.20;
    return Math.round(totalScore);
  };

  const liveScore = calculateLiveScore();

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

    if (!localPhotoFile && !photoUrl.trim()) {
      triggerAlert("error", "Vui lòng chọn tệp ảnh hoặc nhập đường dẫn URL ảnh");
      return;
    }

    try {
      if (localPhotoFile) {
        const formData = new FormData();
        formData.append("photo", localPhotoFile);
        formData.append("photoType", photoType);
        formData.append("takenAt", todayDateStr);
        formData.append("visibility", "private");
        await uploadProgressPhoto(formData).unwrap();
      } else {
        await uploadProgressPhoto({
          photoUrl: photoUrl.trim(),
          photoType,
          takenAt: todayDateStr,
          visibility: "private"
        }).unwrap();
      }
      triggerAlert("success", "Đăng tải ảnh tiến trình thành công!");
      setPhotoUrl("");
      setLocalPhotoFile(null);
      refetch();
    } catch (err) {
      triggerAlert("error", err?.data?.message || "Không thể đăng tải ảnh");
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      await deleteProgressPhoto(photoId).unwrap();
      triggerAlert("success", "Đã xóa ảnh tiến trình thành công!");
      refetch();
    } catch (err) {
      triggerAlert("error", err?.data?.message || "Không thể xóa ảnh");
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

  return {
    activeTab,
    setActiveTab,
    alert,
    setAlert,
    triggerAlert,
    activeInfo,
    toggleInfo,
    overviewData,
    isLoading,
    refetch,
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
    isDeletingPhoto,
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
    isUpdatingInjury,
    todayDateStr
  };
}
