import React, { useState, useEffect } from "react";
import { 
  useGetUsersQuery, 
  useUpdateUserStatusMutation, 
  useUpdateUserRoleMutation, 
  useGetDashboardQuery 
} from "@/services/admin/adminApi";
import { useAuth } from "@/hooks/useAuth";
import useUrlFilters from "@/hooks/useUrlFilters";
import useToast from "@/hooks/useToast";
import PageHeader from "@/components/common/PageHeader";
import Pagination from "@/components/common/Pagination";
import FilterToolbar from "@/components/common/FilterToolbar";
import UsersStatsBar from "./components/UsersStatsBar";
import UsersTable from "./components/UsersTable";
import UserDetailDrawer from "./components/UserDetailDrawer";
import BanUserModal from "./components/BanUserModal";
import ConfirmRoleModal from "./components/ConfirmRoleModal";
import PostDetailDrawer from "@/pages/posts/components/PostDetailDrawer";

export default function UsersPage() {
  const { userInfo } = useAuth();
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
      role: "",
      status: "",
      search: ""
    }
  });

  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 10;
  const role = params.role || "";
  const status = params.status || "";
  const search = params.search || "";

  // Detail Drawer & Ban Modal state
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const [modalUser, setModalUser] = useState(null);
  const [modalMode, setModalMode] = useState("lock"); // "lock" | "unlock"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isPostDrawerOpen, setIsPostDrawerOpen] = useState(false);

  // Role modification state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [roleModalTargetRole, setRoleModalTargetRole] = useState("USER");

  const { showToast } = useToast();

  // Fetch users & dashboard counts
  const { data: usersData, isLoading: isUsersLoading, refetch: refetchUsers } = useGetUsersQuery({
    page,
    limit,
    role,
    status,
    search,
  });

  const { data: dashboardData } = useGetDashboardQuery();
  const [updateUserStatus, { isLoading: isUpdatingStatus }] = useUpdateUserStatusMutation();
  const [updateUserRole, { isLoading: isUpdatingRole }] = useUpdateUserRoleMutation();

  const usersList = usersData?.data?.items || [];
  const pagination = usersData?.data?.pagination;
  const userStats = dashboardData?.data?.users;



  // Open lock modal
  const handleOpenLockModal = (userToLock) => {
    setModalUser(userToLock);
    setModalMode("lock");
    setIsModalOpen(true);
  };

  // Open unlock modal
  const handleOpenUnlockModal = (userToUnlock) => {
    setModalUser(userToUnlock);
    setModalMode("unlock");
    setIsModalOpen(true);
  };

  // Confirm lock/unlock action
  const handleConfirmStatusUpdate = async (body) => {
    try {
      await updateUserStatus({
        id: modalUser.id,
        ...body,
      }).unwrap();

      showToast(
        body.status === "ACTIVE" 
          ? "Đã mở khóa tài khoản thành công." 
          : "Đã khóa tài khoản thành công.",
        "success"
      );
      setIsModalOpen(false);
      setModalUser(null);
      refetchUsers();
    } catch (err) {
      const errMsg = err.data?.message || "Đã xảy ra lỗi khi thay đổi trạng thái.";
      showToast(errMsg, "error");
    }
  };

  // Open role confirmation modal
  const handleOpenRoleModal = (userObj) => {
    setRoleModalUser(userObj);
    setRoleModalTargetRole(userObj.role === "ADMIN" ? "USER" : "ADMIN");
    setIsRoleModalOpen(true);
  };

  // Confirm role action
  const handleConfirmRoleUpdate = async (body) => {
    try {
      await updateUserRole({
        id: roleModalUser.id,
        ...body,
      }).unwrap();

      showToast(
        body.role === "ADMIN" 
          ? "Đã nâng cấp vai trò thành ADMIN thành công." 
          : "Đã hạ vai trò thành USER thành công.",
        "success"
      );
      setIsRoleModalOpen(false);
      setRoleModalUser(null);
      refetchUsers();
    } catch (err) {
      const errMsg = err.data?.message || "Đã xảy ra lỗi khi thay đổi vai trò.";
      showToast(errMsg, "error");
    }
  };

  // Helper date formatter
  const formatDateStr = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const filtersConfig = [
    {
      type: "select",
      value: role,
      onChange: (val) => updateQueryParam("role", val),
      options: [
        { label: "Tất cả vai trò", value: "" },
        { label: "USER", value: "USER" },
        { label: "ADMIN", value: "ADMIN" }
      ]
    },
    {
      type: "select",
      value: status,
      onChange: (val) => updateQueryParam("status", val),
      options: [
        { label: "Tất cả trạng thái", value: "" },
        { label: "ACTIVE", value: "ACTIVE" },
        { label: "SUSPENDED", value: "SUSPENDED" },
        { label: "BANNED", value: "BANNED" }
      ]
    }
  ];

  const isFilterActive = !!(search || role || status);

  const handleOpenDetail = (userId) => {
    setSelectedUserId(userId);
    setIsDrawerOpen(true);
  };

  return (
    <>
      <div className="space-y-6 animate-reactions-in relative">
        
        {/* Toast Notification */}
        {/* Page Header */}
        <PageHeader 
          title="Quản lý người dùng"
          description="Xem thông tin, trạng thái và kiểm soát quyền truy cập của thành viên."
        />

        {/* Mini Stats Grid */}
        <UsersStatsBar userStats={userStats} />

        {/* Filters Toolbar */}
        <FilterToolbar
          searchVal={searchVal}
          setSearchVal={setSearchVal}
          searchPlaceholder="Tìm kiếm người dùng..."
          filters={filtersConfig}
          onRefresh={refetchUsers}
          onClear={() => handleClearFilters(["limit"])}
          isFilterActive={isFilterActive}
        />

        {/* Main Table Content */}
        <UsersTable
          usersList={usersList}
          isLoading={isUsersLoading}
          onOpenDetail={handleOpenDetail}
          formatDateStr={formatDateStr}
          currentAdminId={userInfo?.id}
          isCurrentUserSuperAdmin={userInfo?.isSuperAdmin}
          onRoleChangeClick={handleOpenRoleModal}
          pagination={pagination}
          currentPage={page}
          limit={limit}
          onPageChange={handlePageChange}
        />

      </div>

      {/* Drawer: Detailed view */}
      <UserDetailDrawer 
        userId={selectedUserId}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedUserId(null);
        }}
        onLockClick={(userObj) => {
          setIsDrawerOpen(false);
          handleOpenLockModal(userObj);
        }}
        onUnlockClick={(userObj) => {
          setIsDrawerOpen(false);
          handleOpenUnlockModal(userObj);
        }}
        onRoleChangeClick={(userObj) => {
          setIsDrawerOpen(false);
          handleOpenRoleModal(userObj);
        }}
        currentAdminId={userInfo?.id}
        isCurrentUserSuperAdmin={userInfo?.isSuperAdmin}
        onPostClick={(postId) => {
          setSelectedPostId(postId);
          setIsPostDrawerOpen(true);
        }}
      />

      {/* Modal: Ban/Unban action */}
      <BanUserModal 
        user={modalUser}
        mode={modalMode}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalUser(null);
        }}
        onConfirm={handleConfirmStatusUpdate}
        isLoading={isUpdatingStatus}
      />

      {/* Modal: Confirm Role modification */}
      <ConfirmRoleModal
        user={roleModalUser}
        targetRole={roleModalTargetRole}
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setRoleModalUser(null);
        }}
        onConfirm={handleConfirmRoleUpdate}
        isLoading={isUpdatingRole}
      />

      {/* Drawer: Detailed view of post */}
      <PostDetailDrawer 
        postId={selectedPostId}
        isOpen={isPostDrawerOpen}
        onClose={() => {
          setIsPostDrawerOpen(false);
          setSelectedPostId(null);
        }}
      />
    </>
  );
}
