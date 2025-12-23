
// İkonlar için küçük bir bileşen oluşturalım
const Icon = ({ path }: { path: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-10 w-10 text-lime-400 mb-4"
  >
    <path d={path} />
  </svg>
);

const ShieldIcon = () => <Icon path="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
const WalletIcon = () => <Icon path="M20 12V8H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12v4 M4 6v12h16v-4 M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h2v-4h-2z" />;
const LinkIcon = () => <Icon path="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72" />;


export default function Home() {
  return (
    <div className="bg-slate-950 text-white min-h-screen font-sans">
      <div className="container mx-auto px-6">
        {/* Header */}
        <header className="flex justify-between items-center py-6 border-b border-slate-800">
          <div className="text-2xl font-bold tracking-tighter text-lime-400">
            SessionGuard
          </div>
          <a
            href="#"
            className="bg-lime-400 text-slate-950 font-bold py-2 px-5 rounded-lg hover:bg-lime-300 transition-colors text-sm"
          >
            Giriş Yap
          </a>
        </header>

        {/* Hero Section */}
        <main className="text-center pt-24 pb-28 md:pt-32 md:pb-40">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight">
            Sen Antrenmana Odaklan,
            <br />
            <span className="text-lime-400">Hesabı Biz Tutalım</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            PT'ler için Paket ve Bakiye Takip Sistemi. Müşterilerinle arandaki finansal takibi dijitalleştirerek zaman kazan.
          </p>
           <div className="mt-8">
            <a
              href="#"
              className="bg-lime-400 text-slate-950 font-bold py-3 px-8 rounded-lg hover:bg-lime-300 transition-colors text-lg"
            >
              Hemen Başla
            </a>
          </div>
        </main>

        {/* Features Section */}
        <section className="pb-24 md:pb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 transform hover:-translate-y-2 transition-transform duration-300">
              <ShieldIcon />
              <h3 className="text-xl font-bold text-white mb-3">
                Dijital Kötü Polis
              </h3>
              <p className="text-slate-400">
                Sistem, kalan dersleri ve paket bitiş tarihlerini otomatik takip ederek "dersim bitti mi?" sorusunu ortadan kaldırır.
              </p>
            </div>
            {/* Card 2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 transform hover:-translate-y-2 transition-transform duration-300">
              <WalletIcon />
              <h3 className="text-xl font-bold text-white mb-3">
                Cüzdan Sistemi
              </h3>
              <p className="text-slate-400">
                Öğrenciler kredi kartıyla veya havale ile bakiye yükleyebilir. Onaylanan ödemeler anında öğrenci bakiyesine yansır.
              </p>
            </div>
            {/* Card 3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 transform hover:-translate-y-2 transition-transform duration-300">
              <LinkIcon />
              <h3 className="text-xl font-bold text-white mb-3">
                Öğrenci Linki
              </h3>
              <p className="text-slate-400">
                Her öğrenci, özel linki üzerinden kalan derslerini, bakiye geçmişini ve paket detaylarını 7/24 görüntüleyebilir.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
