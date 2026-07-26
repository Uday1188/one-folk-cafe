'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, Plus, Minus, Search, ShoppingBag, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchOrderById, createOrder, updateOrder, fetchProducts, fetchCategories } from '@/lib/api';
import { OrderRequest, Product } from '@/types';
import { resolveImageUrl } from '@/lib/utils';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isMobileTicketOpen, setIsMobileTicketOpen] = useState(false);

  // Fetch products & categories for the menu picker
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
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
      queryClient.invalidateQueries({ queryKey: ['orderCounts'] });
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
    toast.success(`Added ${product.name}`, { duration: 1500 });
  };

  const updateQuantity = (productId: number, qty: number) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.product.id !== productId));
      return;
    }
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      (p.category || p.categoryName || '').toLowerCase() === selectedCategory.toLowerCase() ||
      (p.categoryId && String(p.categoryId) === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const totalItemCount = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + (i.product.price * i.quantity), 0);
  const fmtPrice = (p: number) => `₹${p.toLocaleString("en-IN")}`;

  if (!isNew && isLoadingOrder) return <div className="p-8 text-center">Loading order...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl pb-24 lg:pb-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/admin/orders")} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{isNew ? 'New Order' : `Edit Order #${id}`}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Select menu items and save order ticket</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Menu Picker (Left 3 Columns) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-card rounded-2xl p-4 border border-border space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-secondary/50 focus:bg-background focus:ring-2 focus:ring-accent outline-none text-sm transition-all"
              />
            </div>

            {/* Category Filter Pills Bar */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-accent text-white shadow-sm'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                All Menu ({products.length})
              </button>
              {categories.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.name || String(c.id))}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory.toLowerCase() === (c.name || '').toLowerCase() || selectedCategory === String(c.id)
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[580px] overflow-y-auto pr-1 scrollbar-hide">
              {isLoadingProducts ? (
                <div className="col-span-full py-12 text-center text-muted-foreground">Loading menu...</div>
              ) : filteredProducts.map(p => (
                <div key={p.id} onClick={() => addItem(p)} className="bg-secondary/30 border border-border/60 rounded-2xl p-3 cursor-pointer hover:border-accent hover:bg-accent/5 transition-all flex flex-col justify-between group active:scale-95">
                  <div>
                    <div className="aspect-square bg-secondary rounded-xl mb-2 overflow-hidden relative">
                      <img 
                        src={resolveImageUrl(p.imageUrl || p.image) || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=400&auto=format&fit=crop'} 
                        alt={p.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                    <h4 className="font-semibold text-xs leading-tight line-clamp-2 mb-1">{p.name}</h4>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/40">
                    <p className="text-accent font-extrabold text-sm">{fmtPrice(p.price)}</p>
                    <span className="w-6 h-6 rounded-lg bg-accent/10 text-accent flex items-center justify-center font-bold text-xs group-hover:bg-accent group-hover:text-white transition-colors">
                      +
                    </span>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && !isLoadingProducts && (
                <div className="col-span-full py-12 text-center text-muted-foreground text-sm">
                  No menu items match your search or filter.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Ticket (Desktop Right Panel - lg:block) */}
        <div className="hidden lg:block lg:col-span-2">
          <div className="bg-card rounded-3xl p-6 border border-border sticky top-24 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-accent" /> Order Ticket
              </h3>
              <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg">
                {totalItemCount} {totalItemCount === 1 ? 'Item' : 'Items'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Table No <span className="font-normal text-muted-foreground/80">(Optional - defaults to Walk-in)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 5 or leave blank for walk-in"
                value={tableNumber}
                onChange={e => setTableNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent outline-none text-sm"
              />
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {items.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed border-border/60 rounded-2xl">
                  No items added yet.<br />Tap any item on the left to add.
                </div>
              ) : items.map(item => (
                <div key={item.product.id} className="flex items-center justify-between gap-3 bg-secondary/30 p-3 rounded-2xl border border-border/50">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs leading-tight truncate">{item.product.name}</h4>
                    <div className="text-xs text-accent font-bold mt-0.5">{fmtPrice(item.product.price * item.quantity)}</div>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary border border-border rounded-xl p-1">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-card">
                      <Minus className="w-3 h-3 text-muted-foreground" />
                    </button>
                    <span className="w-4 text-center text-xs font-extrabold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-6 h-6 rounded-lg flex items-center justify-center bg-accent text-white hover:bg-accent/90">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button onClick={() => updateQuantity(item.product.id, 0)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex justify-between font-extrabold text-lg">
                <span>Total</span>
                <span className="text-primary">{fmtPrice(subtotal)}</span>
              </div>
            </div>

            <button
              disabled={saveMutation.isPending || items.length === 0}
              onClick={handleSave}
              className="w-full py-3.5 rounded-2xl bg-accent text-white font-bold text-base hover:bg-accent/90 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
              {saveMutation.isPending ? "Saving Order..." : "Save Order"}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Mobile Cart Bar & Drawer (Mobile Only - lg:hidden) */}
      <div className="lg:hidden">
        {/* Sticky Bottom Bar */}
        <div className="fixed bottom-4 left-4 right-4 z-40 bg-card/95 backdrop-blur-md border border-border p-3.5 rounded-2xl shadow-2xl flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground font-semibold">
              {totalItemCount} {totalItemCount === 1 ? 'Item' : 'Items'} selected
            </div>
            <div className="text-base font-extrabold text-accent">{fmtPrice(subtotal)}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileTicketOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-secondary text-foreground text-xs font-bold border border-border flex items-center gap-1.5 hover:bg-secondary/80"
            >
              <ShoppingBag className="w-4 h-4 text-accent" /> Ticket
            </button>
            <button
              disabled={saveMutation.isPending || items.length === 0}
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent/90 transition-colors shadow-md disabled:opacity-50"
            >
              {saveMutation.isPending ? "Saving..." : "Save Order"}
            </button>
          </div>
        </div>

        {/* Mobile Ticket Bottom Sheet Modal */}
        <AnimatePresence>
          {isMobileTicketOpen && (
            <>
              <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" 
                onClick={() => setIsMobileTicketOpen(false)} 
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl border-t border-border p-6 shadow-2xl max-h-[85vh] flex flex-col"
              >
                <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-accent" /> Order Ticket
                  </h3>
                  <button 
                    onClick={() => setIsMobileTicketOpen(false)}
                    className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-y-auto space-y-4 flex-1 pr-1">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Table No <span className="font-normal text-muted-foreground/80">(Optional - defaults to Walk-in)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 5 or leave blank for walk-in"
                      value={tableNumber}
                      onChange={e => setTableNumber(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent outline-none text-sm"
                    />
                  </div>

                  <div className="space-y-2.5">
                    {items.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border/60 rounded-2xl">
                        No items added yet.<br />Tap items from the menu to add.
                      </div>
                    ) : items.map(item => (
                      <div key={item.product.id} className="flex items-center justify-between gap-3 bg-secondary/30 p-3 rounded-2xl border border-border/50">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xs leading-tight truncate">{item.product.name}</h4>
                          <div className="text-xs text-accent font-bold mt-0.5">{fmtPrice(item.product.price * item.quantity)}</div>
                        </div>
                        <div className="flex items-center gap-2 bg-secondary border border-border rounded-xl p-1">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-card">
                            <Minus className="w-3 h-3 text-muted-foreground" />
                          </button>
                          <span className="w-4 text-center text-xs font-extrabold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-6 h-6 rounded-lg flex items-center justify-center bg-accent text-white hover:bg-accent/90">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button onClick={() => updateQuantity(item.product.id, 0)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4 mt-4 space-y-3">
                  <div className="flex justify-between font-extrabold text-lg">
                    <span>Total Amount</span>
                    <span className="text-primary">{fmtPrice(subtotal)}</span>
                  </div>
                  <button
                    disabled={saveMutation.isPending || items.length === 0}
                    onClick={() => {
                      setIsMobileTicketOpen(false);
                      handleSave();
                    }}
                    className="w-full py-3.5 rounded-2xl bg-accent text-white font-bold text-base hover:bg-accent/90 transition-all shadow-lg disabled:opacity-50"
                  >
                    {saveMutation.isPending ? "Saving..." : "Save Order"}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
