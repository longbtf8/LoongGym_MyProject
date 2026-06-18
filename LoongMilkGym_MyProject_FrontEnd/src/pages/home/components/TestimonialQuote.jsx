import React, { useState, useEffect, useRef } from "react";

const MOTIVATIONAL_QUOTES = [
  {
    quote: "Bạn không cần phải hoàn hảo. Bạn chỉ cần tốt hơn ngày hôm qua.",
    author: "Khởi đầu là quan trọng nhất",
    bgImage: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781800118/LoongMilkGym_APP/homepage/quote_bg_1.jpg",
  },
  {
    quote: "Sự kiên trì của ngày hôm nay là sức mạnh vượt trội của ngày mai.",
    author: "Động lực từ thói quen",
    bgImage: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781800121/LoongMilkGym_APP/homepage/quote_bg_2.jpg",
  },
  {
    quote: "Đừng đếm số ngày trôi qua, hãy làm cho mỗi ngày trôi qua đều có giá trị.",
    author: "Mục tiêu & Kỷ luật",
    bgImage: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781800125/LoongMilkGym_APP/homepage/quote_bg_3.jpg",
  },
  {
    quote: "Giới hạn duy nhất là những rào cản bạn tự đặt ra trong tâm trí mình.",
    author: "Đập tan giới hạn",
    bgImage: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781800128/LoongMilkGym_APP/homepage/quote_bg_4.jpg",
  },
  {
    quote: "Mồ hôi hôm nay đổ xuống chính là nụ cười hạnh phúc ngày mai.",
    author: "Thành quả xứng đáng",
    bgImage: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781800131/LoongMilkGym_APP/homepage/quote_bg_5.jpg",
  },
];

function TestimonialQuote() {
  const [currentIdx, setCurrentIdx] = useState(0);
  
  // Dragging / swiping state variables
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const carouselRef = useRef(null);

  // Auto slide effect
  useEffect(() => {
    // Only auto-slide if user is not actively dragging
    if (isDragging) return;

    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isDragging]);

  const handleDotClick = (idx) => {
    setCurrentIdx(idx);
  };

  const nextSlide = () => {
    setCurrentIdx((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
  };

  const prevSlide = () => {
    setCurrentIdx((prev) => (prev - 1 + MOTIVATIONAL_QUOTES.length) % MOTIVATIONAL_QUOTES.length);
  };

  // Touch and Mouse handlers for dragging/swiping
  const startDrag = (clientX) => {
    setIsDragging(true);
    startXRef.current = clientX;
    setDragOffset(0);
  };

  const moveDrag = (clientX) => {
    if (!isDragging) return;
    const currentOffset = clientX - startXRef.current;
    setDragOffset(currentOffset);
  };

  const endDrag = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // If swipe distance is larger than 60px, transition slide
    if (dragOffset < -60) {
      nextSlide();
    } else if (dragOffset > 60) {
      prevSlide();
    }

    setDragOffset(0);
  };

  return (
    <section className="w-full py-10 select-none">
      <div 
        ref={carouselRef}
        onMouseDown={(e) => e.button === 0 && startDrag(e.clientX)}
        onMouseMove={(e) => moveDrag(e.clientX)}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchStart={(e) => startDrag(e.touches[0].clientX)}
        onTouchMove={(e) => moveDrag(e.touches[0].clientX)}
        onTouchEnd={endDrag}
        className="relative w-full aspect-[21/9] min-h-[250px] rounded-[2.5rem] overflow-hidden border border-[var(--border-color)] shadow-xl group cursor-grab active:cursor-grabbing touch-pan-y"
      >
        
        {/* Horizontal Sliding Track */}
        <div 
          style={{
            display: "flex",
            width: `${MOTIVATIONAL_QUOTES.length * 100}%`,
            height: "100%",
            transform: `translateX(calc(-${(currentIdx * 100) / MOTIVATIONAL_QUOTES.length}% + ${dragOffset}px))`,
            transition: isDragging ? "none" : "transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)"
          }}
          className="h-full"
        >
          {MOTIVATIONAL_QUOTES.map((slide, idx) => (
            <div 
              key={idx}
              style={{ width: `${100 / MOTIVATIONAL_QUOTES.length}%` }}
              className="h-full relative shrink-0 flex items-center justify-center text-center p-6 sm:p-10"
            >
              {/* Background Image */}
              <img 
                src={slide.bgImage} 
                alt="Motivational Quote Gym" 
                draggable="false"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none group-hover:scale-[1.02] transition-transform duration-700 ease-out"
              />
              
              {/* Dark overlay for readability */}
              <div className="absolute inset-0 bg-black/65 backdrop-blur-[0.5px] pointer-events-none" />

              {/* Content */}
              <div className="relative z-10 max-w-2xl flex flex-col items-center gap-3 pointer-events-none select-none">
                <div className="text-3xl sm:text-5xl font-extrabold text-primary select-none">“</div>
                
                <h2 className="text-lg sm:text-2xl lg:text-3xl font-black italic tracking-wide text-white leading-normal m-0 max-w-xl">
                  {slide.quote}
                </h2>
                
                <div className="w-12 h-1 bg-primary rounded-full mt-2" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  LoongMilkGym Motivation • {slide.author}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-25 flex items-center gap-2 pointer-events-auto">
          {MOTIVATIONAL_QUOTES.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                handleDotClick(idx);
              }}
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
