import { Loader2, Bot, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import ActionCard from "./ActionCard";

const enhanceMarkdownContent = (content = "") => {
  const importantLinePattern = /^(Ngày\s+\d+|Tuần\s+\d+|Mục tiêu|Tần suất|Lịch tập|Lịch Tập|Mẫu tuần|Lưu ý|Thời gian nghỉ|Chế độ dinh dưỡng)/iu;

  return content
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("**")) return line;
      if (!importantLinePattern.test(trimmed)) return line;

      return line.replace(trimmed, `**${trimmed}**`);
    })
    .join("  \n");
};

const markdownComponents = {
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-sky-400 dark:text-sky-300 font-black underline underline-offset-4 decoration-sky-400/50 hover:text-sky-300 hover:decoration-sky-300 transition-colors"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => {
    const text = Array.isArray(children) ? children.join("") : String(children || "");
    const isImportantLine = /^(Ngày\s+\d+|Tuần\s+\d+|Mục tiêu|Tần suất|Lịch tập|Lịch Tập|Mẫu tuần|Lưu ý|Thời gian nghỉ|Chế độ dinh dưỡng)/iu.test(text.trim());

    return (
      <strong className={isImportantLine ? "text-amber-300 font-black" : "text-[var(--text-color)] font-black"}>
        {children}
      </strong>
    );
  },
  h1: ({ children }) => (
    <h1 className="text-base sm:text-lg font-black text-amber-300 mt-2 mb-2">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-sm sm:text-base font-black text-amber-300 mt-2 mb-2">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-black text-amber-300 mt-2 mb-1.5">{children}</h3>
  ),
  li: ({ children }) => (
    <li className="my-1 pl-1">{children}</li>
  ),
};

function ChatMessages({
  messages,
  loadingMessages,
  isGenerating,
  userName,
  userInitial,
  userAvatar,
  QUICK_ACTIONS,
  handleSendMessage,
  actionProcessingId,
  handleExecuteAction,
  handleRejectAction,
  chatContainerRef,
}) {
  if (loadingMessages) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-xs font-bold text-[var(--text-muted)]">Đang tải lịch sử hội thoại...</span>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col items-center justify-center py-6 px-4">
        <div className="max-w-lg w-full text-center flex flex-col items-center gap-6 animate-slide-down">
          <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/35 text-primary flex items-center justify-center animate-bounce shadow-lg shadow-primary/10">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[var(--text-color)] mb-2">Chào mừng {userName} đến với AI Coach!</h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed m-0 font-medium">
              Tôi là trợ lý huấn luyện viên thông minh của bạn. Tôi có thể giúp bạn sắp xếp lại lịch tập, thay đổi bài tập do chấn thương/mệt mỏi, phân tích chỉ số phục hồi, dinh dưỡng và đưa ra các đề xuất điều chỉnh lịch tập luyện tự động!
            </p>
          </div>

          <div className="w-full flex flex-col gap-2.5 mt-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] text-left">Đề xuất câu hỏi nhanh:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              {QUICK_ACTIONS.map((act) => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.label}
                    onClick={() => handleSendMessage(act.prompt)}
                    disabled={isGenerating}
                    className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-primary/45 rounded-2xl text-xs font-bold text-[var(--text-color)] hover:text-[var(--text-primary)] transition-all flex items-center gap-3 cursor-pointer text-left shadow-sm group border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${act.color} group-hover:scale-105 transition-transform`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="flex-1 truncate">{act.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const lastMessage = messages[messages.length - 1];
  const showLoaderBubble = isGenerating && (!lastMessage || lastMessage.role !== "assistant" || !lastMessage.content?.trim());

  return (
    <div ref={chatContainerRef} className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 space-y-6 bg-gradient-to-b from-transparent to-[var(--bg-secondary)]/5">
      {messages.map((msg) => {
        const isAi = msg.role === "assistant";
        return (
          <div 
            key={msg.id} 
            className={`flex gap-3 max-w-[92%] sm:max-w-[75%] ${isAi ? "mr-auto" : "ml-auto flex-row-reverse"}`}
          >
            <div className={`w-8.5 h-8.5 rounded-full shrink-0 flex items-center justify-center text-xs font-bold border overflow-hidden ${
              isAi 
                ? "bg-neutral-800 text-primary border-neutral-700 dark:bg-neutral-900" 
                : "bg-primary text-black border-primary"
            }`}>
              {isAi ? (
                <Bot className="w-4.5 h-4.5" />
              ) : userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
              ) : (
                userInitial
              )}
            </div>

            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
              <span className={`text-[9px] font-extrabold text-[var(--text-muted)] ${isAi ? "text-left" : "text-right"}`}>
                {isAi ? "AI Coach" : userName}
              </span>

              <div className={`
                p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-sm border
                ${isAi 
                  ? "bg-[var(--bg-secondary)] text-[var(--text-color)] border-[var(--border-color)] rounded-tl-none" 
                  : "bg-primary/10 text-[var(--text-color)] border-primary/20 rounded-tr-none ml-auto"
                }
              `}>
                <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm font-medium font-sans relative">
                  <ReactMarkdown components={markdownComponents}>
                    {enhanceMarkdownContent(msg.content)}
                  </ReactMarkdown>
                  {isAi && isGenerating && msg.id === lastMessage?.id && (
                    <span className="inline-flex items-center ml-1">
                      <span className="w-1.5 h-3.5 bg-primary animate-pulse inline-block" style={{ verticalAlign: "middle" }} />
                    </span>
                  )}
                </div>

                {msg.metadata?.recommendation && (
                  <ActionCard
                    recommendation={msg.metadata.recommendation}
                    actionProcessingId={actionProcessingId}
                    handleExecuteAction={handleExecuteAction}
                    handleRejectAction={handleRejectAction}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}

      {showLoaderBubble && (
        <div className="flex gap-3 max-w-[75%] mr-auto">
          <div className="w-8.5 h-8.5 rounded-full bg-neutral-800 border border-neutral-700 text-primary flex items-center justify-center">
            <Loader2 className="w-4.5 h-4.5 animate-spin" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-extrabold text-[var(--text-muted)]">AI Coach đang suy nghĩ...</span>
            <div className="px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl rounded-tl-none text-xs text-[var(--text-muted)] italic font-semibold flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
              <span>Đang phân tích dữ liệu và lên phương án...</span>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default ChatMessages;
