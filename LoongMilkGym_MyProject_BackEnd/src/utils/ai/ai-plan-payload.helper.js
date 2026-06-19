const isRestLikeDay = (day = {}) => {
  const title = `${day.title || ""} ${day.focusArea || ""}`.toLowerCase();
  const hasExercises = Array.isArray(day.exercises) && day.exercises.length > 0;

  return day.status === "rest"
    || !hasExercises
    || /nghỉ|nghi|rest|phục hồi|phuc hoi|mobility/.test(title);
};

const getDateKey = (dateInput) => {
  const date = new Date(dateInput);
  return date.toISOString().slice(0, 10);
};

const addDays = (dateInput, days) => {
  const date = new Date(dateInput);
  date.setDate(date.getDate() + days);
  return date;
};

const normalizeWeeklyPlanPayload = (payload = {}) => {
  const sourceDays = Array.isArray(payload.days)
    ? payload.days
    : Array.isArray(payload.weekTemplate)
      ? payload.weekTemplate
      : [];

  if (!sourceDays.length) return payload;

  const startDate = payload.startDate || getDateKey(new Date());
  let days = sourceDays.slice(0, 7);
  const firstTrainingIndex = days.findIndex((day) => !isRestLikeDay(day));

  if (firstTrainingIndex > 0) {
    days = [
      ...days.slice(firstTrainingIndex),
      ...days.slice(0, firstTrainingIndex),
    ];
  }

  days = days.map((day, index) => ({
    ...day,
    date: getDateKey(addDays(startDate, index)),
    status: isRestLikeDay(day) ? "rest" : "pending",
  }));

  return {
    ...payload,
    startDate,
    days,
  };
};

module.exports = {
  isRestLikeDay,
  normalizeWeeklyPlanPayload,
};
