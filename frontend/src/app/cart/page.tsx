'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingCart, Trash2, Plus, Minus, AlertCircle, CheckCircle } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { createOrder, fetchTables } from '@/lib/api';
import { OrderRequest } from '@/types';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, tableNumber, setTableNumber } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: tables = [], isLoading: isLoadingTables } = useQuery({
    queryKey: ['tables'],
    queryFn: fetchTables,
  });

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal;

  const handlePlaceOrder = async () => {
    if (!tableNumber || tableNumber.trim() === '') {
      toast.error('Please select your table to proceed.');
      return;
    }

    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      const orderRequest: OrderRequest = {
        tableNumber: tableNumber.trim(),
        items: items.map(item => ({
          productId: item.id as number,
          quantity: item.quantity,
        })),
      };

      const order = await createOrder(orderRequest);
      clearCart();
      toast.success('Order placed successfully! 🎉');
      router.push(`/order/${order.id}`);
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fmtPrice = (p: number) => `₹${p.toLocaleString("en-IN")}`;

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push("/menu")} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <h1 className="text-2xl font-bold">Your Cart</h1>
          {items.length > 0 && <span className="px-2.5 py-0.5 rounded-full bg-accent text-white text-sm font-bold">{items.reduce((s, i) => s + i.quantity, 0)}</span>}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-8">Explore our menu and add your favourite items</p>
            <button onClick={() => router.push("/menu")} className="px-8 py-3.5 rounded-2xl bg-accent text-white font-semibold hover:bg-accent/90 transition-colors">
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Items */}
            <div className="lg:col-span-3 space-y-3">
              {items.map(item => (
                <div key={item.id} className="bg-card rounded-2xl p-4 border border-border flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                    <img src={item.image || item.imageUrl || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=400&auto=format&fit=crop'} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm leading-tight">{item.name}</h4>
                    <span className="text-xs text-accent">{item.category || item.categoryName}</span>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
                        <button onClick={() => updateQuantity(item.id as number, item.quantity - 1)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-card transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id as number, item.quantity + 1)} className="w-6 h-6 rounded flex items-center justify-center bg-accent hover:bg-accent/90 transition-colors">
                          <Plus className="w-3 h-3 text-white" />
                        </button>
                      </div>
                      <span className="font-bold text-sm">{fmtPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id as number)} className="w-8 h-8 rounded-xl hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-3xl p-6 border border-border sticky top-32 shadow-xl shadow-black/5">
                <h3 className="font-bold text-lg mb-5">Order Summary</h3>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3">Select Your Table</label>
                  {isLoadingTables ? (
                    <div className="h-20 bg-secondary rounded-xl animate-pulse"></div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {tables.map((table) => (
                        <button
                          key={table.id}
                          onClick={() => setTableNumber(table.tableNumber)}
                          className={`py-2 px-1 rounded-xl text-sm font-bold border-2 transition-all ${
                            tableNumber === table.tableNumber
                              ? 'border-accent bg-accent text-white shadow-md shadow-accent/20'
                              : 'border-border bg-secondary hover:border-accent/50 text-foreground'
                          }`}
                        >
                          {table.tableNumber}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3 text-sm border-t border-border pt-4 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{fmtPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t border-border pt-3">
                    <span>Total</span>
                    <span className="text-primary text-lg">{fmtPrice(total)}</span>
                  </div>
                </div>

                <button
                  disabled={isSubmitting || !tableNumber || tableNumber.trim() === ''}
                  onClick={handlePlaceOrder}
                  className="w-full py-4 rounded-2xl bg-accent text-white font-bold text-base hover:bg-accent/90 transition-all hover:shadow-lg hover:shadow-accent/20 disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? "Processing..." : "Place Order 🎉"}
                </button>
                <button onClick={() => router.push("/menu")} className="w-full py-3 rounded-2xl text-sm text-muted-foreground hover:text-foreground transition-colors mt-2">
                  ← Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
