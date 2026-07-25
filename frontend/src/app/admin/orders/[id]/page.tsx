'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, Plus, Minus, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchOrderById, createOrder, updateOrder, fetchProducts } from '@/lib/api';
import { OrderRequest, Product } from '@/types';
import * as React from 'react';
import { toast } from 'sonner';

export default function AdminOrderForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const isNew = id === 'new';

  const [tableNumber, setTableNumber] = useState('');
  const [items, setItems] = useState<{ product: Product; quantity: number }[]>([]);
  const [search, setSearch] = useState('');

  // Fetch products for the menu picker
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  // Fetch existing order if not new
  const { data: existingOrder, isLoading: isLoadingOrder } = useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrderById(Number(id)),
    enabled: !isNew,
  });

  useEffect(() => {
    if (existingOrder && products.length > 0) {
      setTableNumber(existingOrder.tableNumber || '');
      const mappedItems = existingOrder.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          product: product || { id: item.productId, name: item.productName, price: item.price } as any,
          quantity: item.quantity,
        };
      });
      setItems(mappedItems);
    }
  }, [existingOrder, products]);

  const saveMutation = useMutation({
    mutationFn: (orderReq: OrderRequest) => {
      if (isNew) return createOrder(orderReq);
      return updateOrder(Number(id), orderReq);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(`Order ${isNew ? 'created' : 'updated'} successfully!`);
      router.push('/admin/orders');
    },
    onError: () => toast.error('Failed to save order.'),
  });

  const handleSave = () => {
    if (items.length === 0) {
      toast.error('Add at least one item to the order.');
      return;
    }

    saveMutation.mutate({
      tableNumber: tableNumber.trim() || "Walk-in",
      items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
    });
  };

  const addItem = (product: Product) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, qty: number) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.product.id !== productId));
      return;
    }
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const subtotal = items.reduce((s, i) => s + (i.product.price * i.quantity), 0);
  const fmtPrice = (p: number) => `₹${p.toLocaleString("en-IN")}`;

  if (!isNew && isLoadingOrder) return <div className="p-8 text-center">Loading order...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/admin/orders")} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <h1 className="text-2xl font-bold">{isNew ? 'New Order' : `Edit Order #${id}`}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Menu Picker (Left) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-card rounded-2xl p-4 border border-border">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search menu..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-secondary/50 focus:bg-background focus:ring-2 focus:ring-accent outline-none transition-all"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
              {isLoadingProducts ? (
                <div className="col-span-full py-12 text-center text-muted-foreground">Loading menu...</div>
              ) : filteredProducts.map(p => (
                <div key={p.id} onClick={() => addItem(p)} className="bg-secondary/30 border border-border/50 rounded-xl p-3 cursor-pointer hover:border-accent hover:bg-accent/5 transition-all">
                  <div className="aspect-square bg-secondary rounded-lg mb-2 overflow-hidden">
                    <img src={p.imageUrl || p.image || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=400&auto=format&fit=crop'} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-semibold text-xs leading-tight line-clamp-2 mb-1">{p.name}</h4>
                  <p className="text-accent font-bold text-sm">{fmtPrice(p.price)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Ticket (Right) */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-3xl p-6 border border-border sticky top-24">
            <h3 className="font-bold text-lg mb-4">Order Ticket</h3>

            <div className="mb-5">
              <label className="block text-sm font-semibold mb-2">Table No <span className="text-xs font-normal text-muted-foreground">(Optional - defaults to Walk-in)</span></label>
              <input
                type="text"
                placeholder="e.g. 5 or leave blank for walk-in"
                value={tableNumber}
                onChange={e => setTableNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent outline-none"
              />
            </div>

            <div className="space-y-3 mb-5 max-h-[300px] overflow-y-auto pr-2">
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No items added yet.</div>
              ) : items.map(item => (
                <div key={item.product.id} className="flex gap-3 bg-secondary/20 p-2.5 rounded-xl border border-border/50">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm leading-tight truncate">{item.product.name}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 bg-secondary rounded-lg p-0.5">
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-card">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-4 text-center text-xs font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-6 h-6 rounded flex items-center justify-center bg-accent text-white hover:bg-accent/90">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-bold text-sm">{fmtPrice(item.product.price * item.quantity)}</span>
                    </div>
                  </div>
                  <button onClick={() => updateQuantity(item.product.id, 0)} className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 mb-5">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{fmtPrice(subtotal)}</span>
              </div>
            </div>

            <button
              disabled={saveMutation.isPending}
              onClick={handleSave}
              className="w-full py-3.5 rounded-2xl bg-accent text-white font-bold text-base hover:bg-accent/90 transition-all hover:shadow-lg disabled:opacity-70">
              {saveMutation.isPending ? "Saving..." : "Save Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
