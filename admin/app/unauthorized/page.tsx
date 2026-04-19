import Link from 'next/link';
import { ShieldX } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0B0B0B' }}>
      <div className="text-center">
        <ShieldX size={48} color="#EF4444" className="mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#FAFAFA' }}>Access Denied</h1>
        <p className="text-sm mb-6" style={{ color: '#71717A' }}>
          You don't have admin privileges to access this panel.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-3 rounded-xl text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D06F)', color: '#0B0B0B' }}
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
