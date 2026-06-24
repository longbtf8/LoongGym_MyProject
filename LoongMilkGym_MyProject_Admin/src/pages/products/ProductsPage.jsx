import React, { useState, useMemo } from "react";
import { Plus, Download } from "lucide-react";
import {
  useGetProductsQuery,
  useGetProductCategoriesQuery,
  useGetProductBrandsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUpdateProductStatusMutation,
  useDeleteProductMutation,
  useGetDashboardQuery,
} from "@/services/admin/adminApi";
import useUrlFilters from "@/hooks/useUrlFilters";
import useToast from "@/hooks/useToast";

import PageHeader from "@/components/common/PageHeader";
import Pagination from "@/components/common/Pagination";
import FilterToolbar from "@/components/common/FilterToolbar";

// Sub-components
import ProductStatsCards from "./components/ProductStatsCards";
import ProductsTable from "./components/ProductsTable";
import ProductDetailDrawer from "./components/ProductDetailDrawer";
import ProductFormModal from "./components/ProductFormModal";
import ProductStatusModal from "./components/ProductStatusModal";


export default function ProductsPage() {
  const { showToast } = useToast();
  
  // URL Filters State Management
  const {
    params,
    searchVal,
    setSearchVal,
    updateQueryParam,
    updateQueryParams,
    handleClearFilters,
    handlePageChange,
  } = useUrlFilters({
    defaultParams: {
      page: "1",
      limit: "10",
      search: "",
      categoryId: "",
      status: "",
      productType: "",
      sort: "newest",
    },
  });

  // API Queries & Mutations
  const { data: dashboardResponse } = useGetDashboardQuery();
  const { data: categoriesResponse } = useGetProductCategoriesQuery();
  const categoriesList = categoriesResponse?.data || [];

  const { data: productsResponse, isLoading: isProductsLoading } = useGetProductsQuery({
    page: parseInt(params.page) || 1,
    limit: parseInt(params.limit) || 10,
    search: params.search || "",
    categoryId: params.categoryId || "",
    status: params.status || "",
    productType: params.productType || "",
    sort: params.sort || "newest",
  });

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [updateProductStatus, { isLoading: isUpdatingStatus }] = useUpdateProductStatusMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  // Drawer / Modals State
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusActionType, setStatusActionType] = useState(null); // 'publish', 'unpublish', 'out_of_stock', 'archive', 'restore', 'delete'
  const [statusActionProduct, setStatusActionProduct] = useState(null);

  const { data: brandsResponse } = useGetProductBrandsQuery();
  const dbBrands = brandsResponse?.data || [];

  // Compute unique brands from current items to help autocompleting
  const uniqueBrands = useMemo(() => {
    const pageItems = productsResponse?.data?.items || [];
    const pageBrands = pageItems
      .map((item) => item.metadata?.brand)
      .filter(Boolean);
    const combined = [...new Set([...dbBrands, ...pageBrands])];
    return combined.sort();
  }, [dbBrands, productsResponse]);

  // Actions Handling
  const handleOpenDetail = (id) => {
    setSelectedProductId(id);
    setIsDrawerOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
    setIsDrawerOpen(false); // Close drawer if open
  };

  const handleStatusAction = (action, product) => {
    setStatusActionType(action);
    setStatusActionProduct(product);
    setIsStatusModalOpen(true);
  };

  const handleConfirmStatusAction = async () => {
    if (!statusActionProduct || !statusActionType) return;

    try {
      if (statusActionType === "delete") {
        await deleteProduct(statusActionProduct.id).unwrap();
        showToast("Xóa sản phẩm vĩnh viễn thành công!", "success");
        setIsDrawerOpen(false); // Close drawer if we were viewing it
      } else {
        await updateProductStatus({
          id: statusActionProduct.id,
          action: statusActionType,
        }).unwrap();

        const successMessages = {
          publish: "Đã xuất bản sản phẩm thành công!",
          unpublish: "Đã tạm ẩn sản phẩm về bản nháp!",
          out_of_stock: "Đã đánh dấu hết hàng thành công!",
          archive: "Đã lưu trữ sản phẩm thành công!",
          restore: "Đã khôi phục sản phẩm về bản nháp!",
        };
        showToast(successMessages[statusActionType] || "Cập nhật trạng thái thành công!", "success");
      }
      setIsStatusModalOpen(false);
    } catch (err) {
      showToast(err?.data?.message || "Đã xảy ra lỗi khi thực hiện hành động.", "error");
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingProduct) {
        await updateProduct({ id: editingProduct.id, formData }).unwrap();
        showToast("Cập nhật sản phẩm thành công!", "success");
      } else {
        await createProduct(formData).unwrap();
        showToast("Tạo sản phẩm mới thành công!", "success");
      }
      setIsFormModalOpen(false);
    } catch (err) {
      showToast(err?.data?.message || "Đã xảy ra lỗi khi lưu sản phẩm.", "error");
    }
  };

  // Build Filters Config for FilterToolbar
  const toolbarFilters = [
    {
      type: "select",
      value: params.categoryId || "",
      onChange: (val) => updateQueryParam("categoryId", val),
      options: [
        { label: "Tất cả danh mục", value: "" },
        ...categoriesList.map((c) => ({ label: c.name, value: c.id })),
      ],
    },
    {
      type: "select",
      value: params.status || "",
      onChange: (val) => updateQueryParam("status", val),
      options: [
        { label: "Tất cả trạng thái", value: "" },
        { label: "Đang bán", value: "active" },
        { label: "Bản nháp", value: "draft" },
        { label: "Hết hàng", value: "out_of_stock" },
        { label: "Đã lưu trữ", value: "archived" },
      ],
    },
    {
      type: "select",
      value: params.sort || "newest",
      onChange: (val) => updateQueryParam("sort", val),
      options: [
        { label: "Mới nhất", value: "newest" },
        { label: "Cũ nhất", value: "oldest" },
        { label: "Giá tăng dần", value: "price_asc" },
        { label: "Giá giảm dần", value: "price_desc" },
        { label: "Tên A-Z", value: "name_asc" },
      ],
    },
  ];

  const isFilterActive = !!(
    params.search ||
    params.categoryId ||
    params.status ||
    params.sort !== "newest"
  );

  const pagination = productsResponse?.data?.pagination || {
    page: 1,
    totalPages: 1,
    total: 0,
  };

  return (
    <>
      <div className="space-y-6 animate-reactions-in relative pb-16">
        {/* Toast Alert */}
        {/* Page Header */}
        <PageHeader
          title="Quản lý sản phẩm"
          description="Quản lý danh mục sản phẩm, giá bán và trạng thái hàng tồn kho của cửa hàng."
          extra={
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-2xl bg-[#ccff00] hover:bg-[#b5e000] text-black font-extrabold text-xs uppercase tracking-wider transition duration-200 cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#ccff00]/10"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Tạo sản phẩm
            </button>
          }
        />

        {/* Stats Section */}
        <ProductStatsCards
          stats={dashboardResponse?.data}
          activeStatusFilter={params.status || ""}
          onStatusFilterChange={(statusVal) => updateQueryParam("status", statusVal)}
        />

        {/* Main Grid Area */}
        <div className="rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 shadow-lg">
          {/* Filters Toolbar */}
          <FilterToolbar
            searchVal={searchVal}
            setSearchVal={setSearchVal}
            searchPlaceholder="Tìm sản phẩm theo tên hoặc slug..."
            filters={toolbarFilters}
            onRefresh={() => {}}
            onClear={() => handleClearFilters(["limit"])}
            isFilterActive={isFilterActive}
            extraActions={
              <button
                onClick={handleOpenCreate}
                className="px-5 py-3 rounded-2xl bg-[#ccff00] hover:bg-[#b5e000] text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-300 shadow-md flex items-center gap-1.5 cursor-pointer border border-black/10 hover:shadow-[#ccff00]/20 shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Tạo sản phẩm
              </button>
            }
          />

          {/* Table list */}
          <ProductsTable
            products={productsResponse?.data?.items || []}
            isLoading={isProductsLoading}
            onOpenDetail={handleOpenDetail}
            onEdit={handleOpenEdit}
            onStatusAction={handleStatusAction}
            search={params.search}
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination
              pagination={pagination}
              currentPage={pagination.page}
              limit={parseInt(params.limit) || 10}
              onPageChange={handlePageChange}
              label="sản phẩm"
            />
          )}
        </div>
      </div>

      {/* Product Detail Drawer */}
      <ProductDetailDrawer
        productId={selectedProductId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={handleOpenEdit}
        onStatusAction={handleStatusAction}
      />

      {/* Product Form Modal (Create / Edit) */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        product={editingProduct}
        existingBrands={uniqueBrands}
        isLoading={isCreating || isUpdating}
      />

      {/* Confirmation Actions Modal */}
      <ProductStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={handleConfirmStatusAction}
        actionType={statusActionType}
        productName={statusActionProduct?.title || ""}
        isLoading={isUpdatingStatus || isDeleting}
      />
    </>
  );
}
