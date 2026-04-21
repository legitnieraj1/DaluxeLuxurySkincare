"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createAdminBrowserClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Sparkles, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createAdminBrowserClient();

  const errorType = searchParams.get('error');

  useEffect(() => {
    if (errorType === 'unauthorized') {
      toast.error('Access Denied', {
        description: 'You do not have administrative privileges.'
      });
    }
  }, [errorType]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error('Login Failed', {
          description: error.message
        });
        setLoading(false);
        return;
      }

      // If login successful, the middleware will check the role and redirect as needed
      // But we can also check here to give immediate feedback
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut();
        toast.error('Unauthorized', {
          description: 'This area is restricted to administrators only.'
        });
        setLoading(false);
        return;
      }

      toast.success('Welcome back!', {
        description: 'Successfully logged into Daluxe Admin.'
      });
      
      router.push('/admin/dashboard');
      router.refresh();
    } catch (err: any) {
      toast.error('Something went wrong', {
        description: 'Please try again later.'
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#0B0B0B' }}>
      {/* Background Accents */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-[0.03]" 
           style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-[0.02]" 
           style={{ background: 'radial-gradient(circle, #F5D06F 0%, transparent 70%)' }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md px-6 z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-2xl" 
            style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D06F)' }}
          >
            <Sparkles size={32} color="#0B0B0B" strokeWidth={2.5} />
          </motion.div>
          
          <h1 className="text-3xl font-black tracking-[0.3em] mb-2" style={{ color: '#FAFAFA' }}>DALUXE</h1>
          <p className="text-xs tracking-[0.2em] font-medium uppercase" style={{ color: '#A1A1AA' }}>Management Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold tracking-widest uppercase ml-1" style={{ color: '#52525B' }}>
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200" 
                    size={18} style={{ color: '#3F3F46' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#18181B] border border-[#27272A] rounded-xl py-4 pl-12 pr-4 text-sm font-medium transition-all duration-200 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20"
                style={{ color: '#FAFAFA' }}
                placeholder="admin@daluxe.com"
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-[10px] font-bold tracking-widest uppercase ml-1" style={{ color: '#52525B' }}>
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200" 
                    size={18} style={{ color: '#3F3F46' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#18181B] border border-[#27272A] rounded-xl py-4 pl-12 pr-4 text-sm font-medium transition-all duration-200 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20"
                style={{ color: '#FAFAFA' }}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 font-bold tracking-widest uppercase text-sm disabled:opacity-50 overflow-hidden relative group"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D06F)', color: '#0B0B0B' }}
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Sign In to Portal"
            )}
          </button>
        </form>

        <div className="mt-10 flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-[#18181B]" style={{ background: 'rgba(255,255,255,0.01)' }}>
          <AlertCircle size={14} style={{ color: '#3F3F46' }} />
          <p className="text-[10px] font-medium tracking-wide uppercase" style={{ color: '#3F3F46' }}> 
            Encrypted Administrative Access Only
          </p>
        </div>
      </motion.div>
    </div>
  );
}
