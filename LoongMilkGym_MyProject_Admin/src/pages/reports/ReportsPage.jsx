import React, { useState, useEffect } from "react";
import { 
  useGetReportsQuery, 
  useResolveReportMutation, 
  useGetDashboardQuery 
} from "@/services/admin/adminApi";
import useUrlFilters from "@/hooks/useUrlFilters";
import useToast from "@/hooks/useToast";
import PageHeader from "@/components/common/PageHeader";
import Pagination from "@/components/common/Pagination";
import FilterToolbar from "@/components/common/FilterToolbar";
import ReportsStatsBar from "./components/ReportsStatsBar";
import ReportsTable from "./components/ReportsTable";
import ReportDetailDrawer from "./components/ReportDetailDrawer";
import ResolveReportModal from "./components/ResolveReportModal";

export default function ReportsPage() {
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
      status: "PENDING", // Default to PENDING
      search: "",
      reason: "",
      dateFrom: "",
      dateTo: "",
      sort: "newest",
      reportId: "",
      postId: ""
    }
  });

  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 10;
  const status = params.status || "PENDING";
  const search = params.search || "";
  const reason = params.reason || "";
  const dateFrom = params.dateFrom || "";
  const dateTo = params.dateTo || "";
  const sort = params.sort || "newest";
  const reportId = params.reportId || "";
  const postId = params.postId || "";

  // Detail Drawer & Confirm Modal States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("");
  const [modalReport, setModalReport] = useState(null);

  const { showToast } = useToast();

  // Fetch reports list
  const { data: reportsData, isLoading: isReportsLoading, refetch: refetchReports } = useGetReportsQuery({
    page,
    limit,
    status,
    search,
    reason,
    dateFrom,
    dateTo,
    sort,
    postId,
  });

  // Fetch dashboard summary for stats
  const { data: dashboardData } = useGetDashboardQuery();
  const [resolveReport, { isLoading: isResolving }] = useResolveReportMutation();

  const reportsList = reportsData?.data?.items || [];
  const pagination = reportsData?.data?.pagination;
  const reportsStats = dashboardData?.data?.reports;

  // Handle auto-opening of drawer when reportId exists in URL
  useEffect(() => {
    if (reportId) {
      setSelectedReportId(reportId);
      setIsDrawerOpen(true);
    } else {
      setIsDrawerOpen(false);
      setSelectedReportId(null);
    }
  }, [reportId]);

  // Open detail drawer
  const handleOpenDetail = (id) => {
    updateQueryParam("reportId", id);
  };

  // Close detail drawer
  const handleCloseDetail = () => {
    updateQueryParam("reportId", "");
  };

  // Open resolution confirm modal
  const handleOpenResolveModal = (action, reportObj) => {
    setModalAction(action);
    setModalReport(reportObj);
    setIsModalOpen(true);
  };

  // Confirm resolution handler
  const handleConfirmResolve = async ({ action, notes }) => {
    if (!modalReport) return;
    try {
      const res = await resolveReport({ id: modalReport.id, action, notes }).unwrap();
      if (res.success) {
        showToast(res.message || "Xử lý báo cáo thành công!", "success");
        setIsModalOpen(false);
        setModalReport(null);
        handleCloseDetail();
        refetchReports();
      }
    } catch (err) {
      showToast(err.data?.message || "Đã xảy ra lỗi khi xử lý báo cáo.", "error");
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

  // Tab configurations
  const statusTabs = [
    { value: "PENDING", label: "Đang chờ" },
    { value: "RESOLVED", label: "Đã xử lý" },
    { value: "DISMISSED", label: "Đã bỏ qua" }
  ];

  const filtersConfig = [
    {
      type: "select",
      value: reason,
      onChange: (val) => updateQueryParam("reason", val),
      options: [
        { label: "Tất cả lý do", value: "" },
        { label: "Tình dục không phù hợp", value: "Nội dung tình dục" },
        { label: "Bạo lực & Thù ghét", value: "Bạo lực" },
        { label: "Quấy rối & Đe dọa", value: "Quấy rối" },
        { label: "Lừa đảo & Giả mạo", value: "Lừa đảo" },
        { label: "Spam & Quảng cáo", value: "Spam" }
      ]
    },
    {
      type: "select",
      value: sort,
      onChange: (val) => updateQueryParam("sort", val),
      options: [
        { label: "Mới nhất", value: "newest" },
        { label: "Nhiều báo cáo nhất", value: "most_reported" }
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

  const isFilterActive = !!(search || reason || dateFrom || dateTo);

  return (
    <>
      <div className="relative">
        <div className="space-y-6 animate-reactions-in">
          
          {/* Toast Notification */}
          {/* Page Header */}
          <PageHeader 
            title="Báo cáo vi phạm"
            description="Xem xét và xử lý các nội dung vi phạm do cộng đồng thành viên báo cáo."
          />

          {/* Stats Widgets */}
          <ReportsStatsBar reportsStats={reportsStats} />

          {/* Status Tabs Header */}
          <div className="flex border-b border-[var(--border-color)]/60 gap-6 mt-4">
            {statusTabs.map((t) => {
              const isActive = status === t.value;
              const getTabCount = () => {
                if (t.value === "PENDING" && reportsStats?.pending !== undefined) {
                  return reportsStats.pending;
                }
                return undefined;
              };
              const count = getTabCount();

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
                  {count !== undefined && count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black transition-colors ${
                      isActive 
                        ? "bg-[var(--color-primary)] text-black" 
                        : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                    }`}>
                      {count}
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
            searchPlaceholder="Tìm kiếm nội dung, người đăng, người report..."
            filters={filtersConfig}
            onRefresh={refetchReports}
            onClear={() => handleClearFilters(["status", "limit"])}
            isFilterActive={isFilterActive}
          />

          {/* Reports Table List */}
          <ReportsTable
            reportsList={reportsList}
            isLoading={isReportsLoading}
            onOpenDetail={handleOpenDetail}
            formatDateStr={formatDateStr}
            search={search}
            reason={reason}
            dateFrom={dateFrom}
            dateTo={dateTo}
            pagination={pagination}
            currentPage={page}
            limit={limit}
            onPageChange={handlePageChange}
          />

        </div>
      </div>

      {/* DETAIL DRAWER */}
      <ReportDetailDrawer 
        reportId={selectedReportId}
        isOpen={isDrawerOpen}
        onClose={handleCloseDetail}
        onResolveClick={handleOpenResolveModal}
        showToast={showToast}
      />

      {/* RESOLVE CONFIRMATION MODAL */}
      <ResolveReportModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setModalReport(null); }}
        onConfirm={handleConfirmResolve}
        action={modalAction}
        report={modalReport}
        isLoading={isResolving}
      />
    </>
  );
}
