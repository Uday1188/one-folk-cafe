'use client';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { useCartStore } from '@/store/useCartStore';

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { items, addItem, updateQuantity, removeItem } = useCartStore();

  const cartItem = items.find(i => i.id === product.id);
  const quantity = cartItem?.quantity ?? 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
  };

  const handleQtyChange = (e: React.MouseEvent, q: number) => {
    e.stopPropagation();
    if (q <= 0) {
      removeItem(product.id as number);
    } else {
      updateQuantity(product.id as number, q);
    }
  };

  const fmtPrice = (p: number) => `₹${p.toLocaleString("en-IN")}`;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="group bg-card rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <div className="relative aspect-[4/3] bg-secondary overflow-hidden cursor-pointer" onClick={() => router.push(`/product/${product.id}`)}>
        <img src={product.image || product.imageUrl || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=400&auto=format&fit=crop'} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {product.tags && product.tags.filter(t => t !== "New").slice(0, 2).map(t => (
            <span key={t} className="px-2 py-0.5 rounded-lg bg-white/90 backdrop-blur text-[11px] font-bold text-primary">{t}</span>
          ))}
        </div>
        {!product.available && (
          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-lg text-xs font-bold bg-gray-500/90 text-white">
            Sold Out
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="text-xs text-accent font-semibold uppercase tracking-wider mb-1">{product.category || product.categoryName}</div>
        <h4 className="font-bold text-base leading-tight mb-1 line-clamp-1 cursor-pointer hover:text-accent transition-colors" onClick={() => router.push(`/product/${product.id}`)}>
          {product.name}
        </h4>
        <p className="text-muted-foreground text-xs leading-relaxed mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-xl font-black text-primary">{fmtPrice(product.price)}</span>
          </div>
          {quantity === 0 ? (
            <button onClick={handleAdd} disabled={!product.available}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-secondary rounded-xl p-1" onClick={e => e.stopPropagation()}>
              <button onClick={(e) => handleQtyChange(e, quantity - 1)} className="w-7 h-7 rounded-lg bg-card flex items-center justify-center hover:bg-accent/10 transition-colors">
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-bold">{quantity}</span>
              <button onClick={(e) => handleQtyChange(e, quantity + 1)} className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center hover:bg-accent/90 transition-colors">
                <Plus className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
