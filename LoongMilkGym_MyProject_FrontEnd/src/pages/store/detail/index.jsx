import React from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { useGetProductBySlugQuery } from "@/services/store/storeApi";
import ProductGallery from "./components/ProductGallery";
import ProductInfo from "./components/ProductInfo";

function StoreDetail() {
  const { slug } = useParams();

  // Tự động cuộn lên đầu trang khi thay đổi sản phẩm (slug)
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Fetch chi tiết sản phẩm qua API RTK Query
  const { data: productData, isLoading, error } = useGetProductBySlugQuery(slug);
  const product = productData?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 bg-[var(--border-color)] rounded w-1/4 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="aspect-[4/5] bg-[var(--border-color)] rounded-3xl" />
              <div className="flex flex-col gap-6">
                <div className="h-10 bg-[var(--border-color)] rounded w-3/4" />
                <div className="h-6 bg-[var(--border-color)] rounded w-1/4" />
                <div className="h-32 bg-[var(--border-color)] rounded w-full" />
                <div className="h-12 bg-[var(--border-color)] rounded-full w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center bg-[var(--bg-secondary)] border border-[var(--border-color)] p-8 rounded-3xl">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-color)] mb-3">
            Không tìm thấy sản phẩm
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã ngừng kinh doanh.
          </p>
          <Link
            to="/store"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-black font-extrabold text-sm rounded-full no-underline hover:bg-primary-hover active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại Cửa hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2.5 py-4 text-xs font-bold text-[var(--text-muted)] mb-6 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="no-underline hover:text-[var(--text-color)] transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/store" className="no-underline hover:text-[var(--text-color)] transition-colors">
            Cửa hàng
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[var(--text-color)] font-extrabold truncate max-w-[200px] sm:max-w-xs">
            {product.title}
          </span>
        </nav>

        {/* Bố cục Chi tiết (2 cột: Gallery + Info) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {/* Cột trái: Bộ sưu tập ảnh */}
          <div>
            <ProductGallery product={product} />
          </div>

          {/* Cột phải: Thông tin & Thao tác */}
          <div>
            <ProductInfo product={product} />
          </div>
        </div>

        {/* Tab thông tin chi tiết */}
        <div className="border-t border-[var(--border-color)] mt-16 pt-10">
          <h3 className="text-lg sm:text-xl font-black text-[var(--text-color)] mb-4">
            Mô tả sản phẩm chi tiết
          </h3>
          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-[var(--text-muted)]">
            <p className="mb-4">
              Sản phẩm {product.title} được nghiên cứu kỹ lưỡng nhằm mang đến giải pháp dinh dưỡng hoặc hỗ trợ tập luyện tối ưu cho các hội viên của LoongMilkGym. 
              Các nguyên liệu chế biến và chất liệu thiết kế đều tuân thủ các quy trình khắt khe, đạt kiểm định quốc tế, đảm bảo an toàn tuyệt đối cho sức khỏe của bạn.
            </p>
            <h4 className="font-extrabold text-[var(--text-color)] text-sm sm:text-base mt-6 mb-2">Hướng dẫn sử dụng & bảo quản</h4>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li>Đối với thực phẩm bổ sung: Pha nước ấm hoặc lạnh tuỳ ý, sử dụng tốt nhất trước/sau buổi tập hoặc buổi sáng.</li>
              <li>Đối với thiết bị tập luyện: Lau khô mồ hôi sau khi sử dụng để tăng tuổi thọ kim loại và lớp sơn cao su.</li>
              <li>Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng mặt trời chiếu trực tiếp.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoreDetail;
