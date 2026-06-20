import { useState } from "react";
import { ArrowLeft, Search } from "lucide-react";

const FEELINGS = [
  { text: "hạnh phúc", emoji: "😊" },
  { text: "được yêu", emoji: "🥰" },
  { text: "đáng yêu", emoji: "😍" },
  { text: "hào hứng", emoji: "🤩" },
  { text: "điên", emoji: "🤪" },
  { text: "sung sướng", emoji: "😆" },
  { text: "khờ khạo", emoji: "🤪" },
  { text: "tuyệt vời", emoji: "🥳" },
  { text: "thú vị", emoji: "😏" },
  { text: "tích cực", emoji: "🙂" },
  { text: "đầy hy vọng", emoji: "🌷" },
  { text: "mệt mỏi", emoji: "😴" },
  { text: "tự hào", emoji: "😎" },
  { text: "có phúc", emoji: "😇" },
  { text: "buồn", emoji: "😢" },
  { text: "biết ơn", emoji: "🙏" },
  { text: "đang yêu", emoji: "❤️" },
  { text: "cảm kích", emoji: "🥺" },
  { text: "tuyệt", emoji: "👍" },
  { text: "thư giãn", emoji: "😌" },
  { text: "thoải mái", emoji: "🧘" },
  { text: "hân hoan", emoji: "🎉" },
  { text: "có động lực", emoji: "💪" },
  { text: "cô đơn", emoji: "😔" }
];

export default function EmojiSelector({ onClose, onSelect }) {
  const [search, setSearch] = useState("");

  const filtered = FEELINGS.filter(f =>
    f.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="absolute inset-0 bg-[var(--bg-secondary)] rounded-3xl flex flex-col z-20 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-[var(--border-color)]">
        <button
          onClick={onClose}
          className="p-2 hover:bg-[var(--border-color)]/30 rounded-full transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--text-color)]" />
        </button>
        <h3 className="text-lg font-black text-[var(--text-color)]">
          Bạn đang cảm thấy thế nào?
        </h3>
      </div>

      {/* Search Input */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Tìm kiếm cảm xúc..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-[var(--border-color)]/20 border border-[var(--border-color)] text-[var(--text-color)] rounded-2xl focus:outline-none focus:border-primary transition-all font-medium"
          />
        </div>
      </div>

      {/* Grid List */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-2 max-h-[350px]">
        {filtered.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(item)}
            className="flex items-center gap-3 p-3.5 hover:bg-[var(--border-color)]/40 rounded-2xl transition-all cursor-pointer text-left border border-[var(--border-color)]/10"
          >
            <span className="text-2xl">{item.emoji}</span>
            <span className="text-sm font-semibold text-[var(--text-color)] capitalize">
              {item.text}
            </span>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-8 text-[var(--text-muted)] text-sm font-semibold">
            Không tìm thấy cảm xúc nào phù hợp.
          </div>
        )}
      </div>
    </div>
  );
}
