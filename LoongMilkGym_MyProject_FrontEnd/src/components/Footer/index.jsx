import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import paths from "@/config/path";

function Footer() {
  return (
    <footer className="w-full bg-[var(--bg-secondary)] border-t border-[var(--border-color)] pt-12 pb-28 lg:pb-12 mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid 4 cột chính */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-[var(--border-color)]">
          
          {/* Cột 1: Logo & Mô tả đặc sắc */}
          <div className="flex flex-col gap-4">
            <Logo className="text-3xl" />
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-[280px]">
              Hệ sinh thái công nghệ thể hình hàng đầu Việt Nam, đồng hành cùng bạn nâng tầm thể chất và tối ưu hoá hiệu suất tập luyện chuyên nghiệp.
            </p>
          </div>

          {/* Cột 2: Khám phá */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-extrabold text-[var(--text-color)] tracking-wider uppercase">
              Khám phá
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
              <li>
                <Link
                  to={paths.home}
                  className="text-sm text-[var(--text-muted)] hover:text-primary no-underline transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  Về LoongMilKGym
                </Link>
              </li>
              <li>
                <Link
                  to={paths.exercises}
                  className="text-sm text-[var(--text-muted)] hover:text-primary no-underline transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  Thư viện bài tập
                </Link>
              </li>
              <li>
                <Link
                  to={paths.myPlan}
                  className="text-sm text-[var(--text-muted)] hover:text-primary no-underline transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  Lộ trình AI
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-extrabold text-[var(--text-color)] tracking-wider uppercase">
              Hỗ trợ
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
              <li>
                <Link
                  to={paths.home}
                  className="text-sm text-[var(--text-muted)] hover:text-primary no-underline transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  Hỗ trợ
                </Link>
              </li>
              <li>
                <Link
                  to={paths.home}
                  className="text-sm text-[var(--text-muted)] hover:text-primary no-underline transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link
                  to={paths.home}
                  className="text-sm text-[var(--text-muted)] hover:text-primary no-underline transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Kết nối mạng xã hội (Chữ nằm ngang kèm icon tinh tế) */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-extrabold text-[var(--text-color)] tracking-wider uppercase">
              Kết nối
            </h4>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-1">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-primary no-underline transition-all duration-200 hover:translate-y-[-1px]"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
                <span className="font-medium">Facebook</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-primary no-underline transition-all duration-200 hover:translate-y-[-1px]"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                </svg>
                <span className="font-medium">Twitter</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-primary no-underline transition-all duration-200 hover:translate-y-[-1px]"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
                <span className="font-medium">Instagram</span>
              </a>
            </div>
          </div>

        </div>

        {/* Copyright phía dưới */}
        <div className="pt-8 text-center text-sm text-[var(--text-muted)]">
          <p className="m-0">
            © 2026 <span className="font-extrabold text-[var(--text-color)]">LoongMilKGym Performance</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
