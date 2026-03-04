"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import api from "../../../utils/api";
import toast from "react-hot-toast";
import {
  Users, Search, ShieldCheck, ShieldX, ShieldAlert,
  ArrowLeft, Eye, MoreVertical, CheckCircle, XCircle,
  Clock, RefreshCw, Crown, UserX, UserCheck, Trash2,
  ChevronLeft, ChevronRight, Filter, X,
} from "lucide-react";

const KYC_CONFIG = {
  approved:      { label: "Verified",      color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  pending:       { label: "Pending",        color: "text-amber-400",   bg: "bg-amber-500/10  border-amber-500/20"  },
  rejected:      { label: "Rejected",       color: "text-red-400",     bg: "bg-red-500/10    border-red-500/20"    },
  resubmit:      { label: "Resubmit",       color: "text-orange-400",  bg: "bg-orange-500/10 border-orange-500/20" },
  not_submitted: { label: "Not Submitted",  color: "text-white/30",    bg: "bg-white/5       border-white/10"      },
};

function KycBadge({ status }) {
  const cfg = KYC_CONFIG[status] || KYC_CONFIG.not_submitted;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color} ${cfg.bg}`}>
      {cfg.label}
    </span>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters]     = useState({ suspended: "", is_admin: "", kyc_status: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [page, setPage]           = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [menuOpen, setMenuOpen]   = useState(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, filters]);
  useEffect(() => { fetchUsers(); }, [page, debouncedSearch, filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, per_page: 20 });
      if (debouncedSearch)       params.set("search", debouncedSearch);
      if (filters.suspended)     params.set("suspended", filters.suspended);
      if (filters.is_admin)      params.set("is_admin", filters.is_admin);
      if (filters.kyc_status)    params.set("kyc_status", filters.kyc_status);

      const res = await api.get(`/admin/users?${params}`);
      const d   = res.data.data;
      setUsers(d.data ?? d ?? []);
      setPagination({
        current_page: d.current_page ?? 1,
        last_page:    d.last_page    ?? 1,
        total:        d.total        ?? (d.length ?? 0),
      });
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const viewUser = async (userId) => {
    try {
      const res = await api.get(`/admin/users/${userId}`);
      setSelectedUser(res.data.data);
      setShowModal(true);
      setMenuOpen(null);
    } catch {
      toast.error("Failed to load user details");
    }
  };

  const closeModal = () => { setShowModal(false); setSelectedUser(null); };

  const doAction = async (action, user, confirmMsg) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setActionLoading(action);
    try {
      const endpoints = {
        suspend:      `/admin/users/${user.id}/suspend`,
        unsuspend:    `/admin/users/${user.id}/unsuspend`,
        makeAdmin:    `/admin/users/${user.id}/make-admin`,
        removeAdmin:  `/admin/users/${user.id}/remove-admin`,
        delete:       `/admin/users/${user.id}`,
      };
      const method = action === "delete" ? "delete" : "patch";
      const res = await api[method](endpoints[action]);
      toast.success(res.data.message);
      setMenuOpen(null);
      if (showModal) closeModal();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const clearFilters = () => {
    setFilters({ suspended: "", is_admin: "", kyc_status: "" });
    setSearch("");
  };

  const hasActiveFilters = filters.suspended || filters.is_admin || filters.kyc_status || debouncedSearch;

  return (
    <div className="min-h-screen bg-[#0D1F1A] relative"
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #06B6D4 0%, transparent 70%)" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors mb-6">
          <ArrowLeft size={13} /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-cyan-400 mb-2">Admin Panel</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              User Management
            </h1>
            <p className="text-white/40 mt-1 text-sm">
              {pagination.total} total users
            </p>
          </div>
        </div>

        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or UID..."
              className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-white/20 pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                <X size={14} />
              </button>
            )}
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
              showFilters || hasActiveFilters
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20"
            }`}>
            <Filter size={15} />
            Filters
            {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
          </button>
          {hasActiveFilters && (
            <button onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white/40 hover:text-white/70 text-sm transition-all">
              <X size={14} /> Clear
            </button>
          )}
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 p-4 rounded-xl border border-white/10 bg-white/3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Status</label>
              <select value={filters.suspended}
                onChange={(e) => setFilters({ ...filters, suspended: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:border-cyan-500/40">
                <option value="" className="bg-[#0D1F1A]">All Users</option>
                <option value="true"  className="bg-[#0D1F1A]">Suspended</option>
                <option value="false" className="bg-[#0D1F1A]">Active</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Role</label>
              <select value={filters.is_admin}
                onChange={(e) => setFilters({ ...filters, is_admin: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:border-cyan-500/40">
                <option value=""      className="bg-[#0D1F1A]">All Roles</option>
                <option value="true"  className="bg-[#0D1F1A]">Admins Only</option>
                <option value="false" className="bg-[#0D1F1A]">Regular Users</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-white/30 mb-2">KYC Status</label>
              <select value={filters.kyc_status}
                onChange={(e) => setFilters({ ...filters, kyc_status: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:border-cyan-500/40">
                <option value=""             className="bg-[#0D1F1A]">All</option>
                <option value="not_submitted" className="bg-[#0D1F1A]">Not Submitted</option>
                <option value="pending"      className="bg-[#0D1F1A]">Pending</option>
                <option value="approved"     className="bg-[#0D1F1A]">Approved</option>
                <option value="rejected"     className="bg-[#0D1F1A]">Rejected</option>
                <option value="resubmit"     className="bg-[#0D1F1A]">Resubmit</option>
              </select>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-24 border border-white/10 rounded-2xl">
            <Users size={40} className="mx-auto mb-4 text-white/10" />
            <p className="text-white/30">No users found</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block rounded-2xl border border-white/10 bg-white/5 overflow-hidden mb-5">
              <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_48px] gap-4 px-6 py-3 border-b border-white/10 bg-white/5">
                {["User", "UID", "KYC", "Balance", "Joined", ""].map((h) => (
                  <span key={h} className="text-xs font-bold uppercase tracking-widest text-white/30">{h}</span>
                ))}
              </div>
              {users.map((user, i) => {
                const kycStatus = user.kyc_verification?.status ?? "not_submitted";
                return (
                  <div key={user.id}
                    className={`grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_48px] gap-4 px-6 py-4 items-center hover:bg-white/5 transition-colors ${
                      i < users.length - 1 ? "border-b border-white/5" : ""
                    }`}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                        {user.is_admin && <Crown size={11} className="text-amber-400 shrink-0" />}
                        {user.is_suspended && <UserX size={11} className="text-red-400 shrink-0" />}
                      </div>
                      <p className="text-xs text-white/30 truncate">{user.email}</p>
                    </div>
                    <p className="text-xs font-mono text-white/40">{user.uid}</p>
                    <KycBadge status={kycStatus} />
                    <p className="text-sm text-white/70">
                      ₦{((user.balance_kobo ?? 0) / 100).toLocaleString()}
                    </p>
                    <p className="text-xs text-white/30">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                    {/* Actions menu */}
                    <div className="relative">
                      <button onClick={() => setMenuOpen(menuOpen === user.id ? null : user.id)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
                        <MoreVertical size={14} />
                      </button>
                      {menuOpen === user.id && (
                        <UserMenu user={user} onView={() => viewUser(user.id)} onAction={doAction}
                          actionLoading={actionLoading} onClose={() => setMenuOpen(null)} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3 mb-5">
              {users.map((user) => {
                const kycStatus = user.kyc_verification?.status ?? "not_submitted";
                return (
                  <div key={user.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-bold text-white truncate">{user.name}</p>
                          {user.is_admin && <Crown size={11} className="text-amber-400" />}
                          {user.is_suspended && (
                            <span className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-full font-bold">
                              Suspended
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/30 truncate">{user.email}</p>
                        <p className="text-[10px] font-mono text-white/20 mt-0.5">{user.uid}</p>
                      </div>
                      <div className="relative">
                        <button onClick={() => setMenuOpen(menuOpen === user.id ? null : user.id)}
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40">
                          <MoreVertical size={14} />
                        </button>
                        {menuOpen === user.id && (
                          <UserMenu user={user} onView={() => viewUser(user.id)} onAction={doAction}
                            actionLoading={actionLoading} onClose={() => setMenuOpen(null)} />
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-[10px] text-white/30 mb-0.5">KYC</p>
                        <KycBadge status={kycStatus} />
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-[10px] text-white/30 mb-0.5">Balance</p>
                        <p className="text-xs font-bold text-white">₦{((user.balance_kobo ?? 0) / 100).toLocaleString()}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-[10px] text-white/30 mb-0.5">Joined</p>
                        <p className="text-xs text-white/60">{new Date(user.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/30">
                  Page {pagination.current_page} of {pagination.last_page}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={pagination.current_page === 1}
                    className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                    <ChevronLeft size={15} />
                  </button>
                  <button onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                    disabled={pagination.current_page === pagination.last_page}
                    className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Click outside to close menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(null)} />
      )}

      {/* User Detail Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="relative w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-white/10 bg-[#0f2820] shadow-2xl">

            <div className="flex items-start justify-between p-4 sm:p-6 border-b border-white/10 sticky top-0 bg-[#0f2820] z-10">
              <div className="min-w-0 flex-1 pr-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-white"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {selectedUser.name}
                  </h2>
                  {selectedUser.is_admin && <Crown size={14} className="text-amber-400" />}
                  {selectedUser.is_suspended && (
                    <span className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-full font-bold">
                      Suspended
                    </span>
                  )}
                </div>
                <p className="text-white/40 text-xs sm:text-sm mt-0.5 truncate">{selectedUser.email}</p>
              </div>
              <button onClick={closeModal}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all shrink-0">
                <X size={16} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-5">

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {[
                  { label: "Balance",     value: `₦${((selectedUser.balance_kobo ?? 0) / 100).toLocaleString()}` },
                  { label: "Rewards",     value: `₦${((selectedUser.rewards_balance_kobo ?? 0) / 100).toLocaleString()}` },
                  { label: "Lands Owned", value: selectedUser.total_lands ?? 0 },
                  { label: "Units Owned", value: selectedUser.total_units_owned ?? 0 },
                ].map((s) => (
                  <div key={s.label} className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{s.label}</p>
                    <p className="text-sm font-bold text-white">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {[
                  { label: "UID",        value: selectedUser.uid },
                  { label: "KYC Status", value: <KycBadge status={selectedUser.kyc_status ?? "not_submitted"} /> },
                  { label: "Joined",     value: new Date(selectedUser.created_at).toLocaleString("en-NG", { dateStyle: "medium" }) },
                  { label: "Bank",       value: selectedUser.bank_name ? `${selectedUser.bank_name} — ${selectedUser.account_number}` : "Not set" },
                ].map((item) => (
                  <div key={item.label} className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{item.label}</p>
                    <div className="text-sm font-semibold text-white">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              {!selectedUser.is_admin && (
                <div className="space-y-3 pt-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30">Actions</p>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedUser.is_suspended ? (
                      <button onClick={() => doAction("unsuspend", selectedUser)}
                        disabled={!!actionLoading}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all disabled:opacity-50">
                        {actionLoading === "unsuspend"
                          ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <UserCheck size={15} />}
                        Unsuspend
                      </button>
                    ) : (
                      <button onClick={() => doAction("suspend", selectedUser, `Suspend ${selectedUser.name}?`)}
                        disabled={!!actionLoading}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 transition-all disabled:opacity-50">
                        {actionLoading === "suspend"
                          ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <UserX size={15} />}
                        Suspend
                      </button>
                    )}
                    <button onClick={() => doAction("makeAdmin", selectedUser, `Make ${selectedUser.name} an admin?`)}
                      disabled={!!actionLoading}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition-all disabled:opacity-50">
                      {actionLoading === "makeAdmin"
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <Crown size={15} />}
                      Make Admin
                    </button>
                  </div>
                  <button onClick={() => doAction("delete", selectedUser, `Permanently delete ${selectedUser.name}? This cannot be undone.`)}
                    disabled={!!actionLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-all disabled:opacity-50">
                    {actionLoading === "delete"
                      ? <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                      : <Trash2 size={15} />}
                    Delete Account
                  </button>
                </div>
              )}

              {selectedUser.is_admin && (
                <button onClick={() => doAction("removeAdmin", selectedUser, `Remove admin privileges from ${selectedUser.name}?`)}
                  disabled={!!actionLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 transition-all disabled:opacity-50">
                  {actionLoading === "removeAdmin"
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <ShieldX size={15} />}
                  Remove Admin Privileges
                </button>
              )}

              <div className="h-2 sm:h-0" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Dropdown menu component ────────────────────────────────────────────────
function UserMenu({ user, onView, onAction, actionLoading, onClose }) {
  return (
    <div className="absolute right-0 top-10 w-48 rounded-xl border border-white/10 bg-[#0f2820] shadow-2xl z-30 overflow-hidden py-1">
      <button onClick={onView}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors text-left">
        <Eye size={14} /> View Details
      </button>
      {!user.is_admin && (
        <>
          {user.is_suspended ? (
            <button onClick={() => { onAction("unsuspend", user); onClose(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-emerald-400 hover:bg-white/5 transition-colors text-left">
              <UserCheck size={14} /> Unsuspend
            </button>
          ) : (
            <button onClick={() => { onAction("suspend", user, `Suspend ${user.name}?`); onClose(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-400 hover:bg-white/5 transition-colors text-left">
              <UserX size={14} /> Suspend
            </button>
          )}
          <button onClick={() => { onAction("makeAdmin", user, `Make ${user.name} an admin?`); onClose(); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-purple-400 hover:bg-white/5 transition-colors text-left">
            <Crown size={14} /> Make Admin
          </button>
          <div className="h-px bg-white/10 my-1" />
          <button onClick={() => { onAction("delete", user, `Permanently delete ${user.name}?`); onClose(); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors text-left">
            <Trash2 size={14} /> Delete
          </button>
        </>
      )}
      {user.is_admin && (
        <button onClick={() => { onAction("removeAdmin", user, `Remove admin from ${user.name}?`); onClose(); }}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-orange-400 hover:bg-white/5 transition-colors text-left">
          <ShieldX size={14} /> Remove Admin
        </button>
      )}
    </div>
  );
}