'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/lib/api';
import { useCartStore } from '@/store/useCartStore';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const [activeImg, setActiveImg] = useState(0);

  const { data: fetchedProducts, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const product: Product | undefined = useMemo(() => {
    if (!fetchedProducts) return undefined;
    const p = fetchedProducts.find((item: any) => String(item.id) === id);
    if (!p) return undefined;
    
    return {
      ...p,
      id: p.id,
      name: p.name,
      description: p.description || "",
      category: p.categoryName || p.category || "Uncategorized",
      categoryName: p.categoryName,
      price: p.price,
      image: p.imageUrl || "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=400&auto=format&fit=crop",
      images: p.imageUrl ? [p.imageUrl] : ["https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=400&auto=format&fit=crop"],
      available: p.available !== false,
      rating: 4.5,
      reviewCount: 120,
      ingredients: [],
      prepTime: 15,
      tags: ["New"]
    };
  }, [fetchedProducts, id]);

  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  const cartItem = items.find(i => String(i.id) === id);
  const qty = cartItem?.quantity ?? 0;

  const handleAdd = () => {
    if (product) addItem(product);
  };

  const handleQtyChange = (q: number) => {
    if (!product) return;
    if (q <= 0) {
      removeItem(product.id as number);
    } else {
      updateQuantity(product.id as number, q);
    }
  };

  const fmtPrice = (p: number) => `₹${p.toLocaleString("en-IN")}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background pt-16 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <button onClick={() => router.push("/menu")} className="text-accent hover:underline">
          Return to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 flex flex-col">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
        <button onClick={() => router.push("/menu")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Menu
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="aspect-square rounded-3xl overflow-hidden bg-secondary mb-3">
              <img src={product.images?.[activeImg] || product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden bg-secondary border-2 transition-all ${activeImg === i ? "border-accent" : "border-transparent"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider">{product.category}</span>
              {!product.available && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                  Sold Out
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-3 leading-tight">{product.name}</h1>
            <p className="text-muted-foreground leading-relaxed mt-4 mb-6">{product.description}</p>

            {/* Ingredients */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Ingredients</h4>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map(ing => (
                    <span key={ing} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">{ing}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-5 rounded-2xl bg-secondary">
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Price</div>
                <div className="text-3xl font-black text-primary">{fmtPrice(product.price)}</div>
              </div>
              {qty === 0 ? (
                <button onClick={handleAdd} disabled={!product.available}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent text-white font-semibold hover:bg-accent/90 disabled:opacity-50 transition-all">
                  <Plus className="w-4 h-4" /> Add to Cart
                </button>
              ) : (
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-3 bg-card rounded-xl p-1.5">
                    <button onClick={() => handleQtyChange(qty - 1)} className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-accent/10 transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-lg">{qty}</span>
                    <button onClick={() => handleQtyChange(qty + 1)} className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-white hover:bg-accent/90 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">Subtotal: {fmtPrice(product.price * qty)}</span>
                </div>
              )}
            </div>

            <button onClick={() => router.push("/cart")}
              className="mt-4 w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all">
              View Cart
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
