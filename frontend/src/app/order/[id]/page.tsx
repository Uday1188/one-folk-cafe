'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CheckCircle, Clock } from 'lucide-react';
import { STATUS_COLORS, STATUS_ICONS } from '@/lib/constants';

import * as React from 'react';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  
  // In a real app we might fetch the order details to get the actual estimatedTime
  const estimatedTime = 15; 

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 pt-16">
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", duration: 0.7 }}
        className="text-center max-w-md w-full">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-2xl shadow-green-500/30 mb-8">
          <CheckCircle className="w-14 h-14 text-white" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h1 className="text-3xl font-bold mb-2">Order Placed!</h1>
          <p className="text-muted-foreground mb-8">Your order is confirmed and the kitchen has been notified.</p>

          <div className="bg-card rounded-3xl p-6 border border-border mb-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Order ID</span>
              <span className="font-mono font-bold text-lg tracking-wider text-primary">{id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estimated Time</span>
              <span className="flex items-center gap-1.5 font-semibold text-accent">
                <Clock className="w-4 h-4" /> ~{estimatedTime} minutes
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusBadge status="pending" />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={() => router.push("/")}
              className="py-3.5 rounded-2xl bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition-colors">
              Back to Home
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
