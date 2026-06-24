import React from "react";
import CancelModal from "./CancelModal";
import RestoreModal from "./RestoreModal";
import AIModal from "./AIModal";
import SwapModal from "./SwapModal";
import SchedulerModal from "./SchedulerModal";

export default function PlanModals({
  // CancelModal props
  showCancelModal,
  setShowCancelModal,
  handleCancelPlanSuccess,

  // RestoreModal props
  showRestoreModal,
  setShowRestoreModal,
  handleRestoreOriginalExercises,
  isPending,

  // AIModal props
  showAIModal,
  setShowAIModal,
  showToast,

  // SwapModal props
  showSwapModal,
  setShowSwapModal,
  swapTargetIndex,
  dayDetails,
  handleSelectExercise,

  // SchedulerModal props
  selectedProgramId,
  setSelectedProgramId,
  handleSchedulerSuccess
}) {
  return (
    <>
      {/* MODAL HUỶ LỘ TRÌNH */}
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onSuccess={handleCancelPlanSuccess}
      />

      {/* MODAL KHÔI PHỤC LỊCH */}
      <RestoreModal
        isOpen={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        onConfirm={handleRestoreOriginalExercises}
        isPending={isPending}
      />

      {/* Modal AI Form Analysis */}
      <AIModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onDemoClick={() => {
          setShowAIModal(false);
          showToast("🚀 Tính năng đang được phát triển nâng cao!");
        }}
      />

      {/* Modal Swap */}
      <SwapModal
        isOpen={showSwapModal}
        onClose={() => setShowSwapModal(false)}
        swapTargetIndex={swapTargetIndex}
        dayDetails={dayDetails}
        onSelectExercise={handleSelectExercise}
        isPending={isPending}
      />

      {/* Scheduler Modal */}
      {selectedProgramId && (
        <SchedulerModal
          key={selectedProgramId}
          programId={selectedProgramId}
          onClose={() => setSelectedProgramId(null)}
          onSuccess={handleSchedulerSuccess}
        />
      )}
    </>
  );
}
