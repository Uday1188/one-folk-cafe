'use client';
import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X as XIcon, Calendar, Hash, ChevronDown, Check, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchOrders, updateOrderStatus, fetchTables, fetchOrderCounts, fetchOrderById } from '@/lib/api';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function AdminOrdersContent() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewId = searchParams.get('viewOrder');

  const [filter, setFilter] = useState<string>("all");
  const [tableFilter, setTableFilter] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("today");
  const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [viewOrder, setViewOrder] = useState<any | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const getDateFilter = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    if (timeRange === "today") {
      const year = now.getFullYear();
      const month = pad(now.getMonth() + 1);
      const day = pad(now.getDate());
      return { 
        computedStart: `${year}-${month}-${day}T00:00:00`,
        computedEnd: `${year}-${month}-${day}T23:59:59`
      };
    } else if (timeRange === "week") {
      const past = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      const startYear = past.getFullYear();
      const startMonth = pad(past.getMonth() + 1);
      const startDay = pad(past.getDate());
      const endYear = now.getFullYear();
      const endMonth = pad(now.getMonth() + 1);
      const endDay = pad(now.getDate());
      return {
        computedStart: `${startYear}-${startMonth}-${startDay}T00:00:00`,
        computedEnd: `${endYear}-${endMonth}-${endDay}T23:59:59`
      };
    } else if (timeRange === "month") {
      const year = now.getFullYear();
      const month = pad(now.getMonth() + 1);
      const lastDay = pad(new Date(year, now.getMonth() + 1, 0).getDate());
      return {
        computedStart: `${year}-${month}-01T00:00:00`,
        computedEnd: `${year}-${month}-${lastDay}T23:59:59`
      };
    } else if (timeRange === "custom") {
      return {
        computedStart: startDate ? `${startDate}T00:00:00` : undefined,
        computedEnd: endDate ? `${endDate}T23:59:59` : undefined
      };
    }
    return { computedStart: undefined, computedEnd: undefined };
  };

  const { computedStart, computedEnd } = getDateFilter();

  const { data: tables = [] } = useQuery({ queryKey: ['tables'], queryFn: fetchTables });
  const { data: counts = {} } = useQuery({ 
    queryKey: ['orderCounts', tableFilter, timeRange, startDate, endDate], 
    queryFn: () => fetchOrderCounts({
      tableNumber: tableFilter,
      startDate: computedStart,
      endDate: computedEnd
    })
  });

  const { data: orders = [], isLoading } = useQuery({ 
    queryKey: ['orders', filter, tableFilter, timeRange, startDate, endDate, page], 
    queryFn: () => fetchOrders({
      page: page,
      size: 10,
      status: filter,
      tableNumber: tableFilter,
      startDate: computedStart,
      endDate: computedEnd
    })
  });

  // Handle instant modal opening when notification is clicked (no website reload required!)
  useEffect(() => {
    if (viewId) {
      const idNum = Number(viewId);
      const cachedOrder = orders.find((o: any) => o.id === idNum);
      if (cachedOrder) {
        setViewOrder(cachedOrder);
      } else {
        // Automatically fetch order immediately if it's not present on current page
        fetchOrderById(idNum).then(order => {
          if (order) setViewOrder(order);
        }).catch(err => console.error("Could not load order from notification:", err));
      }
    }
  }, [viewId, orders]);

  const handleCloseModal = () => {
    setViewOrder(null);
    if (viewId) {
      router.replace('/admin/orders', { scroll: false });
    }
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orderCounts'] });
      toast.success('Order status updated!');
    },
    onError: () => {
      toast.error('Failed to update order status');
    }
  });

  const handleUpdateStatus = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
    if (viewOrder && viewOrder.id === id) {
      setViewOrder({ ...viewOrder, status });
    }
  };

  const fmtPrice = (p: number) => `₹${p.toLocaleString("en-IN")}`;
  
  const parseUTC = (str: string) => {
    if (!str) return new Date();
    const hasTimezone = /[Zz]|\+\d{2}:?\d{2}|-\d{2}:?\d{2}$/.test(str);
    const cleanStr = hasTimezone ? str : str + 'Z';
    const parsed = new Date(cleanStr);
    return isNaN(parsed.getTime()) ? new Date(str) : parsed;
  };
  const timeSince = (isoString: string): string => {
    const diff = Math.max(0, Date.now() - parseUTC(isoString).getTime());
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };
  const fmtTime = (isoString: string) => {
    const d = parseUTC(isoString);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };
  const fmtDate = (isoString: string) => {
    const d = parseUTC(isoString);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">{counts['ALL'] || 0} total orders</p>
        </div>
        <Link href="/admin/orders/new" className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
          + New Order
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-3.5 shadow-sm">
        {/* Row 1: Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          {(["all", "pending", "completed", "cancelled"]).map(s => {
            const count = counts[s === 'all' ? 'ALL' : s.toUpperCase()] || 0;
            return (
              <button key={s} onClick={() => { setFilter(s); setPage(0); }}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold capitalize transition-all ${filter === s ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                {s}
                <span className="ml-1.5 opacity-80 font-mono">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Row 2: Time Range & Table Selector */}
        <div className="space-y-3 pt-3 border-t border-border/50">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Time Range Selector */}
            <div className="flex items-center gap-1 bg-secondary/70 p-1 rounded-xl border border-border overflow-x-auto scrollbar-hide">
              {[
                { id: "today", label: "Today" },
                { id: "week", label: "Weekly" },
                { id: "month", label: "Monthly" },
                { id: "all", label: "All Time" },
                { id: "custom", label: "Custom" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTimeRange(t.id); setPage(0); }}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-center whitespace-nowrap ${
                    timeRange === t.id ? "bg-card text-foreground shadow-sm border border-border/80 text-accent" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Table Dropdown */}
            <div className="relative w-full sm:w-auto">
              <button 
                onClick={() => setIsTableDropdownOpen(!isTableDropdownOpen)}
                className="w-full flex items-center justify-between gap-2 px-3.5 py-2 bg-secondary border border-border rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-accent outline-none font-semibold hover:bg-secondary/80 transition-colors"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <span>{tableFilter === 'all' ? 'All Tables' : `Table ${tableFilter}`}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              <AnimatePresence>
                {isTableDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsTableDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 sm:right-auto sm:w-48 mt-2 bg-card rounded-2xl border border-border shadow-xl z-50 overflow-hidden py-2"
                    >
                      <div className="max-h-[250px] overflow-y-auto scrollbar-hide">
                        <button
                          onClick={() => { setTableFilter("all"); setIsTableDropdownOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary/60 ${tableFilter === "all" ? "text-accent bg-accent/5" : "text-foreground"}`}
                        >
                          All Tables
                        </button>
                        {tables.map(t => (
                          <button
                            key={t.id}
                            onClick={() => { setTableFilter(t.tableNumber); setIsTableDropdownOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary/60 ${tableFilter === t.tableNumber ? "text-accent bg-accent/5" : "text-foreground"}`}
                          >
                            Table {t.tableNumber}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Custom Date Range Picker Container */}
          {timeRange === "custom" && (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-secondary/50 rounded-xl border border-border mt-2 animate-in fade-in zoom-in-95 duration-200">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">From Date</label>
                <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-lg border border-border">
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
                    className="w-full bg-transparent text-xs font-semibold outline-none text-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">To Date</label>
                <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-lg border border-border">
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
                    className="w-full bg-transparent text-xs font-semibold outline-none text-foreground"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm">
        <div className="overflow-x-auto rounded-t-2xl pb-24 -mb-24">
          <table className="w-full text-sm min-w-[700px]">
            <thead><tr className="bg-secondary/50 text-left">
              {["Order ID", "Table", "Items", "Total", "Status", "Date & Time", "Actions"].map(h => (
                <th key={h} className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">Loading orders...</td></tr>
              ) : orders.map((o: any) => (
                <tr key={o.id} onClick={() => setViewOrder(o)} className="hover:bg-secondary/20 transition-colors cursor-pointer">
                  <td className="px-5 py-4 font-mono font-bold text-xs text-primary">{o.id}</td>
                  <td className="px-5 py-4 font-bold text-accent">{o.tableNumber || 'Walk-in'}</td>
                  <td className="px-5 py-4 text-muted-foreground">{o.items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0} items</td>
                  <td className="px-5 py-4 font-bold text-primary">{fmtPrice(o.totalAmount || o.total)}</td>
                  <td className="px-5 py-4"><StatusBadge status={o.status} /></td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-semibold">{fmtDate(o.createdAt)}</div>
                    <div className="text-xs text-muted-foreground">{timeSince(o.createdAt)}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setViewOrder(o)} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-accent/10 text-muted-foreground hover:text-accent transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === o.id ? null : o.id);
                          }}
                          className="flex items-center justify-between gap-2 text-xs font-semibold bg-secondary hover:bg-secondary/80 border border-border rounded-lg px-2.5 py-1.5 transition-colors min-w-[100px]"
                        >
                          <span className="capitalize">{o.status.toLowerCase()}</span>
                          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        
                        <AnimatePresence>
                          {openDropdownId === o.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); }} />
                              <motion.div
                                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-full mt-1 w-36 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden py-1.5"
                              >
                                {(["pending", "completed", "cancelled"]).map(s => (
                                  <button
                                    key={s}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateStatus(o.id, s.toUpperCase());
                                      setOpenDropdownId(null);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors ${o.status.toLowerCase() === s ? "text-accent bg-accent/10" : "text-foreground hover:bg-secondary"}`}
                                  >
                                    <span className="capitalize">{s}</span>
                                    {o.status.toLowerCase() === s && <Check className="w-3 h-3" />}
                                  </button>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && !isLoading && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-secondary/10">
          <button 
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-secondary hover:bg-secondary/80 disabled:opacity-50 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-muted-foreground">Page {page + 1}</span>
          <button 
            onClick={() => setPage(p => p + 1)}
            disabled={orders.length < 10}
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-secondary hover:bg-secondary/80 disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {viewOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-card rounded-3xl border border-border w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-secondary/30">
                <h3 className="font-bold flex items-center gap-2">Order <span className="font-mono text-primary text-sm bg-primary/10 px-2 py-1 rounded-md">{viewOrder.id}</span></h3>
                <button onClick={handleCloseModal} className="w-8 h-8 rounded-xl hover:bg-secondary flex items-center justify-center">
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-lg">{viewOrder.customer?.name || 'Walk-in Customer'}</div>
                    <div className="text-sm font-bold text-accent mt-0.5">{viewOrder.tableNumber && viewOrder.tableNumber !== 'Walk-in' ? `Table: ${viewOrder.tableNumber}` : 'Walk-in / Takeaway'}</div>
                  </div>
                  <StatusBadge status={viewOrder.status} />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-secondary/50 rounded-xl p-3 border border-border/50">
                    <div className="text-xs text-muted-foreground">Order Date</div>
                    <div className="font-bold mt-0.5">{fmtDate(viewOrder.createdAt)}</div>
                  </div>
                  <div className="bg-secondary/50 rounded-xl p-3 border border-border/50">
                    <div className="text-xs text-muted-foreground">Time</div>
                    <div className="font-bold mt-0.5">{fmtTime(viewOrder.createdAt)}</div>
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Items ({viewOrder.items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0})</h5>
                  <div className="space-y-3 bg-secondary/20 p-4 rounded-xl border border-border/50">
                    {viewOrder.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.productName || item.product?.name} <span className="text-muted-foreground text-xs ml-1">×{item.quantity}</span></span>
                        <span className="font-semibold">{fmtPrice((item.price || item.product?.price || 0) * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="border-t border-border/60 pt-3 mt-1 flex justify-between font-bold text-base">
                      <span>Total</span>
                      <span className="text-primary">{fmtPrice(viewOrder.totalAmount || viewOrder.total)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Update Status</h5>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {(["pending", "completed", "cancelled"]).map(s => (
                      <button key={s} onClick={() => handleUpdateStatus(viewOrder.id, s.toUpperCase())}
                        className={`py-2.5 rounded-xl text-xs font-semibold capitalize transition-all border ${viewOrder.status.toLowerCase() === s ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-secondary/50 hover:bg-secondary border-border"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                  
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 border-t border-border pt-4">Modify Order</h5>
                  <Link href={`/admin/orders/${viewOrder.id}`}
                    className="flex items-center justify-center w-full py-2.5 bg-accent/10 text-accent font-semibold rounded-xl text-sm hover:bg-accent/20 transition-colors border border-accent/20">
                    Edit Items / Table
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminOrders() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground font-semibold animate-pulse">Loading orders...</div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}
