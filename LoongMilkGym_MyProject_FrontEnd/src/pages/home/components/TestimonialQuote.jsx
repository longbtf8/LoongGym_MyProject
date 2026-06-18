import React from "react";

function TestimonialQuote() {
  return (
    <section className="w-full py-10">
      <div className="relative w-full aspect-[21/9] min-h-[220px] rounded-[2.5rem] overflow-hidden border border-[var(--border-color)] shadow-xl flex items-center justify-center text-center p-6 sm:p-10 group">
        
        {/* Background Image with Hover Zoom */}
        <img 
          src="https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781797859/LoongMilkGym_APP/homepage/testimonial_bg.jpg" 
          alt="Motivational Quote Gym" 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
        />
        
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[0.5px]" />

        {/* Content */}
        <div className="relative z-10 max-w-2xl flex flex-col items-center gap-4">
          <div className="text-3xl sm:text-5xl font-extrabold text-primary">99</div>
          
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black italic tracking-wide text-white leading-normal m-0 max-w-xl">
            "Bạn không cần phải hoàn hảo. <br />
            Bạn chỉ cần tốt hơn hôm qua."
          </h2>
          
          <div className="w-12 h-1 bg-primary rounded-full mt-2" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            LoongMilkGym Motivation
          </span>
        </div>

      </div>
    </section>
  );
}

export default TestimonialQuote;
