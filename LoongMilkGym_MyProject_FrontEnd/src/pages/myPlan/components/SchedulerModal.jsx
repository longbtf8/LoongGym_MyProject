import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useGetWorkoutProgramQuery, useStartTrainingPlanMutation } from "@/services/roadmap/roadmapApi";

// SchedulerModal: Modal thiết lập phân bổ các ngày tập trong chu kỳ trước khi bắt đầu giáo án
export default function SchedulerModal({
  programId,
  onClose,
  onSuccess
}) {
  const { data: programRes, isLoading: isLoadingProgram } = useGetWorkoutProgramQuery(programId, {
    skip: !programId
  });
  const program = programRes?.data;

  const [schedulerDays, setSchedulerDays] = useState([]);
  const [startTrainingPlan, { isLoading: isStarting }] = useStartTrainingPlanMutation();

  // Initialize scheduler days order when program loaded
  useEffect(() => {
    if (program) {
      const initialDays = [
        { label: "Ngày 1", originalIndex: 0 },
        { label: "Ngày 2", originalIndex: 1 },
        { label: "Ngày 3", originalIndex: 2 },
        { label: "Ngày 4", originalIndex: 3 },
        { label: "Ngày 5", originalIndex: 4 },
        { label: "Ngày 6", originalIndex: 5 },
        { label: "Ngày 7", originalIndex: 6 }
      ];
      setSchedulerDays(initialDays);
    }
  }, [program]);

  if (!programId) return null;

  // handleConfirm: Xác nhận việc lập lịch phân bổ ngày tập và kích hoạt giáo án đã chọn
  const handleConfirm = async () => {
    if (!program) return;
    try {
      const dayMapping = schedulerDays.map(d => d.originalIndex);
      await startTrainingPlan({ 
        programId: program.id,
        dayMapping 
      }).unwrap();
      onSuccess("Đã bắt đầu lịch tập.");
    } catch {
      onSuccess("Không thể bắt đầu giáo án này.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center z-[999999] p-4">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] p-4 w-full max-w-[420px] max-h-[85vh] flex flex-col gap-2.5 shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
          <h3 className="font-extrabold text-base text-[var(--text-color)]">Cơ cấu chu kỳ tập</h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-[var(--bg-color)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-color)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {isLoadingProgram || !program ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin mb-2" />
            <span className="text-xs text-[var(--text-muted)]">Đang tải cấu trúc giáo án...</span>
          </div>
        ) : (
          <>
            <div className="py-2">
              <h4 className="font-bold text-sm text-[var(--text-color)]">Bạn muốn sắp xếp lại lịch tập không?</h4>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Lộ trình này sẽ lặp theo chu kỳ bên dưới. Bạn có thể hoán đổi thứ tự các buổi trước khi kích hoạt.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto pr-0.5 flex flex-col gap-1.5 no-scrollbar">
              {schedulerDays.map((day, index) => {
                const sessionTitle = program.days[day.originalIndex]?.title || "Ngày nghỉ";
                const isRest = !program.days[day.originalIndex]?.templates?.length;
                
                return (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-black text-primary">{day.label}</span>
                      <span className={`text-sm font-extrabold ${isRest ? "text-[var(--text-muted)]" : "text-[var(--text-color)]"}`}>
                        {sessionTitle}
                      </span>
                    </div>
                    
                    <div>
                      <select 
                        value={index} 
                        onChange={(e) => {
                          const targetIdx = Number(e.target.value);
                          if (targetIdx !== index) {
                            const updated = [...schedulerDays];
                            const temp = updated[index].originalIndex;
                            updated[index].originalIndex = updated[targetIdx].originalIndex;
                            updated[targetIdx].originalIndex = temp;
                            setSchedulerDays(updated);
                          }
                        }}
                        className="text-xs font-bold bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-2.5 py-1.5 outline-none text-[var(--text-color)] focus:border-primary cursor-pointer"
                      >
                        <option value={index}>Hoán đổi lịch...</option>
                        {schedulerDays.map((d, dIdx) => (
                          dIdx !== index && (
                            <option key={dIdx} value={dIdx}>
                              Đổi với {d.label}
                            </option>
                          )
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-3 border-t border-[var(--border-color)]">
              <button
                onClick={onClose}
                className="flex-1 h-10 rounded-xl border border-[var(--border-color)] text-[var(--text-color)] text-xs font-bold hover:bg-[var(--bg-color)]"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirm}
                disabled={isStarting}
                className="flex-1 h-10 rounded-xl bg-primary text-black text-xs font-black hover:bg-primary-hover disabled:opacity-60 cursor-pointer"
              >
                {isStarting ? "Đang xử lý..." : "Kích hoạt lịch tập"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
