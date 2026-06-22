import { Compass, Flame } from "lucide-react";

export const DEFAULT_AVATAR_URL =
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&auto=format&fit=crop&q=60";

export const NAV_ITEMS = [
  { id: "feed", label: "Bảng tin (Feed)", icon: Compass },
  { id: "following", label: "Đang theo dõi", icon: Compass },
  { id: "trending", label: "Thịnh hành", icon: Flame },
  { id: "saved", label: "Đã lưu", icon: Compass },
];

export const TRAINERS = [
  {
    name: "DANGBEOO",
    url: "https://www.youtube.com/@DANGBEOO",
    role: "Thể hình & Sức mạnh",
    avatar:
      "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781971365/LoongMilkGym_APP/trainers/DANGBEOO.jpg",
  },
  {
    name: "Mai Quang Huy",
    url: "https://www.youtube.com/@maiquanghuyy",
    role: "Kinh nghiệm & Kỹ thuật",
    avatar:
      "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781971366/LoongMilkGym_APP/trainers/maiquanghuyy.jpg",
  },
  {
    name: "Duc Anh Vlog",
    url: "https://www.youtube.com/@ddalilge",
    role: "Calisthenics & Võ thuật",
    avatar:
      "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781971368/LoongMilkGym_APP/trainers/ddalilge.jpg",
  },
  {
    name: "Lee Huy",
    url: "https://www.youtube.com/@leehbeanie",
    role: "Lối sống & Tập luyện",
    avatar:
      "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781971370/LoongMilkGym_APP/trainers/leehbeanie.jpg",
  },
];

export const REACTION_EMOJIS = [
  { type: "like", emoji: "👍", label: "Thích", color: "text-primary font-black" },
  { type: "love", emoji: "❤️", label: "Yêu thích", color: "text-red-500 font-bold" },
  { type: "care", emoji: "🥰", label: "Thương thương", color: "text-yellow-500 font-bold" },
  { type: "haha", emoji: "😆", label: "Haha", color: "text-yellow-500 font-bold" },
  { type: "wow", emoji: "😮", label: "Wow", color: "text-yellow-500 font-bold" },
  { type: "sad", emoji: "😢", label: "Buồn", color: "text-yellow-500 font-bold" },
  { type: "angry", emoji: "😡", label: "Phẫn nộ", color: "text-orange-600 font-bold" },
];

