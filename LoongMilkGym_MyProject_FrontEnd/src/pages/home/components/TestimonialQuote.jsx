import React, { useState, useEffect, useRef } from "react";

const MOTIVATIONAL_QUOTES = [
  {
    quote: "Bạn không cần phải hoàn hảo. Bạn chỉ cần tốt hơn ngày hôm qua.",
    author: "Khởi đầu là quan trọng nhất",
    bgImage: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781799970/LoongMilkGym_APP/homepage/quote_bg_1.jpg",
  },
  {
    quote: "Sự kiên trì của ngày hôm nay là sức mạnh vượt trội của ngày mai.",
    author: "Động lực từ thói quen",
    bgImage: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781799974/LoongMilkGym_APP/homepage/quote_bg_2.jpg",
  },
  {
    quote: "Đừng đếm số ngày trôi qua, hãy làm cho mỗi ngày trôi qua đều có giá trị.",
    author: "Mục tiêu & Kỷ luật",
    bgImage: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781799976/LoongMilkGym_APP/homepage/quote_bg_3.jpg",
  },
  {
    quote: "Giới hạn duy nhất là những rào cản bạn tự đặt ra trong tâm trí mình.",
    author: "Đập tan giới hạn",
    bgImage: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781799980/LoongMilkGym_APP/homepage/quote_bg_4.jpg",
  },
  {
    quote: "Mồ hôi hôm nay đổ xuống chính là nụ cười hạnh phúc ngày mai.",
    author: "Thành quả xứng đáng",
    bgImage: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781799984/LoongMilkGym_APP/homepage/quote_bg_5.jpg",
  },
];

function TestimonialQuote() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFading, setIsFading] = useState(false);
  
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
      setIsFading(true);
      setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
        setIsFading(false);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, [isDragging]);

  const handleDotClick = (idx) => {
    if (idx === currentIdx || isFading) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentIdx(idx);
      setIsFading(false);
    }, 500);
  };

  const nextSlide = () => {
    if (isFading) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentIdx((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
      setIsFading(false);
    }, 400);
  };

  const prevSlide = () => {
    if (isFading) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentIdx((prev) => (prev - 1 + MOTIVATIONAL_QUOTES.length) % MOTIVATIONAL_QUOTES.length);
      setIsFading(false);
    }, 400);
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
    // Dampen drag effect a bit
    setDragOffset(currentOffset * 0.7);
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

    // Reset offset with spring animation back to 0
    setDragOffset(0);
  };

  // Mouse Handlers
  const handleMouseDown = (e) => {
    // Only drag on left click
    if (e.button !== 0) return;
    startDrag(e.clientX);
  };

  const handleMouseMove = (e) => {
    moveDrag(e.clientX);
  };

  const handleMouseUpOrLeave = () => {
    endDrag();
  };

  // Touch Handlers
  const handleTouchStart = (e) => {
    startDrag(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    moveDrag(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    endDrag();
  };

  return (
    <section className="w-full py-10 select-none">
      <div 
        ref={carouselRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full aspect-[21/9] min-h-[250px] rounded-[2.5rem] overflow-hidden border border-[var(--border-color)] shadow-xl flex items-center justify-center text-center p-6 sm:p-10 group cursor-grab active:cursor-grabbing touch-pan-y"
      >
        
        {/* Background Image with Hover Zoom & Fade */}
        <img 
          src={MOTIVATIONAL_QUOTES[currentIdx].bgImage} 
          alt="Motivational Quote Gym" 
          draggable="false"
          className={`absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-700 ease-out pointer-events-none select-none ${
            isFading ? "opacity-40 scale-98 blur-xs" : "opacity-100 scale-100"
          }`}
        />
        
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/65 backdrop-blur-[0.5px] pointer-events-none" />

        {/* Content with Drag Offset and Fade Transition */}
        <div 
          style={{ 
            transform: `translateX(${dragOffset}px)`,
            transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)"
          }}
          className={`relative z-10 max-w-2xl flex flex-col items-center gap-3 pointer-events-none select-none transition-opacity duration-400 ease-in-out ${
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
