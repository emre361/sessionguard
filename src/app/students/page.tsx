'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, increment, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';

// Öğrenci için bir tip tanımı yapalım
interface Student {
  id: string;
  ad: string;
  kalanDers: number;
  toplamDers: number;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentsCollection = collection(db, 'students');
        const q = query(studentsCollection, orderBy('ad', 'asc'));
        const studentSnapshot = await getDocs(q);
        const studentList = studentSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Student[];
        setStudents(studentList);
      } catch (err) {
        console.error("Öğrencileri çekerken hata: ", err);
        setError('Öğrenci verileri yüklenemedi. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleDecrementLesson = async (e: React.MouseEvent, studentId: string) => {
    e.stopPropagation(); // Link'e tıklamayı engelle
    e.preventDefault(); // Link'in varsayılan davranışını engelle

    setUpdatingId(studentId);
    const studentRef = doc(db, 'students', studentId);

    try {
      await updateDoc(studentRef, {
        kalanDers: increment(-1)
      });

      setStudents(prevStudents =>
        prevStudents.map(student =>
          student.id === studentId
            ? { ...student, kalanDers: student.kalanDers - 1 }
            : student
        )
      );
      
      alert('Ders başarıyla düşüldü!');

    } catch (err) {
      console.error("Ders düşme hatası: ", err);
      alert('Ders düşülürken bir hata oluştu.');
    } finally {
        setUpdatingId(null);
    }
  };

  const handleDeleteStudent = async (e: React.MouseEvent, studentId: string) => {
    e.stopPropagation(); // Link'e tıklamayı engelle
    e.preventDefault(); // Link'in varsayılan davranışını engelle

    if (window.confirm('Bu öğrenciyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
        setUpdatingId(studentId);
        const studentRef = doc(db, 'students', studentId);
        try {
            await deleteDoc(studentRef);

            setStudents(prevStudents => prevStudents.filter(student => student.id !== studentId));

            alert('Öğrenci başarıyla silindi.');

        } catch (err) {
            console.error("Öğrenci silme hatası: ", err);
            alert('Öğrenci silinirken bir hata oluştu.');
        } finally {
            setUpdatingId(null);
        }
    }
  };


  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
            <Link href="/dashboard" className="text-lime-400 hover:text-lime-300 transition-colors mr-4">
                <ArrowLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold tracking-tighter text-lime-400">
            Öğrenci Listesi & Check-in
            </h1>
        </div>

        {loading && <p className="text-center text-slate-400">Öğrenciler yükleniyor...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map(student => (
                <Link href={`/students/${student.id}`} key={student.id} className="block bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg shadow-lime-500/5 flex flex-col justify-between transform hover:-translate-y-1 transition-transform duration-300 hover:border-lime-400/50 group">
                    <div className="relative">
                         <button 
                            onClick={(e) => handleDeleteStudent(e, student.id)}
                            disabled={updatingId === student.id}
                            className="absolute top-[-8px] right-[-8px] p-1.5 rounded-full bg-rose-600/20 text-rose-500 hover:bg-rose-600 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed z-10">
                            <Trash2 size={16}/>
                        </button>
                        <div className="flex items-center mb-4">
                            <div className="bg-slate-800 p-3 rounded-full mr-4">
                                <User className="w-6 h-6 text-lime-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white truncate group-hover:text-lime-300 transition-colors">{student.ad}</h2>
                        </div>
                        <div className="text-center my-4">
                            <p className="text-sm text-slate-400 mb-1">Kalan Ders</p>
                            <p className="text-5xl font-bold tracking-tighter text-lime-400">
                                {student.kalanDers}
                            </p>
                             <p className="text-xs text-slate-500">
                                (Toplam: {student.toplamDers})
                            </p>
                        </div>
                    </div>
                    <button
                    onClick={(e) => handleDecrementLesson(e, student.id)}
                    disabled={updatingId === student.id || student.kalanDers <= 0}
                    className="w-full mt-4 rounded-lg bg-lime-400 py-3 text-base font-bold text-slate-950 transition-all hover:bg-lime-300 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-slate-700 z-10"
                    >
                    {updatingId === student.id ? 'İşleniyor...' : 'Ders Düş (-1)'}
                    </button>
              </Link>
            ))}
          </div>
        )}
         {students.length === 0 && !loading && (
            <div className="text-center py-16 px-6 bg-slate-900 rounded-2xl border border-slate-800">
                <h3 className="text-xl font-semibold text-white">Henüz Öğrenci Yok</h3>
                <p className="text-slate-400 mt-2 mb-4">Sisteme yeni bir öğrenci ekleyerek başlayın.</p>
                <Link href="/add-student" className="inline-block rounded-lg bg-lime-400 px-6 py-2.5 text-base font-bold text-slate-950 transition-colors hover:bg-lime-300">
                    Öğrenci Ekle
                </Link>
            </div>
         )}
      </div>
    </div>
  );
}
