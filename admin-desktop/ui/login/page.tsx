'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { adminLogin } from '@/lib/api';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const data = await adminLogin({ username: username.trim(), password: password.trim() });
      if (data && data.token) {
        localStorage.setItem("fc_admin", "true");
        localStorage.setItem("adminToken", data.token);
        router.push("/admin/dashboard");
      } else {
        setError("Invalid response from server.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
      <button onClick={() => router.push("/")}
        className="absolute top-6 left-6 flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all px-4 py-2 rounded-xl bg-card border border-border shadow-sm hover:shadow-md">
        <ArrowLeft className="w-4 h-4" /> Back to Cafe
      </button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card rounded-3xl shadow-xl border border-border overflow-hidden">
        <div className="bg-gradient-to-br from-primary to-primary/80 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Admin Portal</h1>
          <p className="text-white/60 text-sm">One Folk Cafe Management System</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/30" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                className="w-full pl-4 pr-12 py-3 rounded-2xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/30" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {error && <p className="text-destructive text-xs bg-destructive/10 rounded-xl px-4 py-2.5">{error}</p>}
          <button type="submit" disabled={isLoading} className="w-full py-3.5 rounded-2xl bg-accent text-white font-bold hover:bg-accent/90 transition-all mt-2 disabled:opacity-50">
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
