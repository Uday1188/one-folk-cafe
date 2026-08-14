'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTopProductsByRevenue } from '@/lib/api';

export default function AdminAnalytics() {
  const [timeFilter, setTimeFilter] = useState<'today'|'weekly'|'monthly'>('today');

  const { data: topProducts = [], isLoading } = useQuery({ 
    queryKey: ['topProductsByRevenue', timeFilter], 
    queryFn: () => fetchTopProductsByRevenue(timeFilter) 
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Analytics</h1>
        
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

      {/* Top Products Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-bold">Top Products by Revenue</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-muted/30">
              {["Rank", "Product", "Orders", "Revenue"].map(h => (
                <th key={h} className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">Loading...</td>
                </tr>
              ) : topProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">No data available for this time range.</td>
                </tr>
              ) : (
                topProducts.map((d: any, i: number) => (
                  <tr key={d.product} className="hover:bg-muted/20">
                    <td className="px-5 py-4 font-mono font-bold text-muted-foreground">#{i + 1}</td>
                    <td className="px-5 py-4 font-semibold">{d.product}</td>
                    <td className="px-5 py-4">{d.orders}</td>
                    <td className="px-5 py-4 font-bold text-primary">₹{d.revenue?.toLocaleString("en-IN") || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
