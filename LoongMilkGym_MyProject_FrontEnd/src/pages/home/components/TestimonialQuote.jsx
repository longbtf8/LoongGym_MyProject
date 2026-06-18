import React, { useState, useEffect } from "react";

const MOTIVATIONAL_QUOTES = [
  {
    quote: "Bạn không cần phải hoàn hảo. Bạn chỉ cần tốt hơn ngày hôm qua.",
    author: "Khởi đầu là quan trọng nhất",
  },
  {
    quote: "Sự kiên trì của ngày hôm nay là sức mạnh vượt trội của ngày mai.",
    author: "Động lực từ thói quen",
  },
  {
    quote: "Đừng đếm số ngày trôi qua, hãy làm cho mỗi ngày trôi qua đều có giá trị.",
    author: "Mục tiêu & Kỷ luật",
  },
  {
    quote: "Giới hạn duy nhất là những rào cản bạn tự đặt ra trong tâm trí mình.",
    author: "Đập tan giới hạn",
  },
  {
    quote: "Mồ hôi hôm nay đổ xuống chính là nụ cười hạnh phúc ngày mai.",
    author: "Thành quả xứng đáng",
  },
];

function TestimonialQuote() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
        setIsFading(false);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleDotClick = (idx) => {
    if (idx === currentIdx) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentIdx(idx);
      setIsFading(false);
    }, 500);
  };

  return (
    <section className="w-full py-10">
      <div className="relative w-full aspect-[21/9] min-h-[240px] rounded-[2.5rem] overflow-hidden border border-[var(--border-color)] shadow-xl flex items-center justify-center text-center p-6 sm:p-10 group">
        
        {/* Background Image with Hover Zoom */}
        <img 
          src="https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781797859/LoongMilkGym_APP/homepage/testimonial_bg.jpg" 
          alt="Motivational Quote Gym" 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
        />
        
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[0.5px]" />

        {/* Content with Fade Transition */}
        <div 
          className={`relative z-10 max-w-2xl flex flex-col items-center gap-3 transition-opacity duration-500 ease-in-out ${
            isFading ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
        >
          <div className="text-3xl sm:text-5xl font-extrabold text-primary select-none">“</div>
          
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-black italic tracking-wide text-white leading-normal m-0 max-w-xl">
            {MOTIVATIONAL_QUOTES[currentIdx].quote}
          </h2>
          
          <div className="w-12 h-1 bg-primary rounded-full mt-2" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            LoongMilkGym Motivation • {MOTIVATIONAL_QUOTES[currentIdx].author}
          </span>
        </div>

        {/* Pagination Dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {MOTIVATIONAL_QUOTES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIdx 
                  ? "bg-primary w-5" 
                  : "bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

export default TestimonialQuote;
