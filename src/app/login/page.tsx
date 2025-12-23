'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // <-- GÜNCELLENDİ

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email || !password) {
      setError('Lütfen e-posta ve şifrenizi girin.');
      setIsLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      let errorMessage =
        'Giriş yaparken bir hata oluştu. Lütfen bilgilerinizi kontrol edin.';
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'E-posta veya şifre hatalı.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Geçersiz bir e-posta formatı girdiniz.';
          break;
        case 'auth/too-many-requests':
          errorMessage =
            'Çok fazla hatalı deneme. Lütfen daha sonra tekrar deneyin.';
          break;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 font-sans">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8 shadow-2xl shadow-lime-500/10">
        <h1 className="mb-6 text-center text-3xl font-bold tracking-tighter text-lime-400">
          Giriş Yap
        </h1>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-400"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@mail.com"
              className="w-full rounded-lg border-2 border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 transition-colors focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/50"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-400"
            >
              Şifre
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border-2 border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 transition-colors focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/50"
              required
            />
          </div>

          {error && (
            <p className="mb-4 text-center text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-lime-400 py-3 text-base font-bold text-slate-950 transition-colors hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          Hesabın yok mu?{' '}
          <Link
            href="/register"
            className="font-medium text-lime-400 hover:underline"
          >
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
}
