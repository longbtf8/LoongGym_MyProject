import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function DefaultLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] font-sans transition-colors duration-300">
      {/* Header Component cao cấp */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-8">
        {children}
      </main>

      {/* Footer Component cao cấp */}
      <Footer />
    </div>
  );
}

export default DefaultLayout;
