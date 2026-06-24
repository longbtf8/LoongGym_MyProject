import React, { useState, useEffect, useRef } from "react";
import { X, Upload, Trash2, HelpCircle, RefreshCw, AlertCircle, Plus, Info } from "lucide-react";
import { useGetProductCategoriesQuery } from "@/services/admin/adminApi";

export default function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  product = null, // If editing, this is the product object
  existingBrands = [],
  isLoading = false,
}) {
  if (!isOpen) return null;

  const isEdit = !!product;
  const { data: categoriesResponse } = useGetProductCategoriesQuery();
  const categoriesList = categoriesResponse?.data || [];

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [status, setStatus] = useState("draft");

  // Custom dropdown states
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // File states
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  // Sub-images file states
  const [subImageFiles, setSubImageFiles] = useState([]);
  const [subImagePreviews, setSubImagePreviews] = useState([]);
  const [existingAssets, setExistingAssets] = useState([]);
  const [deletedAssetIds, setDeletedAssetIds] = useState([]);

  // Validation states
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const subImagesInputRef = useRef(null);

  // Load product data when editing
  useEffect(() => {
    if (product && isOpen) {
      setTitle(product.title || "");
      setSlug(product.slug || "");
      setCategoryId(product.categoryId || "");
      setBrand(product.metadata?.brand || "");
      setDescription(product.description || "");
      setPrice(product.price ? String(product.price) : "");
      setOriginalPrice(product.metadata?.originalPrice ? String(product.metadata.originalPrice) : "");
      setStatus(product.status || "draft");
      setThumbnailPreview(product.thumbnailUrl || "");
      setThumbnailFile(null);

      // Load sub-images assets
      setExistingAssets(product.assets || []);
      setDeletedAssetIds([]);
      setSubImageFiles([]);
      setSubImagePreviews([]);
    } else {
      // Clear form for new product
      setTitle("");
      setSlug("");
      setCategoryId("");
      setBrand("");
      setDescription("");
      setPrice("");
      setOriginalPrice("");
      setStatus("draft");
      setThumbnailPreview("");
      setThumbnailFile(null);

      setExistingAssets([]);
      setDeletedAssetIds([]);
      setSubImageFiles([]);
      setSubImagePreviews([]);
    }
    setErrors({});
  }, [product, isOpen]);

  // Auto-slugify from title (only when creating or if slug is empty/untouched)
  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/-+/g, "-") // Replace multiple - with single -
      .trim();
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    if (value.length <= 120) {
      setTitle(value);
      if (!isEdit) {
        setSlug(slugify(value));
      }
    }
  };

  const handleSlugChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/\s+/g, "-");
    setSlug(value);
  };

  // Generate slug manually
  const regenerateSlug = () => {
    setSlug(slugify(title));
  };

  // Thumbnail file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, thumbnail: "Ảnh không được vượt quá 5MB." }));
      return;
    }

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, thumbnail: "Chỉ cho phép định dạng JPG, PNG hoặc WEBP." }));
      return;
    }

    setThumbnailFile(file);
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.thumbnail;
      return copy;
    });

    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle multiple sub-images selection
  const handleSubImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const validFiles = [];
    const maxSubImages = 5;

    // Check limit
    if (existingAssets.length + subImageFiles.length + files.length > maxSubImages) {
      setErrors((prev) => ({ ...prev, subImages: `Tối đa ${maxSubImages} ảnh con.` }));
      return;
    }

    let hasError = false;
    files.forEach((file) => {
      // Size check (< 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, subImages: "Một trong số các ảnh vượt quá 5MB." }));
        hasError = true;
        return;
      }
      // Type check
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, subImages: "Chỉ chấp nhận JPG, PNG hoặc WEBP." }));
        hasError = true;
        return;
      }

      validFiles.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setSubImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    if (!hasError) {
      setSubImageFiles((prev) => [...prev, ...validFiles]);
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.subImages;
        return copy;
      });
    }
  };

  const removeSubImage = (index, isExisting, assetId) => {
    if (isExisting) {
      setDeletedAssetIds((prev) => [...prev, assetId]);
      setExistingAssets((prev) => prev.filter((asset) => asset.id !== assetId));
    } else {
      setSubImageFiles((prev) => prev.filter((_, i) => i !== index));
      setSubImagePreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Custom click outside for all dropdowns
  useEffect(() => {
    const handleOutside = () => {
      setShowBrandDropdown(false);
      setShowCategoryDropdown(false);
      setShowStatusDropdown(false);
    };
    document.addEventListener("click", handleOutside);
    return () => document.removeEventListener("click", handleOutside);
  }, []);

  // Form Validation
  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) newErrors.title = "Tên sản phẩm không được để trống.";
    if (!slug.trim()) {
      newErrors.slug = "Đường dẫn không được để trống.";
    } else {
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(slug)) {
        newErrors.slug = "Đường dẫn chỉ chứa chữ thường không dấu, số và dấu gạch ngang (ví dụ: whey-protein).";
      }
    }

    if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      newErrors.price = "Giá bán phải là số hợp lệ và không nhỏ hơn 0.";
    }

    if (originalPrice && (isNaN(parseFloat(originalPrice)) || parseFloat(originalPrice) < 0)) {
      newErrors.originalPrice = "Giá gốc phải là số hợp lệ.";
    }

    if (!isEdit && !thumbnailFile) {
      newErrors.thumbnail = "Vui lòng tải lên ảnh đại diện sản phẩm.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mapCategoryToProductType = (catId) => {
    const selectedCat = categoriesList.find((c) => c.id === catId);
    if (!selectedCat) return "supplement";
    const slugVal = (selectedCat.slug || "").toLowerCase();
    if (slugVal.includes("phu-kien") || slugVal.includes("accessory")) {
      return "accessory";
    }
    if (slugVal.includes("trang-phuc") || slugVal.includes("apparel") || slugVal.includes("ao-") || slugVal.includes("quan-")) {
      return "apparel";
    }
    return "supplement";
  };

  // Handle Form Submission
  const handleSubmit = (e, targetStatus) => {
    e.preventDefault();
    if (!validateForm()) return;

    const finalStatus = targetStatus || status;

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("slug", slug.trim());
    formData.append("categoryId", categoryId);
    formData.append("productType", mapCategoryToProductType(categoryId));
    formData.append("description", description.trim());
    formData.append("price", price);
    formData.append("status", finalStatus);

    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    }

    // Append sub-images
    subImageFiles.forEach((file) => {
      formData.append("images", file);
    });

    // Append deleted assets
    if (isEdit && deletedAssetIds.length > 0) {
      formData.append("deletedAssetIds", JSON.stringify(deletedAssetIds));
    }

    // Save metadata
    const metadataObj = {
      brand: brand.trim() || "",
      rating: product?.metadata?.rating || 5.0,
    };
    if (originalPrice) {
      metadataObj.originalPrice = parseFloat(originalPrice);
    }
    formData.append("metadata", JSON.stringify(metadataObj));

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto text-[var(--text-color)]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 shadow-2xl animate-reactions-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-color)]/60 flex items-center justify-between bg-black/10">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider">
              {isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
            </h2>
            <p className="text-[10px] text-[var(--text-muted)] font-medium">
              {isEdit ? "Cập nhật các thuộc tính và thông tin sản phẩm" : "Tạo sản phẩm và thiết lập cấu hình cửa hàng"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-black/10 transition cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-color)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={(e) => handleSubmit(e)} className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info Column (Left 2 cols) */}
          <div className="md:col-span-2 space-y-5">
            {/* Title Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">
                  Tên sản phẩm <span className="text-rose-500">*</span>
                </label>
                <span className="text-[9px] text-[var(--text-muted)] font-medium">{title.length}/120 ký tự</span>
              </div>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="Ví dụ: Whey Protein Isolate Gold Standard"
                className={`w-full px-4 py-2.5 rounded-xl bg-black/10 border text-xs font-bold focus:border-emerald-600 dark:focus:border-emerald-400 outline-none transition duration-200 ${
                  errors.title ? "border-rose-500/50" : "border-[var(--border-color)]/60"
                }`}
              />
              {errors.title && <p className="text-[9px] text-rose-500 font-bold">{errors.title}</p>}
            </div>

            {/* Slug Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">
                  Đường dẫn (Slug) <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={regenerateSlug}
                  className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 hover:underline cursor-pointer"
                >
                  <RefreshCw className="w-2.5 h-2.5" /> Tạo lại theo tên
                </button>
              </div>
              <div className="flex rounded-xl bg-black/10 border border-[var(--border-color)]/60 overflow-hidden items-center px-4 py-2.5 gap-1 focus-within:border-emerald-600 dark:focus-within:border-emerald-400 transition duration-200">
                <span className="text-xs text-[var(--text-muted)] select-none">store/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="whey-protein-isolate"
                  className="w-full bg-transparent text-xs font-bold outline-none border-none p-0"
                />
              </div>
              {errors.slug && <p className="text-[9px] text-rose-500 font-bold">{errors.slug}</p>}
            </div>

            {/* Brand Dropdown (Metadata) */}
            <div className="space-y-1.5 relative" onClick={(e) => e.stopPropagation()}>
              <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Thương hiệu</label>
              <div className="relative">
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  onFocus={() => setShowBrandDropdown(true)}
                  placeholder="Nhập thương hiệu mới hoặc chọn từ danh sách"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/10 border border-[var(--border-color)]/60 text-xs font-bold focus:border-emerald-600 dark:focus:border-emerald-400 outline-none transition duration-200"
                />
                {showBrandDropdown && existingBrands.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 rounded-2xl shadow-xl z-20 py-1.5 animate-reactions-in">
                    {existingBrands.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          setBrand(b);
                          setShowBrandDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-black/10 transition cursor-pointer"
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Category Dropdown (Custom UI) */}
            <div className="space-y-1.5 relative select-none" onClick={(e) => e.stopPropagation()}>
              <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Danh mục</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryDropdown(!showCategoryDropdown);
                    setShowStatusDropdown(false);
                    setShowBrandDropdown(false);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/10 border border-[var(--border-color)]/60 text-xs font-bold text-left flex justify-between items-center cursor-pointer hover:border-[var(--text-color)]/40 focus:border-emerald-600 dark:focus:border-emerald-400 outline-none transition duration-200"
                >
                  <span className={categoryId ? "text-[var(--text-color)]" : "text-[var(--text-muted)]"}>
                    {categoryId 
                      ? (categoriesList.find(c => c.id === categoryId)?.name || "-- Chưa chọn danh mục --") 
                      : "-- Chưa chọn danh mục --"}
                  </span>
                  <Plus className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${showCategoryDropdown ? "rotate-45" : ""}`} />
                </button>
                {showCategoryDropdown && (
                  <div className="absolute left-0 right-0 mt-1 max-h-45 overflow-y-auto bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 rounded-2xl shadow-xl z-35 py-1.5 animate-reactions-in">
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryId("");
                        setShowCategoryDropdown(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-[var(--text-muted)] hover:bg-black/10 transition cursor-pointer"
                    >
                      -- Chưa chọn danh mục --
                    </button>
                    {categoriesList.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setCategoryId(cat.id);
                          setShowCategoryDropdown(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-xs font-bold transition cursor-pointer flex justify-between items-center ${
                          categoryId === cat.id ? "bg-emerald-500/10 text-emerald-400" : "hover:bg-black/10"
                        }`}
                      >
                        <span>{cat.name}</span>
                        {categoryId === cat.id && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Description Textarea */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Mô tả sản phẩm</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả chi tiết của sản phẩm (hương vị, cách dùng, thành phần, size...)"
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-black/10 border border-[var(--border-color)]/60 text-xs font-bold focus:border-emerald-600 dark:focus:border-emerald-400 outline-none transition duration-200 resize-y leading-relaxed"
              />
            </div>
          </div>

          {/* Pricing & Image Column (Right 1 col) */}
          <div className="space-y-5">
            {/* Price Inputs */}
            <div className="p-4 rounded-2xl bg-black/10 border border-[var(--border-color)]/40 space-y-4">
              <h3 className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider flex items-center gap-1.5 border-b border-[var(--border-color)]/30 pb-2">
                Thông tin giá bán
              </h3>

              {/* Price */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-wider flex justify-between">
                  Giá bán hiện tại (đ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Ví dụ: 1.250.000"
                  className={`w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border text-xs font-bold focus:border-emerald-600 dark:focus:border-emerald-400 outline-none transition duration-200 ${
                    errors.price ? "border-rose-500/50" : "border-[var(--border-color)]/60"
                  }`}
                />
                {errors.price && <p className="text-[9px] text-rose-500 font-bold">{errors.price}</p>}
              </div>

              {/* Original Price */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-wider">Giá gốc cũ (đ)</label>
                <input
                  type="text"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Ví dụ: 1.500.000"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 text-xs font-bold focus:border-emerald-600 dark:focus:border-emerald-400 outline-none transition duration-200"
                />
              </div>

              {/* Currency */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-wider">Tiền tệ</label>
                <input
                  type="text"
                  value="VND"
                  disabled
                  className="w-full px-3 py-2 rounded-lg bg-[var(--border-color)]/20 border border-[var(--border-color)]/40 text-xs font-bold text-[var(--text-muted)]"
                />
              </div>
            </div>

            {/* Image Upload Display */}
            <div className="p-4 rounded-2xl bg-black/10 border border-[var(--border-color)]/40 space-y-3">
              <h3 className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider flex items-center justify-between border-b border-[var(--border-color)]/30 pb-2">
                <span>Ảnh đại diện</span>
                <span className="text-rose-500 font-normal">*</span>
              </h3>

              {thumbnailPreview ? (
                <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-[var(--border-color)]/60 bg-black/20 group">
                  <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 bg-emerald-600 rounded-lg text-white hover:scale-105 transition cursor-pointer"
                      title="Thay đổi ảnh"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={removeThumbnail}
                      className="p-2 bg-rose-500 rounded-lg text-white hover:scale-105 transition cursor-pointer"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 hover:border-emerald-600 dark:hover:border-emerald-400 hover:bg-emerald-500/5 transition cursor-pointer ${
                    errors.thumbnail ? "border-rose-500/50 bg-rose-500/5" : "border-[var(--border-color)]/60"
                  }`}
                >
                  <Upload className="w-6 h-6 text-[var(--text-muted)] mb-2" />
                  <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider text-center">
                    Tải ảnh lên
                  </span>
                  <span className="text-[8px] text-[var(--text-muted)] mt-1 text-center">
                    Chấp nhận JPG, PNG, WEBP (Tối đa 5MB)
                  </span>
                </button>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
              />
              {errors.thumbnail && <p className="text-[9px] text-rose-500 font-bold mt-1">{errors.thumbnail}</p>}
            </div>

            {/* Lifecycle Status Dropdown (Custom UI) */}
            <div className="space-y-1.5 relative select-none" onClick={(e) => e.stopPropagation()}>
              <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Trạng thái phát hành</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowStatusDropdown(!showStatusDropdown);
                    setShowCategoryDropdown(false);
                    setShowBrandDropdown(false);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/10 border border-[var(--border-color)]/60 text-xs font-bold text-left flex justify-between items-center cursor-pointer hover:border-[var(--text-color)]/40 focus:border-emerald-600 dark:focus:border-emerald-400 outline-none transition duration-200"
                >
                  <span>
                    {status === "draft" && "Bản nháp"}
                    {status === "active" && "Đang bán"}
                    {status === "out_of_stock" && "Hết hàng"}
                    {status === "archived" && "Lưu trữ"}
                  </span>
                  <Plus className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${showStatusDropdown ? "rotate-45" : ""}`} />
                </button>
                {showStatusDropdown && (
                  <div className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 rounded-2xl shadow-xl z-35 py-1.5 animate-reactions-in">
                    {[
                      { value: "draft", label: "Bản nháp" },
                      { value: "active", label: "Đang bán" },
                      { value: "out_of_stock", label: "Hết hàng" },
                      ...(isEdit ? [{ value: "archived", label: "Lưu trữ" }] : []),
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => {
                          setStatus(item.value);
                          setShowStatusDropdown(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-xs font-bold transition cursor-pointer flex justify-between items-center ${
                          status === item.value ? "bg-emerald-500/10 text-emerald-400" : "hover:bg-black/10"
                        }`}
                      >
                        <span>{item.label}</span>
                        {status === item.value && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sub-Images Upload Section */}
            <div className="p-4 rounded-2xl bg-black/10 border border-[var(--border-color)]/40 space-y-3">
              <h3 className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider flex items-center justify-between border-b border-[var(--border-color)]/30 pb-2">
                <span>Ảnh con sản phẩm</span>
                <span className="text-[9px] font-normal text-[var(--text-muted)]">
                  {existingAssets.length + subImageFiles.length}/5
                </span>
              </h3>

              <div className="grid grid-cols-3 gap-2">
                {/* Existing assets */}
                {existingAssets.map((asset) => (
                  <div key={asset.id} className="relative aspect-square rounded-xl overflow-hidden border border-[var(--border-color)]/45 bg-black/25 group">
                    <img src={asset.fileUrl} alt="Sub-image" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeSubImage(null, true, asset.id)}
                        className="p-1.5 bg-rose-500 rounded-lg text-white hover:scale-110 transition cursor-pointer"
                        title="Xóa ảnh"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* New sub-images previews */}
                {subImagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-[var(--border-color)]/45 bg-black/25 group">
                    <img src={preview} alt="New Sub-image" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeSubImage(index, false)}
                        className="p-1.5 bg-rose-500 rounded-lg text-white hover:scale-110 transition cursor-pointer"
                        title="Xóa ảnh"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Upload button if under limit */}
                {existingAssets.length + subImageFiles.length < 5 && (
                  <button
                    type="button"
                    onClick={() => subImagesInputRef.current?.click()}
                    className="aspect-square rounded-xl border border-dashed border-[var(--border-color)]/60 hover:border-emerald-500 hover:bg-emerald-500/5 transition flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[var(--text-muted)]" />
                    <span className="text-[8px] font-black uppercase text-[var(--text-muted)] tracking-wider mt-1">Thêm ảnh</span>
                  </button>
                )}
              </div>

              <input
                type="file"
                ref={subImagesInputRef}
                onChange={handleSubImagesChange}
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
              />
              {errors.subImages && <p className="text-[9px] text-rose-500 font-bold mt-1">{errors.subImages}</p>}
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[var(--border-color)]/60 bg-black/10 flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-black uppercase tracking-wider hover:bg-black/10 transition duration-200 cursor-pointer text-[var(--text-muted)]"
          >
            Hủy
          </button>

          {isEdit ? (
            <button
              type="button"
              onClick={(e) => handleSubmit(e)}
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs uppercase tracking-wider transition duration-200 cursor-pointer shadow-md shadow-emerald-500/10 disabled:opacity-50"
            >
              {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => handleSubmit(e)}
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs uppercase tracking-wider transition duration-200 cursor-pointer shadow-md shadow-emerald-500/10 disabled:opacity-50"
            >
              {isLoading ? "Đang tạo..." : "Tạo sản phẩm"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
