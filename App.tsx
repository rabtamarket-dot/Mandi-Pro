
import React, { useState, useEffect, useCallback } from 'react';
import { InvoiceData, DEFAULT_INVOICE, UserProfile, BardanaLog } from './types';
import InvoiceForm from './components/InvoiceForm';
import InvoiceView from './components/InvoiceView';
import AIScanner from './components/AIScanner';
import Login from './components/Login';
import BillHistory from './components/BillHistory';
import BardanaManager from './components/BardanaManager';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('mandi_user_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [data, setData] = useState<InvoiceData>(() => {
    const saved = localStorage.getItem('mandi_bill_data');
    const lastNo = localStorage.getItem('last_bill_no') || '1000';
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...parsed, billNumber: parsed.billNumber || (parseInt(lastNo) + 1).toString() };
      } catch (e) {
        return { ...DEFAULT_INVOICE, billNumber: (parseInt(lastNo) + 1).toString() };
      }
    }
    return { ...DEFAULT_INVOICE, billNumber: (parseInt(lastNo) + 1).toString() };
  });

  const [history, setHistory] = useState<InvoiceData[]>(() => {
    const saved = localStorage.getItem('mandi_bill_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [bardanaLogs, setBardanaLogs] = useState<BardanaLog[]>(() => {
    const saved = localStorage.getItem('mandi_bardana_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [showScanner, setShowScanner] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showBardana, setShowBardana] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (userProfile) {
      setData(prev => ({
        ...prev,
        shopName: userProfile.name,
        phone: userProfile.phone,
        address: userProfile.address
      }));
    }
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('mandi_bill_data', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('mandi_bill_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('mandi_bardana_logs', JSON.stringify(bardanaLogs));
  }, [bardanaLogs]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogin = (profile: UserProfile) => {
    localStorage.setItem('mandi_user_profile', JSON.stringify(profile));
    setUserProfile(profile);
  };

  const handleLogout = () => {
    if (confirm('کیا آپ لاگ آؤٹ کرنا چاہتے ہیں؟')) {
      localStorage.removeItem('mandi_user_profile');
      setUserProfile(null);
    }
  };

  const handleAddBardanaLog = (log: BardanaLog) => {
    setBardanaLogs(prev => [...prev, log]);
  };

  const saveToHistory = (bill: InvoiceData) => {
    const newBill = { ...bill, id: bill.id || Date.now().toString() };
    setHistory(prev => {
      const exists = prev.findIndex(b => b.id === newBill.id);
      if (exists !== -1) {
        const updated = [...prev];
        updated[exists] = newBill;
        return updated;
      }
      return [newBill, ...prev];
    });
  };

  const printInvoice = () => {
    saveToHistory(data);
    setActiveTab('preview');
    localStorage.setItem('last_bill_no', data.billNumber);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const generateNextBillNumber = useCallback(() => {
    const currentNoStr = data.billNumber || localStorage.getItem('last_bill_no') || '1000';
    const match = currentNoStr.match(/(\d+)$/);
    if (match) {
      const numPart = match[0];
      const prefix = currentNoStr.substring(0, currentNoStr.length - numPart.length);
      const nextNo = (parseInt(numPart) + 1).toString().padStart(numPart.length, '0');
      return prefix + nextNo;
    }
    return (parseInt(currentNoStr.replace(/\D/g, '')) + 1).toString();
  }, [data.billNumber]);

  const resetData = () => {
    const nextNo = generateNextBillNumber();
    setData({
      ...DEFAULT_INVOICE,
      shopName: userProfile?.name || '',
      phone: userProfile?.phone || '',
      address: userProfile?.address || '',
      billNumber: nextNo,
      date: new Date().toISOString().split('T')[0]
    });
    localStorage.setItem('last_bill_no', nextNo);
    setActiveTab('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadBill = (bill: InvoiceData) => {
    setData(bill);
    setShowHistory(false);
    setActiveTab('editor');
  };

  const handleDeleteBill = (id: string) => {
    if (userProfile?.role !== 'owner') {
      alert('صرف مالک کو ریکارڈ ڈیلیٹ کرنے کی اجازت ہے۔');
      return;
    }
    if (confirm('کیا آپ یہ ریکارڈ مستقل ختم کرنا چاہتے ہیں؟')) {
      setHistory(prev => prev.filter(b => b.id !== id));
    }
  };

  const bardanaStock = bardanaLogs.reduce((acc, log) => acc + (log.type === 'in' ? log.quantity : -log.quantity), 0);

  if (!userProfile) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen pb-40 px-4 md:px-8 pt-8 bg-gray-50 dark:bg-slate-950 font-sans rtl text-right transition-colors duration-300" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 no-print">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-200 dark:shadow-emerald-900/20">
               <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2c1 0 7 3 7 8.5C19 15.5 12 22 12 22s-7-6.5-7-11.5C5 5 11 2 12 2z" /></svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Mandi Bill <span className="text-emerald-600">Pro</span></h1>
                <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 transition-all hover:scale-105 active:scale-95"
                >
                  {theme === 'light' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  )}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black urdu-text ${userProfile.role === 'owner' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                  {userProfile.role === 'owner' ? "مالک" : "منشی"}: {userProfile.name}
                </span>
                <button onClick={() => setShowHistory(true)} className="text-emerald-800 dark:text-emerald-400 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 px-2 py-0.5 rounded-lg text-[10px] font-black urdu-text">بل ریکارڈ</button>
                <button onClick={() => setShowBardana(true)} className="text-blue-800 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 px-2 py-0.5 rounded-lg text-[10px] font-black urdu-text">باردانہ ({bardanaStock})</button>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 text-[10px] font-bold border-b transition-colors urdu-text">لاگ آؤٹ</button>
              </div>
            </div>
          </div>

          <div className="flex items-center bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 shrink-0">
            <button onClick={() => setActiveTab('editor')} className={`px-8 py-3 rounded-xl font-black text-sm urdu-text transition-all ${activeTab === 'editor' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-slate-800'}`}>ایڈیٹر</button>
            <button onClick={() => setActiveTab('preview')} className={`px-8 py-3 rounded-xl font-black text-sm urdu-text transition-all ${activeTab === 'preview' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-slate-800'}`}>پیش نظارہ</button>
          </div>
        </header>

        <main className="relative mb-10">
          <div className={`${activeTab === 'editor' ? 'block' : 'hidden'}`}>
            <InvoiceForm 
              data={data} 
              onChange={setData} 
              onScan={() => isOnline ? setShowScanner(true) : alert('انٹرنیٹ ضروری ہے')} 
              onPrint={printInvoice}
              onSavePdf={printInvoice}
              onNewBill={resetData}
              onAutoIncrement={() => setData(prev => ({...prev, billNumber: generateNextBillNumber()}))}
            />
          </div>
          <div className={`${activeTab === 'preview' ? 'block' : 'hidden'}`}>
            <InvoiceView data={data} />
          </div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 no-print z-40 flex justify-center pointer-events-none">
          <div className="flex gap-2 w-full max-w-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-4 rounded-[2.5rem] border border-gray-200 dark:border-slate-800 shadow-2xl pointer-events-auto items-center">
            <button onClick={resetData} className="flex-1 py-4 bg-white dark:bg-slate-800 border-2 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-black rounded-3xl urdu-text">نیا بل</button>
            <button onClick={printInvoice} className="flex-[1.5] py-4 bg-emerald-600 text-white font-black rounded-3xl shadow-xl urdu-text">پرنٹ بل</button>
          </div>
        </div>

        {showScanner && <AIScanner onData={(d) => setData(prev => ({...prev, ...d}))} onClose={() => setShowScanner(false)} />}
        {showHistory && <BillHistory bills={history} onLoad={handleLoadBill} onDelete={handleDeleteBill} onClose={() => setShowHistory(false)} />}
        {showBardana && <BardanaManager logs={bardanaLogs} onAddLog={handleAddBardanaLog} onClose={() => setShowBardana(false)} />}
      </div>
    </div>
  );
};

export default App;

