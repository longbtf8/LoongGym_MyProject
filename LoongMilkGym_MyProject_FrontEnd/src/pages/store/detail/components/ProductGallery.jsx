import { useMemo, useState } from "react";

function ProductGallery({ product }) {
  const images = useMemo(() => {
    const metadata = product?.metadata || {};

    // 1. Lấy danh sách ảnh từ ProductAsset (có assetType là 'image' hoặc đường dẫn là ảnh)
    const assetImages = (product?.assets || [])
      .filter(asset => asset.assetType === "image" || asset.fileUrl?.match(/\.(jpeg|jpg|gif|png|webp|svg)/i))
      .map(asset => asset.fileUrl);

    // 2. Lấy danh sách ảnh phụ từ metadata
    const metadataImages = metadata.images || [];

    // 3. Kết hợp toàn bộ ảnh, ưu tiên ảnh đại diện thumbnailUrl lên đầu
    const combinedImages = [
      product?.thumbnailUrl,
      ...assetImages,
      ...metadataImages
    ].filter(Boolean);

    // Loại bỏ các đường dẫn trùng lặp
    const uniqueImages = Array.from(new Set(combinedImages));

    // Nếu hoàn toàn không có ảnh, dùng ảnh mặc định tạm thời
    if (uniqueImages.length === 0) {
      uniqueImages.push("https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=600");
    }

    return uniqueImages;
  }, [product]);

  const [activeImage, setActiveImage] = useState("");
  const selectedImage = images.includes(activeImage) ? activeImage : images[0];

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-4">
      {/* Cột thumbnail dọc bên trái */}
      <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0 sm:w-20">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveImage(img)}
            className={`w-14 h-14 sm:w-20 sm:h-20 rounded-xl bg-transparent flex items-center justify-center overflow-hidden border-0 cursor-pointer p-0 transition-all shrink-0 ${
              selectedImage === img
                ? "ring-2 ring-primary shadow-md shadow-primary/10"
                : "ring-1 ring-transparent hover:ring-[var(--text-muted)]/60"
            }`}
          >
            <img
              src={img}
              alt={`${product?.title || "Sản phẩm"} - ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Khung ảnh chính bên phải */}
      <div className="flex-1 aspect-[4/5] rounded-3xl bg-neutral-100/60 dark:bg-neutral-900/30 border border-[var(--border-color)] flex items-center justify-center overflow-hidden relative">
        <img
          src={selectedImage}
          alt={product?.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-102"
        />
      </div>
    </div>
  );
}

export default ProductGallery;
