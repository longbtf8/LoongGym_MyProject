import { useState } from "react";
import { Send } from "lucide-react";

function ChatFooter({
  isGenerating,
  handleSendMessage,
  messagesCount,
  QUICK_ACTIONS,
}) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isGenerating) return;
    handleSendMessage(inputValue);
    setInputValue("");
  };

  return (
    <div className="flex flex-col">
      {/* Nút hành động nhanh chỉ hiện khi đã bắt đầu chat */}
      {messagesCount > 0 && (
        <div className="px-4 py-2 border-t border-[var(--border-color)] bg-[var(--bg-color)] overflow-x-auto no-scrollbar">
          <div className="flex gap-2 w-max pr-4">
            {QUICK_ACTIONS.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.label}
                  onClick={() => handleSendMessage(act.prompt)}
                  disabled={isGenerating}
                  className="px-3.5 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-primary/45 rounded-full text-[11px] font-bold text-[var(--text-color)] hover:text-[var(--text-primary)] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-50 border-0"
                >
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  {act.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Hộp nhập liệu chính */}
      <footer className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Hỏi LoongMilkAI điều gì đó..."
            disabled={isGenerating}
            className="flex-1 px-4 py-3 bg-[var(--bg-color)] border border-[var(--border-color)] focus:border-primary/65 rounded-2xl text-xs sm:text-sm font-semibold outline-none transition-all disabled:opacity-60 text-[var(--text-color)]"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isGenerating}
            className="w-11 h-11 rounded-2xl bg-primary text-black hover:bg-primary-hover flex items-center justify-center border-0 cursor-pointer transition-colors disabled:opacity-50 shadow-md shadow-primary/10 shrink-0"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>
      </footer>
    </div>
  );
}

export default ChatFooter;
