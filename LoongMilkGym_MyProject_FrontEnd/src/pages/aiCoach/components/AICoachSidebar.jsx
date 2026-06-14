import React from "react";
import { Plus, X, Loader2, Trash2 } from "lucide-react";

function AICoachSidebar({
  conversations,
  activeConversationId,
  setActiveConversationId,
  loadingConversations,
  handleCreateNewConversation,
  handleDeleteConversation,
  sidebarOpen,
  setSidebarOpen,
  formatDateString,
}) {
  return (
    <aside className={`
      absolute inset-y-0 left-0 z-20 w-72 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col transition-transform duration-300 ease-in-out
      lg:relative lg:translate-x-0
      ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
    `}>
      {/* Tiêu đề Sidebar */}
      <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
        <span className="font-extrabold text-sm tracking-wider uppercase text-primary">Hội thoại AI Coach</span>
        <button 
          onClick={handleCreateNewConversation}
          className="w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center border border-primary/20 cursor-pointer border-0"
          title="Tạo phòng chat mới"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button 
          className="lg:hidden p-1.5 rounded-full hover:bg-[var(--border-color)]/30 border-0 bg-transparent cursor-pointer text-[var(--text-color)]"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Danh sách các phòng hội thoại */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5 no-scrollbar">
        {loadingConversations ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Nếu đang ở cuộc trò chuyện tạm mới, hiển thị mục ảo ở đầu hàng */}
            {activeConversationId === "temp-new" && (
              <div className="flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-200 group border bg-primary text-black border-primary font-bold shadow-md shadow-primary/10">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-xs truncate m-0 leading-tight">Cuộc hội thoại mới</p>
                  <p className="text-[10px] mt-1 m-0 leading-none text-neutral-700">Chưa bắt đầu</p>
                </div>
              </div>
            )}

            {conversations.length === 0 && activeConversationId !== "temp-new" ? (
              <div className="text-center py-12 text-xs font-semibold text-[var(--text-muted)]">
                Chưa có cuộc trò chuyện nào. Hãy tạo mới!
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    setActiveConversationId(conv.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-200 group border relative pr-10
                    ${activeConversationId === conv.id 
                      ? "bg-primary text-black border-primary font-bold shadow-md shadow-primary/10" 
                      : "bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-color)] hover:border-primary/45"
                    }
                  `}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-xs truncate m-0 leading-tight">
                      {conv.title || "Tư vấn AI"}
                    </p>
                    <p className={`text-[10px] mt-1 m-0 leading-none ${activeConversationId === conv.id ? "text-neutral-700" : "text-[var(--text-muted)]"}`}>
                      {formatDateString(conv.updatedAt)}
                    </p>
                  </div>
                  {/* Nút xóa cuộc trò chuyện */}
                  <button
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    className={`
                      absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition-all duration-200 border-0 bg-transparent cursor-pointer
                      ${activeConversationId === conv.id
                        ? "text-neutral-800 hover:bg-black/10 hover:text-red-700"
                        : "text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-red-500 opacity-0 group-hover:opacity-100"
                      }
                    `}
                    title="Xóa cuộc hội thoại"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </aside>
  );
}

export default AICoachSidebar;
