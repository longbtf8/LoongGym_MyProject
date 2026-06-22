import React from "react";

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative premium glassmorphism background circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[var(--color-primary)]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md z-10">
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;
