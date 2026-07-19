'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, X as XIcon, ImagePlus, ChevronDown } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProducts, fetchCategories, createProduct, updateProduct, deleteProduct, createCategory } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", category: "Coffee", price: "", image: "", available: true });
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  
  // Custom dropdown state
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [catSearch, setCatSearch] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatImage, setNewCatImage] = useState("");

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });

  const createMutation = useMutation({
    mutationFn: (data: any) => createProduct(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); toast.success("Product added!"); setShowModal(false); },
    onError: () => toast.error("Failed to add product")
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => updateProduct(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); toast.success("Product updated!"); setShowModal(false); },
    onError: () => toast.error("Failed to update product")
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); toast.success("Product deleted!"); setProductToDelete(null); },
    onError: () => { toast.error("Failed to delete product"); setProductToDelete(null); }
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: { name: string, image?: string }) => createCategory(data),
    onSuccess: (newCat) => { 
      queryClient.invalidateQueries({ queryKey: ['categories'] }); 
      setForm(f => ({ ...f, category: newCat.name }));
      setIsAddingCategory(false);
      setNewCatName("");
      setNewCatImage("");
      setCatDropdownOpen(false);
      toast.success("Category added!"); 
    },
    onError: () => toast.error("Failed to add category")
  });

  const filtered = products.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.categoryName || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All Categories" || p.categoryName === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: "", description: "", category: categories.length > 0 ? categories[0].name : "Coffee", price: "", image: "", available: true });
    setShowModal(true);
  };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setForm({ name: p.name, description: p.description || "", category: p.categoryName || "Coffee", price: String(p.price), image: p.imageUrl || "", available: p.available });
    setShowModal(true);
    setCatDropdownOpen(false);
    setIsAddingCategory(false);
    setNewCatImage("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f => ({ ...f, image: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const handleCatImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setNewCatImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) { toast.error("Name and price are required"); return; }
    
    // Find category ID
    const cat = categories.find((c: any) => c.name === form.category);
    if (!cat) { toast.error("Please select a valid category"); return; }

    const payload = { 
      name: form.name, 
      description: form.description, 
      categoryId: cat.id, 
      price: parseFloat(form.price), 
      imageUrl: form.image || null, 
      available: form.available 
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleToggleAvailable = (p: any) => {
    updateMutation.mutate({ 
      id: p.id, 
      data: { ...p, categoryId: p.categoryId, available: !p.available } 
    });
  };

  const fmtPrice = (p: number) => `₹${p.toLocaleString("en-IN")}`;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground text-sm mt-1">{products.length} items in menu</p>
        </div>
        <button onClick={openAdd} disabled={isLoadingCategories}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="flex gap-3 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 text-sm shadow-sm" />
        </div>
        <div className="w-48 relative">
          <div 
            onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
            className="w-full px-4 py-2.5 rounded-xl bg-input-background border border-border text-sm cursor-pointer flex justify-between items-center hover:border-accent/50 transition-colors shadow-sm"
          >
            <span className="truncate">{categoryFilter}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
          </div>
          
          {filterDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-64">
              {isAddingCategory ? (
                <div className="p-3 bg-secondary/30 flex flex-col gap-2 border-b border-border">
                  <input 
                    type="text" 
                    autoFocus
                    placeholder="New Category Name"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-input-background border border-border text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <div className="flex gap-2 items-center">
                    {newCatImage ? (
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-secondary flex-shrink-0 border border-border">
                        <img src={newCatImage} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : null}
                    <label className="flex-1 flex justify-center items-center gap-1.5 py-1.5 text-xs border border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors">
                      <ImagePlus className="w-3.5 h-3.5" />
                      <span>{newCatImage ? "Change" : "Add Image"}</span>
                      <input type="file" accept="image/*" onChange={handleCatImageUpload} className="hidden" />
                    </label>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button 
                      type="button" 
                      onClick={() => {
                        if (newCatName.trim()) {
                          createCategoryMutation.mutate({ name: newCatName.trim(), image: newCatImage || undefined });
                          // we don't automatically select it in the filter, or maybe we do? Let's just select it:
                          setCategoryFilter(newCatName.trim());
                        }
                      }}
                      disabled={createCategoryMutation.isPending || !newCatName.trim()}
                      className="flex-1 bg-accent text-white py-1.5 rounded-lg text-xs font-medium hover:bg-accent/90 disabled:opacity-50"
                    >
                      {createCategoryMutation.isPending ? "Saving..." : "Save"}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setIsAddingCategory(false); setNewCatName(""); setNewCatImage(""); }}
                      className="flex-1 bg-secondary text-foreground py-1.5 rounded-lg text-xs font-medium hover:bg-secondary/80"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="overflow-y-auto flex-1 p-1">
                    <div 
                      onClick={() => { setCategoryFilter("All Categories"); setFilterDropdownOpen(false); }}
                      className={`px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-accent/10 transition-colors ${categoryFilter === "All Categories" ? "bg-accent/10 text-accent font-medium" : ""}`}
                    >
                      All Categories
                    </div>
                    {categories.map((c: any) => (
                      <div 
                        key={c.id} 
                        onClick={() => { setCategoryFilter(c.name); setFilterDropdownOpen(false); }}
                        className={`px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-accent/10 transition-colors ${categoryFilter === c.name ? "bg-accent/10 text-accent font-medium" : ""}`}
                      >
                        {c.name}
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t border-border bg-secondary/20 sticky bottom-0">
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setIsAddingCategory(true); }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-accent hover:bg-accent/10 rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add New Category
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead><tr className="bg-secondary/50 text-left">
              {["Product", "Category", "Price", "Status", "Actions"].map(h => (
                <th key={h} className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {isLoadingProducts ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">Loading products...</td></tr>
              ) : filtered.map((p: any) => (
                <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                        <img src={p.imageUrl || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=400&auto=format&fit=crop'} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{p.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4"><span className="px-2.5 py-1 rounded-lg bg-secondary text-xs font-medium border border-border/50">{p.categoryName}</span></td>
                  <td className="px-5 py-4 font-bold text-primary">{fmtPrice(p.price)}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => handleToggleAvailable(p)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors shadow-sm ${p.available ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800" : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700"}`}>
                      {p.available ? "● Available" : "○ Unavailable"}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEdit(p)}
                        className="w-8 h-8 rounded-lg hover:bg-accent/10 flex items-center justify-center text-muted-foreground hover:text-accent transition-colors" title="Edit product">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setProductToDelete(p)}
                        className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors" title="Delete product">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !isLoadingProducts && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-card rounded-3xl border border-border w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-secondary/30">
                <h3 className="font-bold">{editingId ? "Edit Product" : "Add New Product"}</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl hover:bg-secondary flex items-center justify-center"><XIcon className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Product Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Vanilla Latte"
                    className="w-full px-4 py-2.5 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Brief product description"
                    className="w-full px-4 py-2.5 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 text-sm resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Category *</label>
                    <div 
                      onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                      className="w-full px-4 py-2.5 rounded-xl bg-input-background border border-border text-sm cursor-pointer flex justify-between items-center hover:border-accent/50 transition-colors"
                    >
                      <span className="truncate">{form.category || "Select a category"}</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
                    </div>
                    
                    {catDropdownOpen && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-64">
                        {isAddingCategory ? (
                          <div className="p-3 bg-secondary/30 flex flex-col gap-2 border-b border-border">
                            <input 
                              type="text" 
                              autoFocus
                              placeholder="New Category Name"
                              value={newCatName}
                              onChange={e => setNewCatName(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-input-background border border-border text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                            />
                            <div className="flex gap-2 items-center">
                              {newCatImage ? (
                                <div className="w-8 h-8 rounded-lg overflow-hidden bg-secondary flex-shrink-0 border border-border">
                                  <img src={newCatImage} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                              ) : null}
                              <label className="flex-1 flex justify-center items-center gap-1.5 py-1.5 text-xs border border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors">
                                <ImagePlus className="w-3.5 h-3.5" />
                                <span>{newCatImage ? "Change" : "Add Image"}</span>
                                <input type="file" accept="image/*" onChange={handleCatImageUpload} className="hidden" />
                              </label>
                            </div>
                            <div className="flex gap-2 mt-1">
                              <button 
                                type="button" 
                                onClick={() => {
                                  if (newCatName.trim()) createCategoryMutation.mutate({ name: newCatName.trim(), image: newCatImage || undefined });
                                }}
                                disabled={createCategoryMutation.isPending || !newCatName.trim()}
                                className="flex-1 bg-accent text-white py-1.5 rounded-lg text-xs font-medium hover:bg-accent/90 disabled:opacity-50"
                              >
                                {createCategoryMutation.isPending ? "Saving..." : "Save"}
                              </button>
                              <button 
                                type="button" 
                                onClick={() => { setIsAddingCategory(false); setNewCatName(""); setNewCatImage(""); }}
                                className="flex-1 bg-secondary text-foreground py-1.5 rounded-lg text-xs font-medium hover:bg-secondary/80"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="p-2 border-b border-border bg-card sticky top-0">
                              <div className="relative">
                                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input 
                                  type="text" 
                                  placeholder="Search category..." 
                                  value={catSearch}
                                  onChange={e => setCatSearch(e.target.value)}
                                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-secondary/50 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                                  onClick={e => e.stopPropagation()}
                                />
                              </div>
                            </div>
                            <div className="overflow-y-auto flex-1 p-1">
                              {categories.filter((c: any) => c.name.toLowerCase().includes(catSearch.toLowerCase())).map((c: any) => (
                                <div 
                                  key={c.id} 
                                  onClick={() => { setForm({ ...form, category: c.name }); setCatDropdownOpen(false); setCatSearch(""); }}
                                  className={`px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-accent/10 transition-colors ${form.category === c.name ? "bg-accent/10 text-accent font-medium" : ""}`}
                                >
                                  {c.name}
                                </div>
                              ))}
                              {categories.filter((c: any) => c.name.toLowerCase().includes(catSearch.toLowerCase())).length === 0 && (
                                <div className="px-3 py-4 text-center text-xs text-muted-foreground">No categories found</div>
                              )}
                            </div>
                            <div className="p-2 border-t border-border bg-secondary/20 sticky bottom-0">
                              <button 
                                type="button" 
                                onClick={(e) => { e.stopPropagation(); setIsAddingCategory(true); setCatSearch(""); }}
                                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-accent hover:bg-accent/10 rounded-lg transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add New Category
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Price (₹) *</label>
                    <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="299" min="1"
                      className="w-full px-4 py-2.5 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Product Image (URL or Upload)</label>
                  <div className="flex gap-3 items-center">
                    {form.image && form.image.startsWith('http') ? (
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-secondary flex-shrink-0 border border-border">
                        <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : form.image && form.image.startsWith('data:image') ? (
                       <div className="w-14 h-14 rounded-xl overflow-hidden bg-secondary flex-shrink-0 border border-border">
                        <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : null}
                    <label className="flex-1 flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-border rounded-xl py-3 px-4 cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all">
                      <ImagePlus className="w-5 h-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{form.image ? "Change image" : "Click to attach image"}</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-secondary/50 transition-colors">
                  <div onClick={() => setForm({ ...form, available: !form.available })}
                    className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${form.available ? "bg-accent" : "bg-border"}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${form.available ? "translate-x-5" : "translate-x-0"}`} />
                  </div>
                  <span className="text-sm font-medium">Available for ordering</span>
                </label>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                  className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors mt-2 disabled:opacity-50">
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingId ? "Save Changes" : "Add Product"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {productToDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setProductToDelete(null)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-card rounded-3xl border border-border w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center" onClick={e => e.stopPropagation()}>
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold mb-2">Delete Product?</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Are you sure you want to delete <strong>{productToDelete.name}</strong>? This action will remove it from the menu.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 py-3 rounded-xl bg-secondary text-foreground font-semibold text-sm hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => deleteMutation.mutate(productToDelete.id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-3 rounded-xl bg-destructive text-destructive-foreground font-semibold text-sm hover:bg-destructive/90 transition-colors disabled:opacity-50"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
