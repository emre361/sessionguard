'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, collection, query, orderBy, addDoc, updateDoc, increment, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
    ArrowLeft, PlusCircle, BarChart2, BookOpen, Weight, Ruler, Percent, X, 
    TrendingUp, TrendingDown, Minus, Loader2, ArrowDownCircle, Banknote, MessageSquare, Pencil, AreaChart
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


// Arayüzler
interface Student { id: string; ad: string; telefon: string; kalanDers: number; toplamUcret?: number; bakiye?: number; }
interface HistoryItem { id: string; action: string; note: string; date: Timestamp; }
interface Measurement { id: string; date: Timestamp; kilo?: number; yagOrani?: number; bel?: number; kalca?: number; }

// Bileşenler
const StatCard = ({ icon, label, value, change, unit }: { icon: React.ReactNode, label: string, value: string, change?: number, unit: string }) => {
    const isPositive = change && change > 0;
    const isNegative = change && change < 0;
    const changeText = change ? change.toFixed(1) : '0';
    return (
        <div className="bg-slate-800 p-4 rounded-lg flex items-center gap-4">
            {icon}
            <div className="flex-grow"><p className="text-sm text-slate-400">{label}</p><p className="text-lg font-bold text-white">{value} {unit}</p></div>
            {change !== undefined && change !== 0 && (<div className={`flex items-center font-semibold text-sm ${isPositive ? 'text-red-400' : 'text-green-400'}`}>{isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}<span className="ml-1">{isPositive ? '+' : ''}{changeText}{unit}</span></div>)}
            {change === 0 && <div className={`flex items-center font-semibold text-sm text-slate-500`}><Minus size={16} /></div>}
        </div>
    );
};

const getHistoryItemStyle = (action: string) => {
    switch (action) {
        case 'Ders Düşüldü': return { border: 'border-blue-500', text: 'text-blue-400' };
        case 'Ödeme Alındı': return { border: 'border-green-500', text: 'text-green-400' };
        case 'Bilgiler Güncellendi': return { border: 'border-yellow-500', text: 'text-yellow-400' };
        case 'Sistem Mesajı': return { border: 'border-purple-500', text: 'text-purple-400' };
        default: return { border: 'border-slate-700', text: 'text-slate-400' };
    }
};

export default function StudentDetailPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMeasurementModalOpen, setMeasurementModalOpen] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMeasurement, setNewMeasurement] = useState({ kilo: '', yagOrani: '', bel: '', kalca: '' });
  const [editStudentData, setEditStudentData] = useState({ ad: '', telefon: '', toplamUcret: '' });
  const [paymentAmount, setPaymentAmount] = useState('');

  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  useEffect(() => {
    if (!id) return;
    const studentDocRef = doc(db, 'students', id);
    const unsubscribeStudent = onSnapshot(studentDocRef, (doc) => {
      if (doc.exists()) {
        const studentData = { id: doc.id, ...doc.data() } as Student;
        setStudent(studentData);
        setEditStudentData({ ad: studentData.ad, telefon: studentData.telefon, toplamUcret: studentData.toplamUcret?.toString() || '' });
      } else { router.push('/dashboard'); }
      setLoading(false);
    });
    const historyQuery = query(collection(db, 'students', id, 'history'), orderBy('date', 'desc'));
    const unsubscribeHistory = onSnapshot(historyQuery, (snapshot) => setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HistoryItem))));
    const measurementsQuery = query(collection(db, 'students', id, 'measurements'), orderBy('date', 'desc'));
    const unsubscribeMeasurements = onSnapshot(measurementsQuery, (snapshot) => setMeasurements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Measurement))));
    return () => { unsubscribeStudent(); unsubscribeHistory(); unsubscribeMeasurements(); };
  }, [id, router]);

  const chartData = useMemo(() => {
    if (measurements.length < 1) return [];
    return measurements
        .slice()
        .reverse()
        .map(m => ({
            date: m.date?.toDate ? new Date(m.date.toDate()).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }) : ' ',
            Kilo: m.kilo || null,
        }));
  }, [measurements]);

  const handleAction = async (action: () => Promise<void>, modalToClose?: () => void) => {
      if(isSubmitting) return;
      setIsSubmitting(true);
      try { await action(); modalToClose?.(); } 
      catch (error) { console.error("İşlem hatası:", error); alert("Bir hata oluştu."); }
      finally { setIsSubmitting(false); }
  }

  const decrementLesson = () => handleAction(async () => {
      await updateDoc(doc(db, 'students', id), { kalanDers: increment(-1) });
      await addDoc(collection(db, 'students', id, 'history'), { action: 'Ders Düşüldü', note: '1 ders manuel olarak düşüldü.', date: serverTimestamp() });
  });

  const addPayment = () => handleAction(async () => {
      const amount = parseFloat(paymentAmount);
      if (!amount || amount <= 0) { alert("Geçerli bir tutar girin."); setIsSubmitting(false); return; }
      await updateDoc(doc(db, 'students', id), { bakiye: increment(amount) });
      await addDoc(collection(db, 'students', id, 'history'), { action: 'Ödeme Alındı', note: `${amount.toLocaleString('tr-TR')}₺ ödeme eklendi.`, date: serverTimestamp() });
      setPaymentAmount('');
  }, () => setPaymentModalOpen(false));

  const addMeasurement = () => handleAction(async () => {
      await addDoc(collection(db, 'students', id, 'measurements'), { date: serverTimestamp(), kilo: newMeasurement.kilo ? parseFloat(newMeasurement.kilo) : null, yagOrani: newMeasurement.yagOrani ? parseFloat(newMeasurement.yagOrani) : null, bel: newMeasurement.bel ? parseFloat(newMeasurement.bel) : null, kalca: newMeasurement.kalca ? parseFloat(newMeasurement.kalca) : null });
      setNewMeasurement({ kilo: '', yagOrani: '', bel: '', kalca: '' });
  }, () => setMeasurementModalOpen(false));

  const handleEditStudent = () => handleAction(async () => {
    await updateDoc(doc(db, 'students', id), { ad: editStudentData.ad, telefon: editStudentData.telefon, toplamUcret: editStudentData.toplamUcret ? parseFloat(editStudentData.toplamUcret) : student?.toplamUcret });
    await addDoc(collection(db, 'students', id, 'history'), { action: 'Bilgiler Güncellendi', note: 'Öğrenci bilgileri güncellendi.', date: serverTimestamp() });
  }, () => setIsEditModalOpen(false));

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white"><Loader2 className="animate-spin w-10 h-10 text-lime-400" /></div>;
  if (!student) return <div className="text-center py-20 text-white">Öğrenci bulunamadı.</div>;

  const remainingDebt = (student.toplamUcret || 0) - (student.bakiye || 0);
  const lessonWarning = student.kalanDers <= 2 && student.kalanDers > 0;
  const lessonDanger = student.kalanDers <= 0;

  return (
    <>
      <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
            <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-lime-400 font-semibold mb-6 hover:text-lime-300 transition-colors"><ArrowLeft size={20} /> Geri Dön</button>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row justify-between gap-6"><div className="flex-1"><h1 className="text-3xl font-bold tracking-tighter mb-2 text-white">{student.ad}</h1><p className="text-slate-400">{student.telefon}</p></div><div className="flex items-center gap-6"><div className="text-center"><p className="text-sm text-slate-400">Kalan Ders</p><p className={`text-4xl font-bold ${lessonDanger ? 'text-red-500' : lessonWarning ? 'text-yellow-400' : 'text-lime-400'}`}>{student.kalanDers}</p></div><div className="text-center"><p className="text-sm text-slate-400">Finansal Durum</p>{remainingDebt > 0 ? (<p className="text-lg font-bold text-red-500">{remainingDebt.toLocaleString('tr-TR')}₺ Borç</p>) : (<p className="text-lg font-bold text-green-400">Ödeme Tamam</p>)}</div></div></div>
            <div className="border-b border-slate-800 mb-8"><div className="flex gap-8"><button onClick={() => setActiveTab('overview')} className={`py-3 font-semibold transition-colors flex items-center gap-2 ${activeTab === 'overview' ? 'text-white border-b-2 border-lime-400' : 'text-slate-400 hover:text-white'}`}><BookOpen size={18}/> Genel Bakış</button><button onClick={() => setActiveTab('measurements')} className={`py-3 font-semibold transition-colors flex items-center gap-2 ${activeTab === 'measurements' ? 'text-white border-b-2 border-lime-400' : 'text-slate-400 hover:text-white'}`}><BarChart2 size={18}/> Ölçümler & Gelişim</button></div></div>

            {activeTab === 'overview' && (<div className="space-y-10"><div className="grid grid-cols-2 md:grid-cols-4 gap-4"><button onClick={decrementLesson} disabled={isSubmitting} className="action-btn bg-blue-600/20 text-blue-300 hover:bg-blue-600/40"><ArrowDownCircle size={20}/> Ders Düş</button><button onClick={() => setPaymentModalOpen(true)} className="action-btn bg-green-600/20 text-green-300 hover:bg-green-600/40"><Banknote size={20}/> Ödeme Al</button><button onClick={() => setIsEditModalOpen(true)} className="action-btn bg-purple-600/20 text-purple-300 hover:bg-purple-600/40"><Pencil size={20}/> Düzenle</button><a href={`https://wa.me/90${student.telefon}`} target="_blank" rel="noopener noreferrer" className="action-btn bg-teal-600/20 text-teal-300 hover:bg-teal-600/40"><MessageSquare size={20}/> WhatsApp</a></div><div><h2 className="text-xl font-bold">Geçmiş İşlemler</h2><div className="mt-6 space-y-4">{history.length > 0 ? history.map(item => { const style = getHistoryItemStyle(item.action); return (<div key={item.id} className={`relative bg-slate-900/70 border-l-4 ${style.border} rounded-r-lg p-4 pl-6`}><p className={`font-bold ${style.text}`}>{item.action}</p><p className="text-sm text-slate-300">{item.note}</p><p className="absolute top-3 right-4 text-xs text-slate-500">{item.date?.toDate ? new Date(item.date.toDate()).toLocaleDateString('tr-TR') : 'Az önce'}</p></div>);}) : <p className="text-slate-500 text-center py-8">Henüz bir geçmiş kaydı bulunmuyor.</p>}</div></div></div>)}

            {activeTab === 'measurements' && (<div className="space-y-8">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6"><h3 className="text-xl font-bold mb-4 flex items-center gap-2"><AreaChart className="text-lime-400"/> Gelişim Grafiği</h3>{chartData.length > 1 ? (<ResponsiveContainer width="100%" height={300}><LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="date" stroke="#94a3b8" /><YAxis stroke="#94a3b8" domain={['dataMin - 2', 'dataMax + 2']} /><Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} labelStyle={{ fontWeight: 'bold', color: '#a3e635' }} /><Line type="monotone" dataKey="Kilo" stroke="#a3e635" strokeWidth={2} dot={{ r: 4, fill: '#a3e635' }} activeDot={{ r: 8, fill: '#a3e635' }} /></LineChart></ResponsiveContainer>) : (<div className="flex items-center justify-center h-[300px] text-slate-500"><p>Grafik oluşturmak için en az iki ölçüm girilmelidir.</p></div>)}</div>
                <div><div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold">Ölçüm Detayları</h2><button onClick={() => setMeasurementModalOpen(true)} className="btn-primary"><PlusCircle size={20}/> Yeni Ölçüm Ekle</button></div><div className="space-y-6">{measurements.length > 0 ? measurements.map((m, index) => { const prev = measurements[index + 1]; return ( <div key={m.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl"><p className="font-bold text-lg text-lime-400 mb-4">{m.date?.toDate ? new Date(m.date.toDate()).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Az önce'}</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{m.kilo && <StatCard icon={<Weight />} label="Kilo" value={m.kilo.toFixed(1)} unit="kg" change={prev?.kilo ? m.kilo - prev.kilo : undefined} />}{m.yagOrani && <StatCard icon={<Percent />} label="Yağ Oranı" value={m.yagOrani.toFixed(1)} unit="%" change={prev?.yagOrani ? m.yagOrani - prev.yagOrani : undefined} />}{m.bel && <StatCard icon={<Ruler />} label="Bel" value={m.bel.toFixed(1)} unit="cm" change={prev?.bel ? m.bel - prev.bel : undefined} />}{m.kalca && <StatCard icon={<Ruler />} label="Kalça" value={m.kalca.toFixed(1)} unit="cm" change={prev?.kalca ? m.kalca - prev.kalca : undefined} />}</div></div> ); }) : <p className="text-slate-500 text-center py-8">Henüz bir ölçüm kaydı bulunmuyor.</p>}</div></div>
            </div>)}
        </div>
      </div>

      {/* Modallar */}
      {[ { isOpen: isEditModalOpen, close: () => setIsEditModalOpen(false), title: 'Öğrenci Bilgilerini Düzenle', form: <form onSubmit={(e) => {e.preventDefault(); handleEditStudent();}} className="space-y-4"><div><label className="label-style">Ad Soyad</label><input type="text" value={editStudentData.ad} onChange={e => setEditStudentData({...editStudentData, ad: e.target.value})} className="input-style" /></div><div><label className="label-style">Telefon</label><input type="text" value={editStudentData.telefon} onChange={e => setEditStudentData({...editStudentData, telefon: e.target.value})} className="input-style" /></div><div><label className="label-style">Toplam Paket Ücreti (₺)</label><input type="number" step="1" value={editStudentData.toplamUcret} onChange={e => setEditStudentData({...editStudentData, toplamUcret: e.target.value})} className="input-style" /></div><button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-6">{isSubmitting ? <Loader2 className="animate-spin"/> : 'Değişiklikleri Kaydet'}</button></form> }, { isOpen: isMeasurementModalOpen, close: () => setMeasurementModalOpen(false), title: 'Yeni Ölçüm Ekle', form: <form onSubmit={(e) => {e.preventDefault(); addMeasurement();}} className="space-y-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="label-style">Kilo (kg)</label><input type="number" step="0.1" value={newMeasurement.kilo} onChange={e => setNewMeasurement({...newMeasurement, kilo: e.target.value})} className="input-style" /></div><div><label className="label-style">Yağ Oranı (%)</label><input type="number" step="0.1" value={newMeasurement.yagOrani} onChange={e => setNewMeasurement({...newMeasurement, yagOrani: e.target.value})} className="input-style" /></div><div><label className="label-style">Bel (cm)</label><input type="number" step="0.1" value={newMeasurement.bel} onChange={e => setNewMeasurement({...newMeasurement, bel: e.target.value})} className="input-style" /></div><div><label className="label-style">Kalça (cm)</label><input type="number" step="0.1" value={newMeasurement.kalca} onChange={e => setNewMeasurement({...newMeasurement, kalca: e.target.value})} className="input-style" /></div></div><button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-6">{isSubmitting ? <Loader2 className="animate-spin"/> : 'Ölçümü Kaydet'}</button></form> }, { isOpen: isPaymentModalOpen, close: () => setPaymentModalOpen(false), title: 'Ödeme Al', form: <form onSubmit={(e) => {e.preventDefault(); addPayment();}} className="space-y-4"><div><label className="label-style">Alınan Tutar (₺)</label><input type="number" step="0.01" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder="Örn: 500" className="input-style" autoFocus /></div><button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-6">{isSubmitting ? <Loader2 className="animate-spin"/> : 'Ödemeyi Kaydet'}</button></form> } ].map(modal => modal.isOpen && ( <div key={modal.title} className="modal-backdrop"><div className="modal-content"><button onClick={modal.close} className="modal-close-btn"><X /></button><h2 className="modal-title">{modal.title}</h2>{modal.form}</div></div> ))}

      <style jsx global>{`
        .action-btn { display: inline-flex; justify-content: center; align-items: center; gap: 0.75rem; font-weight: 600; padding: 1rem; border-radius: 0.75rem; transition: all 0.2s; border: 1px solid #334155; }
        .action-btn:hover { transform: translateY(-2px); border-color: #475569; }
        .btn-primary { display: inline-flex; justify-content: center; align-items: center; gap: 0.5rem; background-color: #a3e635; color: #020617; font-weight: 700; padding: 0.75rem 1.25rem; border-radius: 0.5rem; transition: all 0.2s; }
        .btn-primary:hover { background-color: #bef264; transform: scale(1.05); }
        .btn-primary:disabled { background-color: #475569; color: #94a3b8; cursor: not-allowed; transform: none; }
        .input-style { background-color: #1e293b; border: 1px solid #334155; color: white; padding: 0.75rem; border-radius: 0.5rem; width: 100%; transition: border-color 0.2s; }
        .input-style:focus { outline: none; border-color: #a3e635; }
        .label-style { display: block; font-semibold; text-sm text-slate-300 mb-2; }
        .modal-backdrop { position: fixed; inset: 0; background-color: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 1rem; }
        .modal-content { position: relative; background-color: #1e293b; border: 1px solid #334155; border-radius: 1rem; padding: 2rem; width: 100%; max-width: 28rem; }
        .modal-close-btn { position: absolute; top: 1rem; right: 1rem; color: #94a3b8; transition: color 0.2s; }
        .modal-close-btn:hover { color: white; }
        .modal-title { font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 1.5rem; }
      `}</style>
    </>
  );
}
