import React, { useState, useEffect } from "react";
import { 
  useGetPostsQuery, 
  useModeratePostMutation 
} from "@/services/admin/adminApi";
import useUrlFilters from "@/hooks/useUrlFilters";
import useToast from "@/hooks/useToast";
import PageHeader from "@/components/common/PageHeader";
import Pagination from "@/components/common/Pagination";
import FilterToolbar from "@/components/common/FilterToolbar";
import PostsStatsBar from "./components/PostsStatsBar";
import PostsTable from "./components/PostsTable";
import PostDetailDrawer from "./components/PostDetailDrawer";
import ModeratePostModal from "./components/ModeratePostModal";

export default function PostsPage() {
  const {
    params,
    searchVal,
    setSearchVal,
    updateQueryParam,
    handleClearFilters,
    handlePageChange
  } = useUrlFilters({
    defaultParams: {
      page: "1",
      limit: "10",
      status: "",
      postType: "",
      search: "",
      hasReports: "",
      hasMedia: "",
      dateFrom: "",
      dateTo: "",
      sort: "newest",
      postId: ""
    }
  });

  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 10;
  const status = params.status || "";
  const postType = params.postType || "";
  const search = params.search || "";
  const hasReports = params.hasReports || "";
  const hasMedia = params.hasMedia || "";
  const dateFrom = params.dateFrom || "";
  const dateTo = params.dateTo || "";
  const sort = params.sort || "newest";
  const postId = params.postId || "";

  // Detail Drawer & Action Modal States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("");
  const [modalPost, setModalPost] = useState(null);

  const { showToast } = useToast();

  // Fetch posts list query hook
  const { data: postsData, isLoading: isPostsLoading, refetch: refetchPosts } = useGetPostsQuery({
    page,
    limit,
    status,
    postType,
    search,
    hasReports,
    hasMedia,
    dateFrom,
    dateTo,
    sort,
  });

  const [moderatePost, { isLoading: isModerating }] = useModeratePostMutation();

  const postsList = postsData?.data?.items || [];
  const pagination = postsData?.data?.pagination;
  const counts = postsData?.data?.meta?.counts;

  // Handle auto-opening of drawer when postId exists in URL
  useEffect(() => {
    if (postId) {
      setSelectedPostId(postId);
      setIsDrawerOpen(true);
    } else {
      setIsDrawerOpen(false);
      setSelectedPostId(null);
    }
  }, [postId]);

  const handleOpenDetail = (id) => {
    updateQueryParam("postId", id);
  };

  const handleCloseDetail = () => {
    updateQueryParam("postId", "");
  };

  const handleOpenModerateModal = (action, postObj) => {
    setModalAction(action);
    setModalPost(postObj);
    setIsModalOpen(true);
  };

  const handleConfirmModerate = async ({ action, reason }) => {
    if (!modalPost) return;
    try {
      const res = await moderatePost({ id: modalPost.id, action, reason }).unwrap();
      if (res.success) {
        showToast(res.message || "Kiểm duyệt bài viết thành công!", "success");
        setIsModalOpen(false);
        setModalPost(null);
        handleCloseDetail();
        refetchPosts();
      }
    } catch (err) {
      showToast(err.data?.message || "Đã xảy ra lỗi khi kiểm duyệt bài viết.", "error");
    }
  };

  const formatDateStr = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const statusTabs = [
    { value: "", label: "Tất cả bài viết", count: counts?.total },
    { value: "VISIBLE", label: "Đang hiển thị", count: counts?.visible },
    { value: "HIDDEN", label: "Tạm ẩn", count: counts?.hidden },
    { value: "REMOVED", label: "Đã xóa (Admin)", count: counts?.removed }
  ];

  const filtersConfig = [
    {
      type: "select",
      value: postType,
      onChange: (val) => updateQueryParam("postType", val),
      options: [
        { label: "Mọi loại bài đăng", value: "" },
        { label: "Chỉ văn bản", value: "text" },
        { label: "Kèm buổi tập", value: "workout_session" }
      ]
    },
    {
      type: "select",
      value: hasReports,
      onChange: (val) => updateQueryParam("hasReports", val),
      options: [
        { label: "Trạng thái báo cáo", value: "" },
        { label: "Bị báo cáo vi phạm", value: "true" },
        { label: "Không bị báo cáo", value: "false" }
      ]
    },
    {
      type: "select",
      value: hasMedia,
      onChange: (val) => updateQueryParam("hasMedia", val),
      options: [
        { label: "Tệp đính kèm", value: "" },
        { label: "Có ảnh/video", value: "true" },
        { label: "Không đính kèm file", value: "false" }
      ]
    },
    {
      type: "select",
      value: sort,
      onChange: (val) => updateQueryParam("sort", val),
      options: [
        { label: "Mới nhất", value: "newest" },
        { label: "Cũ nhất", value: "oldest" },
        { label: "Báo cáo nhiều nhất", value: "most_reported" },
        { label: "Tương tác nhiều nhất", value: "most_liked" }
      ]
    },
    {
      type: "date",
      label: "Từ:",
      value: dateFrom,
      onChange: (val) => updateQueryParam("dateFrom", val)
    },
    {
      type: "date",
      label: "Đến:",
      value: dateTo,
      onChange: (val) => updateQueryParam("dateTo", val)
    }
  ];

  const handleTabChange = (tabVal) => {
    updateQueryParam("status", tabVal);
  };

  const isFilterActive = !!(search || postType || hasReports || hasMedia || dateFrom || dateTo);

  return (
    <>
      <div className="relative">
        <div className="space-y-6 animate-reactions-in">
          
          {/* Toast Notification */}
          {/* Page Header */}
          <PageHeader 
            title="Quản lý bài viết"
            description="Chủ động duyệt toàn bộ các bài đăng cộng đồng, xem chi tiết buổi tập, phản hồi, và xử lý vi phạm nội dung."
          />

          {/* Quick statistics widgets */}
          <PostsStatsBar counts={counts} />

          {/* Tabs header */}
          <div className="flex border-b border-[var(--border-color)]/60 gap-6 mt-4">
            {statusTabs.map((t) => {
              const isActive = status === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => handleTabChange(t.value)}
                  className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                    isActive 
                      ? "border-[var(--color-primary)] text-[var(--color-primary)] font-extrabold" 
                      : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-color)]"
                  }`}
                >
                  <span>{t.label}</span>
                  {t.count !== undefined && (
                    <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black transition-colors ${
                      isActive 
                        ? "bg-[var(--color-primary)] text-black" 
                        : "bg-[var(--border-color)]/80 text-[var(--text-muted)]"
                    }`}>
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Filters Toolbar */}
          <FilterToolbar
            searchVal={searchVal}
            setSearchVal={setSearchVal}
            searchPlaceholder="Tìm kiếm nội dung bài đăng, email, tên người dùng..."
            filters={filtersConfig}
            onRefresh={refetchPosts}
            onClear={() => handleClearFilters(["status", "limit"])}
            isFilterActive={isFilterActive}
          />

          {/* Posts Table List */}
          <PostsTable 
            postsList={postsList}
            isLoading={isPostsLoading}
            onOpenDetail={handleOpenDetail}
            onOpenModerateModal={handleOpenModerateModal}
            formatDateStr={formatDateStr}
            pagination={pagination}
            currentPage={page}
            limit={limit}
            onPageChange={handlePageChange}
          />

        </div>
      </div>

      {/* DETAIL DRAWER */}
      <PostDetailDrawer 
        postId={selectedPostId}
        isOpen={isDrawerOpen}
        onClose={handleCloseDetail}
        onModerateClick={handleOpenModerateModal}
      />

      {/* MODERATE CONFIRMATION MODAL */}
      <ModeratePostModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setModalPost(null); }}
        onConfirm={handleConfirmModerate}
        action={modalAction}
        post={modalPost}
        isLoading={isModerating}
      />
    </>
  );
}
