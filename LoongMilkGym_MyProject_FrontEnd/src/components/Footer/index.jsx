import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram } from "lucide-react";
import Logo from "@/components/Logo";

function Footer() {
  return (
    <footer className="w-full bg-[var(--bg-secondary)] border-t border-[var(--border-color)] py-12 mt-auto transition-colors duration-300">
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
                  to="#"
                  className="text-sm text-[var(--text-muted)] hover:text-primary no-underline transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  Về LoongMilKGym
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-sm text-[var(--text-muted)] hover:text-primary no-underline transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  Thư viện bài tập
                </Link>
              </li>
              <li>
                <Link
                  to="#"
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
                  to="#"
                  className="text-sm text-[var(--text-muted)] hover:text-primary no-underline transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  Hỗ trợ
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-sm text-[var(--text-muted)] hover:text-primary no-underline transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link
                  to="#"
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
                <Facebook className="w-4 h-4 shrink-0" />
                <span className="font-medium">Facebook</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-primary no-underline transition-all duration-200 hover:translate-y-[-1px]"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4 shrink-0" />
                <span className="font-medium">Twitter</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-primary no-underline transition-all duration-200 hover:translate-y-[-1px]"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 shrink-0" />
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
