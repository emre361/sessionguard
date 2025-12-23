'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Users, BarChart2, Coins, Bell, AlertTriangle, ChevronRight, 
  Loader2, PlusCircle
} from 'lucide-react';

// Arayüzler
interface Student {
  id: string;
  ad: string;
  telefon: string;
  kalanDers: number;
  toplamUcret?: number;
  bakiye?: number;
}

interface AttentionItem {
  student: Student;
  reason: 'Ders Bitiyor' | 'Paket Bitti' | 'Borçlu';
  priority: number;
  message: string;
}

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalStudents: 0, avgLessons: 0, totalRevenue: 0 });
  const [attentionItems, setAttentionItems] = useState<AttentionItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, 'students'), orderBy('ad', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[];
      setStudents(studentsData);
      
      const totalStudents = studentsData.length;
      const totalRevenue = studentsData.reduce((acc, s) => acc + (s.bakiye || 0), 0);
      const totalRemainingLessons = studentsData.reduce((acc, s) => acc + (s.kalanDers || 0), 0);
      setStats({ totalStudents, totalRevenue, avgLessons: totalStudents > 0 ? parseFloat((totalRemainingLessons / totalStudents).toFixed(1)) : 0 });

      const notifications: AttentionItem[] = [];
      studentsData.forEach(student => {
        const remainingDebt = (student.toplamUcret || 0) - (student.bakiye || 0);
        if (student.kalanDers <= 0) {
          notifications.push({ student, reason: 'Paket Bitti', priority: 1, message: 'Paketi Tamamen Bitti' });
        } else if (remainingDebt > 0) {
          notifications.push({ student, reason: 'Borçlu', priority: 1, message: `${remainingDebt.toLocaleString('tr-TR')}₺ Borcu Var` });
        } else if (student.kalanDers <= 2) {
          notifications.push({ student, reason: 'Ders Bitiyor', priority: 2, message: `Son ${student.kalanDers} Dersi Kaldı` });
        }
      });

      notifications.sort((a, b) => a.priority - b.priority || a.student.ad.localeCompare(b.student.ad));
      setAttentionItems(notifications);
      setLoading(false);
    }, (error) => {
      console.error("Veri çekme hatası: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white"><Loader2 className="w-10 h-10 animate-spin text-lime-400 mb-4"/><p>Dashboard Yükleniyor...</p></div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tighter">Dashboard</h1>
          <button onClick={() => router.push('/add-student')} className="btn-primary"><PlusCircle size={20}/> Yeni Öğrenci</button>
        </div>

        {/* Bildirim Paneli (Sadeleştirilmiş) */}
        {attentionItems.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-3"><Bell className="text-amber-400"/> Dikkat Gerekenler</h2>
                <div className="space-y-3">
                    {attentionItems.map((item) => (
                        <div key={`${item.student.id}-${item.reason}`} className={`p-4 rounded-lg border flex flex-col sm:flex-row items-center justify-between gap-4 ${item.priority === 1 ? 'bg-red-900/50 border-red-500/30' : 'bg-yellow-900/50 border-yellow-500/30'}`}>
                            <div className="flex items-center gap-3">
                                <AlertTriangle className={`${item.priority === 1 ? 'text-red-500' : 'text-yellow-500'}`} size={20} />
                                <span className="font-semibold text-white">{item.student.ad}</span>
                                <span className="text-sm text-slate-300">- {item.message}</span>
                            </div>
                            <Link href={`/students/${item.student.id}`} className="flex-shrink-0">
                                <span className="btn-secondary">İncele <ChevronRight size={18}/></span>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        )}
        
        {/* İstatistik Kartları */}
        <h2 className="text-xl font-bold mb-4">Genel Bakış</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link href="/students" className="block h-full"><div className="stat-card hover:bg-slate-800 transition-colors cursor-pointer"><div className="stat-icon bg-blue-500/10"><Users className="text-blue-400" size={28}/></div><div><p className="stat-label">Toplam Öğrenci</p><p className="stat-value">{stats.totalStudents}</p></div></div></Link>
            <div className="stat-card"><div className="stat-icon bg-green-500/10"><Coins className="text-green-400" size={28}/></div><div><p className="stat-label">Toplam Tahsilat</p><p className="stat-value">{stats.totalRevenue.toLocaleString('tr-TR')}₺</p></div></div>
            <div className="stat-card"><div className="stat-icon bg-purple-500/10"><BarChart2 className="text-purple-400" size={28}/></div><div><p className="stat-label">Ort. Kalan Ders</p><p className="stat-value">{stats.avgLessons}</p></div></div>
        </div>

        {/* Son Hareketler Listesi */}
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Son Eklenen Öğrenciler</h2>
            <Link href="/students"><span className="text-lime-400 hover:text-lime-300 font-semibold text-sm transition-colors">Tümünü Gör →</span></Link>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl">
            <ul className="divide-y divide-slate-800">
                {students.length > 0 ? students.slice(0, 5).map(student => (
                    <li key={student.id} className="py-3 px-6 flex justify-between items-center hover:bg-slate-800/50 transition-colors rounded-2xl">
                        <span className="text-white font-medium">{student.ad}</span>
                        <Link href={`/students/${student.id}`}><span className="flex items-center text-sm font-semibold text-lime-400 hover:text-lime-300">Profili Gör <ChevronRight size={18}/></span></Link>
                    </li>
                )) : <li className="text-center text-slate-400 py-6">Henüz öğrenci eklenmemiş.</li>}
            </ul>
        </div>

      </div>
       <style jsx global>{`
        .btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; background-color: #a3e635; color: #020617; font-weight: 700; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: all 0.2s; }
        .btn-primary:hover { background-color: #bef264; transform: scale(1.05); }
        .btn-secondary { display: inline-flex; justify-content: center; align-items: center; gap: 0.5rem; background-color: #334155; color: white; font-weight: 600; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: background-color 0.2s; white-space: nowrap; }
        .btn-secondary:hover { background-color: #475569; }
        
        .stat-card { background-color: #1e293b; border: 1px solid #334155; border-radius: 1rem; padding: 1.5rem; display: flex; align-items: center; gap: 1rem; height: 100%; }
        .stat-icon { padding: 0.75rem; border-radius: 0.5rem; }
        .stat-label { color: #94a3b8; font-size: 0.875rem; }
        .stat-value { color: white; font-size: 1.875rem; font-weight: 700; }
      `}</style>
    </div>
  );
}
