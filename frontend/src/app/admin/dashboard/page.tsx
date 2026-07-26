'use client';
import { useState } from 'react';
import { DollarSign, ShoppingBag, Clock, CheckCircle, XCircle } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardMetrics } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "#22c55e",
  PENDING: "#eab308",
  CANCELLED: "#ef4444"
};

export default function AdminDashboard() {
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState<'today'|'weekly'|'monthly'>('today');
  
  const { data: metrics, isLoading: isMetricsLoading } = useQuery({ 
    queryKey: ['dashboardMetrics', timeFilter], 
    queryFn: () => fetchDashboardMetrics(timeFilter) 
  });
  
  const orders = metrics?.recentOrders || [];
  const isOrdersLoading = isMetricsLoading;

  const fmtPrice = (p: number) => `₹${p?.toLocaleString("en-IN") || 0}`;
  const parseUTC = (str: string) => {
    if (!str) return new Date();
    const hasTimezone = /[Zz]|\+\d{2}:?\d{2}|-\d{2}:?\d{2}$/.test(str);
    const cleanStr = hasTimezone ? str : str + 'Z';
    const parsed = new Date(cleanStr);
    return isNaN(parsed.getTime()) ? new Date(str) : parsed;
  };

  const timeSince = (isoString: string): string => {
    if (!isoString) return "";
    const diff = Math.max(0, Date.now() - parseUTC(isoString).getTime());
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  const stats = [
    { 
      label: timeFilter === 'today' ? "Today's Revenue" : timeFilter === 'weekly' ? "Weekly Revenue" : "Monthly Revenue", 
      value: fmtPrice(metrics?.totalSales ?? metrics?.todaysSales ?? 0), 
      icon: <DollarSign className="w-5 h-5" />, 
      color: "text-green-600", 
      bg: "bg-green-50 dark:bg-green-900/20" 
    },
    { 
      label: timeFilter === 'today' ? "Today's Orders" : timeFilter === 'weekly' ? "Weekly Orders" : "Monthly Orders", 
      value: (metrics?.totalOrders ?? metrics?.todaysOrders ?? 0).toString(), 
      icon: <ShoppingBag className="w-5 h-5" />, 
      color: "text-blue-600", 
      bg: "bg-blue-50 dark:bg-blue-900/20" 
    },
    { label: "Pending", value: (metrics?.pendingOrdersCount || 0).toString(), icon: <Clock className="w-5 h-5" />, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
    { label: "Completed", value: (metrics?.completedOrdersCount || 0).toString(), icon: <CheckCircle className="w-5 h-5" />, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
    { label: "Cancelled", value: (metrics?.cancelledOrdersCount || 0).toString(), icon: <XCircle className="w-5 h-5" />, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
  ];

  const pieData = (metrics?.orderStatusPieData || []).map((d: any) => ({
    ...d,
    color: STATUS_COLORS[d.name] || "#6b7280"
  }));

  const revenueData = metrics?.revenueChartData || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome back! Here's what's happening at One Folk Cafe.</p>
        </div>
        
        {/* Time Filter Toggle */}
        <div className="flex bg-secondary p-1 rounded-xl">
          {(['today', 'weekly', 'monthly'] as const).map(f => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg capitalize transition-colors ${timeFilter === f ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card rounded-2xl p-5 border border-border">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center ${s.color} mb-3`}>{s.icon}</div>
            <div className="text-2xl font-black text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border">
          <h3 className="font-bold mb-1 capitalize">{timeFilter} Revenue</h3>
          <p className="text-xs text-muted-foreground mb-5">Revenue trend based on completed orders</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C8813A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C8813A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: any) => v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : `₹${v}`} />
              <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#C8813A" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="font-bold mb-1">Order Status</h3>
          <p className="text-xs text-muted-foreground mb-5 capitalize">Breakdown for {timeFilter} range</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {pieData.map((entry: any, i: number) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: any, n: any) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {pieData.map((d: any) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground capitalize">{d.name?.toLowerCase() || "unknown"}</span>
                </div>
                <span className="font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-bold">Recent Orders ({timeFilter})</h3>
          <button onClick={() => router.push("/admin/orders")} className="text-xs text-accent font-semibold hover:underline">View all →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Order ID</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isOrdersLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading...</td>
                </tr>
              ) : orders.slice(0, 5).map((o: any) => (
                <tr key={o.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium">#{o.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{o.customer?.name || 'Walk-in Customer'}</div>
                  </td>
                  <td className="px-6 py-4 font-medium">{fmtPrice(o.totalAmount || o.total || 0)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider ${
                      o.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      o.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      o.status === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">{timeSince(o.createdAt)}</td>
                </tr>
              ))}
              {orders.length === 0 && !isOrdersLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No orders in selected date range.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

