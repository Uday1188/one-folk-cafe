'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Store, MapPin, Phone, Mail, Clock, Check, Heart, AlignLeft, ScanLine, Download, Image, Upload, X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSettings, updateSettings, fetchProducts } from '@/lib/api';
import { CafeSettings, Product } from '@/types';

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [baseUrl, setBaseUrl] = useState<string>("");

  useEffect(() => {
    // eslint-disable-next-line
    setBaseUrl(process.env.NEXT_PUBLIC_SITE_URL || window.location.origin);
  }, []);

  const downloadQR = () => {
    const canvas = document.getElementById("qr-canvas") as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = "cafe-qr-code.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const [settings, setSettings] = useState<CafeSettings>({
    cafeName: "", address: "",
    phone: "", email: "",
    openTime: "", closeTime: "",
    instagramLink: "", description: ""
  });

  const { data: serverSettings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  });

  const handleProductToggle = (productId: number) => {
    const current = settings.featuredProductIds || [];
    if (current.includes(productId)) {
      setSettings({ ...settings, featuredProductIds: current.filter(id => id !== productId) });
    } else {
      if (current.length >= 4) {
        toast.error("You can only select up to 4 featured products");
        return;
      }
      setSettings({ ...settings, featuredProductIds: [...current, productId] });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, ourStoryImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };


  useEffect(() => {
    if (serverSettings) {
      // eslint-disable-next-line
      setSettings(serverSettings);
    }
  }, [serverSettings]);

  const updateMutation = useMutation({
    mutationFn: (data: CafeSettings) => updateSettings(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['settings'], data);
      toast.success("Settings saved successfully!");
    },
    onError: () => toast.error("Failed to save settings")
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(settings);
  };

  if (isLoading) {
    return <div className="max-w-4xl p-8 text-center text-muted-foreground animate-pulse">Loading settings...</div>;
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your cafe&apos;s core details and preferences.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="flex flex-col gap-8">
          {/* Top Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Column (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Store className="w-5 h-5 text-accent" /> General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Cafe Name</label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" value={settings.cafeName} onChange={e => setSettings({ ...settings, cafeName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="email" value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 text-sm" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Instagram Link</label>
                  <div className="relative">
                    <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="url" value={settings.instagramLink || ""} onChange={e => setSettings({ ...settings, instagramLink: e.target.value })}
                      placeholder="https://instagram.com/yourcafe"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 text-sm" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Cafe Description</label>
                  <div className="relative">
                    <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <textarea value={settings.description || ""} onChange={e => setSettings({ ...settings, description: e.target.value })}
                      rows={3} placeholder="A short description of your cafe..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 text-sm resize-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Clock className="w-5 h-5 text-accent" /> Operating Hours</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Opening Time</label>
                  <input type="time" value={settings.openTime} onChange={e => setSettings({ ...settings, openTime: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Closing Time</label>
                  <input type="time" value={settings.closeTime} onChange={e => setSettings({ ...settings, closeTime: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 text-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1/3 width) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><ScanLine className="w-5 h-5 text-accent" /> QR Code Generator</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Generate a QR code for your cafe tables. Customers can scan this to open the digital menu and place orders.
              </p>
              <div className="flex flex-col gap-6 items-start">
                <div className="w-full space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Destination URL (Locked)</label>
                    <input type="text" value={baseUrl} readOnly disabled
                      className="w-full px-4 py-2.5 rounded-xl bg-input-background border border-border text-muted-foreground opacity-70 cursor-not-allowed text-sm" />
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This URL is securely loaded from your environment file. By default, it points to your home page where customers can enter their details to order.
                    </p>
                  </div>
                </div>
                <div className="mx-auto w-full max-w-[220px] p-6 bg-white rounded-2xl shadow-sm border border-border flex flex-col items-center gap-3">
                  <QRCodeCanvas id="qr-canvas" value={baseUrl} size={150} level="M" includeMargin={true} style={{ width: '100%', height: 'auto' }} />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Scan to Order</span>
                  <button type="button" onClick={downloadQR}
                    className="mt-3 flex items-center gap-2 px-4 py-2 w-full justify-center rounded-xl bg-secondary text-secondary-foreground text-xs font-bold hover:bg-secondary/80 transition-colors">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Section: Homepage Customization */}
          <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Heart className="w-5 h-5 text-accent" /> Homepage Customization</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Our Story Image</label>
                  <p className="text-xs text-muted-foreground mb-4">Upload a high-quality image to show in the Our Story section on the homepage.</p>
                  
                  <div className="border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center bg-input-background relative overflow-hidden group">
                    {settings.ourStoryImage ? (
                      <>
                        <img src={settings.ourStoryImage} alt="Our Story" className="w-full h-48 object-cover rounded-xl" />
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-gray-100 transition-colors">
                            <Upload className="w-4 h-4" /> Change Image
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                          </label>
                        </div>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 cursor-pointer">
                        <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
                          <Image className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-semibold text-accent">Click to upload</span>
                        <span className="text-xs text-muted-foreground mt-1">High-quality PNG, JPG</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Most Loved Items (Max 4)</label>
                  <p className="text-xs text-muted-foreground mb-3">Select the products you want to feature on the home page.</p>
                  
                  {/* Selected Items Display */}
                  {(settings.featuredProductIds?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 p-3 bg-secondary/30 rounded-xl border border-border">
                      {settings.featuredProductIds?.map(id => {
                        const product = products?.find((p: Product) => p.id === id);
                        if (!product) return null;
                        return (
                          <div key={id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background border border-border text-sm font-medium shadow-sm">
                            <span className="truncate max-w-[150px]">{product.name}</span>
                            <button type="button" onClick={() => handleProductToggle(id)} className="text-muted-foreground hover:text-destructive transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 border border-border rounded-xl p-3 bg-input-background">
                    {products?.map((p: Product) => (
                      <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-secondary/50 rounded-lg cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={(settings.featuredProductIds || []).includes(p.id)}
                          onChange={() => handleProductToggle(p.id)}
                          className="w-4 h-4 rounded text-accent focus:ring-accent accent-accent"
                        />
                        <div className="flex-1 text-sm font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">₹{p.price}</div>
                      </label>
                    ))}
                    {!products?.length && <div className="text-sm text-muted-foreground p-2">No products found.</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={updateMutation.isPending}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent/90 transition-all disabled:opacity-50">
            {updateMutation.isPending ? (
              <>Saving...</>
            ) : (
              <><Check className="w-4 h-4" /> Save Settings</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
