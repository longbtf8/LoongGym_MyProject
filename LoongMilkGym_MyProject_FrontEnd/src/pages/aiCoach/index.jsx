import { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  Menu,
  Calendar,
  Flame,
  Activity,
  Heart,
  Dumbbell,
  Target,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAICoach } from "./hooks/useAICoach";
import AICoachSidebar from "./components/AICoachSidebar";
import ChatMessages from "./components/ChatMessages";
import ChatFooter from "./components/ChatFooter";

function AICoach() {
  const { userInfo, userName, userInitial } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const chatContainerRef = useRef(null);

  // Sử dụng Custom Hook quản lý toàn bộ trạng thái và logic AI Coach
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    isGenerating,
    loadingConversations,
    loadingMessages,
    actionProcessingId,
    toast,
    handleCreateNewConversation,
    handleDeleteConversation,
    handleSendMessage,
    handleExecuteAction,
    handleRejectAction,
  } = useAICoach(userInfo);

  // Danh sách các gợi ý câu hỏi nhanh
  const QUICK_ACTIONS = [
    { label: "Tôi muốn cải thiện nhóm cơ", prompt: "Tôi muốn cải thiện nhóm cơ. Hãy hỏi tôi nhóm cơ muốn cải thiện và các thông tin còn thiếu, sau đó tạo mẫu lịch 1 tuần để tôi bấm Đồng ý áp dụng.", icon: Target, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Sắp xếp lại lịch", prompt: "Hãy giúp tôi sắp xếp lại lịch tập của tôi", icon: Calendar, color: "text-blue-500 bg-blue-500/10" },
    { label: "Tôi bị đau vai", prompt: "Tôi bị đau vai khi tập, hãy tư vấn cách xử lý và bài tập thay thế cho tôi", icon: Activity, color: "text-red-500 bg-red-500/10" },
    { label: "Tôi muốn tăng cơ", prompt: "Tôi muốn tăng cơ hiệu quả, bạn có thể tư vấn chế độ dinh dưỡng và bài tập phù hợp?", icon: Dumbbell, color: "text-yellow-500 bg-yellow-500/10" },
    { label: "Tôi muốn giảm mỡ", prompt: "Tôi muốn giảm mỡ nhanh chóng, hãy tư vấn cho tôi mục tiêu calories và kế hoạch luyện tập", icon: Flame, color: "text-orange-500 bg-orange-500/10" },
    { label: "Hôm nay tôi mệt", prompt: "Hôm nay tôi mệt mỏi và kiệt sức, tôi có nên tập không hay nên nghỉ ngơi?", icon: Heart, color: "text-purple-500 bg-purple-500/10" },
  ];

  // Tự động cuộn xuống cuối khung chat khi có tin nhắn mới hoặc đổi hội thoại
  useEffect(() => {
    if (chatContainerRef.current) {
      const timer = setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: "smooth"
          });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [messages, isGenerating, activeConversationId]);

  // Định dạng ngày hiển thị ở Sidebar
  const formatDateString = (dateInput) => {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRequestDeleteConversation = (conversation) => {
    setConversationToDelete(conversation);
  };

  const handleCancelDeleteConversation = () => {
    setConversationToDelete(null);
  };

  const handleConfirmDeleteConversation = async () => {
    if (!conversationToDelete) return;

    await handleDeleteConversation(conversationToDelete.id);
    setConversationToDelete(null);
  };

  return (
    <div className="flex bg-[var(--bg-color)] text-[var(--text-color)] h-[calc(100vh-9.5rem)] sm:h-[calc(100vh-8.5rem)] rounded-none sm:rounded-3xl border-x-0 sm:border border-[var(--border-color)] overflow-hidden relative shadow-sm">
      {toast.show && (
        <div className={`fixed left-1/2 top-[72px] -translate-x-1/2 z-[999999] flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-2xl border px-4 py-2.5 shadow-lg backdrop-blur-sm animate-slide-down ${
          toast.type === "error"
            ? "border-rose-500/30 bg-rose-500/10 text-rose-500 dark:text-rose-400 dark:bg-rose-950/20"
            : "border-primary/30 bg-[var(--bg-secondary)] text-[var(--text-color)]"
        }`}>
          {toast.type === "error" ? (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 shrink-0 text-primary" />
          )}
          <span className="text-xs font-bold leading-none">{toast.message}</span>
        </div>
      )}
      
      {/* ═══ SIDEBAR (QUẢN LÝ PHÒNG CHAT) ═══ */}
      <AICoachSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        setActiveConversationId={setActiveConversationId}
        loadingConversations={loadingConversations}
        handleCreateNewConversation={handleCreateNewConversation}
        handleRequestDeleteConversation={handleRequestDeleteConversation}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        formatDateString={formatDateString}
      />

      {/* Lớp phủ mờ nền khi bật Sidebar trên mobile */}
      {sidebarOpen && (
        <div 
          className="lg:hidden absolute inset-0 z-10 bg-black/45 backdrop-blur-sm animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ═══ KHU VỰC KHUNG CHAT CHÍNH ═══ */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 bg-[var(--bg-color)] h-full relative">
        
        {/* Header khung chat */}
        <header className="h-16 px-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-secondary)]/35 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-color)] cursor-pointer border-0"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-black text-[var(--text-color)] tracking-wider uppercase m-0 leading-tight">LoongMilkAI Coach</h2>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-bold text-primary">Sẵn sàng tư vấn</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Danh sách tin nhắn chat */}
        <ChatMessages
          messages={messages}
          loadingMessages={loadingMessages}
          isGenerating={isGenerating}
          userName={userName}
          userInitial={userInitial}
          userAvatar={userInfo?.profile?.avatarUrl}
          QUICK_ACTIONS={QUICK_ACTIONS}
          handleSendMessage={handleSendMessage}
          actionProcessingId={actionProcessingId}
          handleExecuteAction={handleExecuteAction}
          handleRejectAction={handleRejectAction}
          chatContainerRef={chatContainerRef}
        />

        {/* Bong bóng nhập liệu và gửi tin nhắn */}
        <ChatFooter
          isGenerating={isGenerating}
          handleSendMessage={handleSendMessage}
          messagesCount={messages.length}
          QUICK_ACTIONS={QUICK_ACTIONS}
        />

      </main>

      {conversationToDelete && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/55 backdrop-blur-sm px-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 shadow-2xl">
            <h3 className="m-0 text-base font-black text-[var(--text-color)]">
              Xoá cuộc trò chuyện?
            </h3>
            <p className="mt-2 mb-5 text-sm font-medium leading-relaxed text-[var(--text-muted)]">
              Cuộc trò chuyện "{conversationToDelete.title || "Tư vấn AI"}" sẽ bị xoá khỏi danh sách của bạn.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelDeleteConversation}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 py-2 text-xs font-black text-[var(--text-color)] transition-all hover:border-primary/50 active:scale-95 cursor-pointer"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteConversation}
                className="rounded-xl border border-rose-500 bg-rose-500 px-4 py-2 text-xs font-black text-white transition-all hover:bg-rose-600 active:scale-95 cursor-pointer"
              >
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AICoach;
