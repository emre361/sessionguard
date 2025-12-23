'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArrowLeft, UserPlus, Package, Phone, DollarSign } from 'lucide-react';

export default function AddStudentPage() {
  const router = useRouter();
  const [adSoyad, setAdSoyad] = useState('');
  const [telefon, setTelefon] = useState('');
  const [toplamDers, setToplamDers] = useState('');
  const [odenenTutar, setOdenenTutar] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!adSoyad || !toplamDers || !odenenTutar) {
        setError('Lütfen tüm zorunlu alanları doldurun.');
        setIsLoading(false);
        return;
    }

    try {
      await addDoc(collection(db, 'students'), {
        ad: adSoyad,
        telefon: telefon,
        toplamDers: Number(toplamDers),
        kalanDers: Number(toplamDers), // Başlangıçta kalan ders toplam derse eşittir
        bakiye: Number(odenenTutar),
        createdAt: serverTimestamp(),
      });

      alert('Öğrenci başarıyla eklendi!');
      router.push('/dashboard');

    } catch (err) {
      console.error("Firestore'a yazma hatası: ", err);
      setError('Öğrenci eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex items-center justify-center p-4">
        <div className="w-full max-w-md">
             <button 
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors duration-300">
                <ArrowLeft size={18} />
                Geri Dön
            </button>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-[0_0_40px_rgba(99,102,241,0.2)]">
                <div className="text-center mb-8">
                     <h1 className="text-3xl font-bold tracking-tight">Yeni Öğrenci Ekle</h1>
                     <p className="text-slate-400 mt-2">Yeni bir öğrenci kaydı oluşturun.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Ad Soyad */}
                    <div className="relative">
                        <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20}/>
                        <input 
                            type="text"
                            placeholder="Ad Soyad"
                            value={adSoyad}
                            onChange={(e) => setAdSoyad(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            required
                        />
                    </div>

                    {/* Telefon Numarası */}
                    <div className="relative">
                         <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20}/>
                        <input 
                            type="tel"
                            placeholder="Telefon Numarası (İsteğe Bağlı)"
                            value={telefon}
                            onChange={(e) => setTelefon(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>

                    {/* Paket Ders Sayısı */}
                    <div className="relative">
                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20}/>
                        <input 
                            type="number"
                            placeholder="Paket Ders Sayısı"
                            value={toplamDers}
                            onChange={(e) => setToplamDers(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            required
                        />
                    </div>

                    {/* Ödenen Tutar */}
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20}/>
                        <input 
                            type="number"
                            placeholder="Ödenen Tutar (₺)"
                            value={odenenTutar}
                            onChange={(e) => setOdenenTutar(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            required
                        />
                    </div>
                    
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(99,102,241,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       {isLoading ? 'Kaydediliyor...' : 'Öğrenciyi Kaydet'}
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
}
