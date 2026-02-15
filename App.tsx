
import React, { useState, useEffect, useCallback } from 'react';
import { InvoiceData, DEFAULT_INVOICE } from './types';
import InvoiceForm from './InvoiceForm';
import InvoiceView from './InvoiceView';
import AIScanner from './AIScanner';
import Login from './Login';
import BillHistory from './BillHistory';

const App: React.FC = () => {
  const [userProfile, setUserProfile] = useState<{name: string, phone: string, address: string} | null>(() => {
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

  const [showScanner, setShowScanner] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

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
    const currentNoStr = data.billNumber.toString().replace(/\D/g, '');
    const currentNo = parseInt(currentNoStr) || 0;
    const savedNo = parseInt((localStorage.getItem('last_bill_no') || '0').replace(/\D/g, '')) || 0;
    if (currentNo > savedNo) {
      localStorage.setItem('last_bill_no', data.billNumber);
    }
  }, [data]);

  useEffect(() => {
    localStorage.setItem('mandi_bill_history', JSON.stringify(history));
  }, [history]);

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

  const handleLogin = (profile: {name: string, phone: string, address: string}) => {
    localStorage.setItem('mandi_user_profile', JSON.stringify(profile));
    setUserProfile(profile);
  };

  const handleLogout = () => {
    if (confirm('کیا آپ لاگ آؤٹ کرنا چاہتے ہیں؟')) {
      localStorage.removeItem('mandi_user_profile');
      setUserProfile(null);
    }
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

  const saveAsPdf = () => {
    printInvoice();
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mandi Bill Pro',
          text: 'منڈی بلنگ کے لیے بہترین ایپ یہاں دیکھیں:',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share failed');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('لنک کاپی کر لیا گیا ہے!');
    }
  };

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert('یہ ایپ پہلے سے انسٹال ہے یا براؤزر اس کی اجازت نہیں دے رہا۔ براہ کرم "Add to Home Screen" مینو استعمال کریں۔');
    }
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
    const currentNo = parseInt(currentNoStr.replace(/\D/g, '')) || 1000;
    return (currentNo + 1).toString();
  }, [data.billNumber]);

  const resetData = () => {
    const nextNo = generateNextBillNumber();
    const freshInvoice: InvoiceData = {
      ...DEFAULT_INVOICE,
      shopName: userProfile?.name || '',
      phone: userProfile?.phone || '',
      address: userProfile?.address || '',
      billNumber: nextNo,
      date: new Date().toISOString().split('T')[0],
      items: [],
      weights: []
    };
    setData(freshInvoice);
    localStorage.setItem('last_bill_no', nextNo);
    setActiveTab('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadBill = (bill: InvoiceData) => {
    setData(bill);
    setShowHistory(false);
    setActiveTab('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteBill = (id: string) => {
    if (confirm('کیا آپ یہ ریکارڈ مستقل ختم کرنا چاہتے ہیں؟')) {
      setHistory(prev => prev.filter(b => b.id !== id));
    }
  };

  if (!userProfile) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen pb-40 px-4 md:px-8 pt-8 bg-gray-50 font-sans rtl text-right" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 no-print">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-200 relative group transition-transform hover:scale-105 shrink-0">
               <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M12 2c1 0 7 3 7 8.5C19 15.5 12 22 12 22s-7-6.5-7-11.5C5 5 11 2 12 2z" />
                 <path d="M12 22V12" />
                 <path d="M12 12l4-4" />
                 <path d="M12 12l-4-4" />
                 <circle cx="12" cy="10" r="2" />
               </svg>
               {!isOnline && (
                 <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center" title="Offline Mode">
                   <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26a5.5 5.5 0 017.615 7.615l-7.615-7.615z" /></svg>
                 </div>
               )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-1">Mandi Bill <span className="text-emerald-600">Pro</span></h1>
              <div className="flex flex-wrap items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-700 font-black text-xs uppercase tracking-wider">{userProfile.name}</span>
                <button onClick={() => setShowHistory(true)} className="text-emerald-800 bg-emerald-100/50 px-2 py-0.5 rounded-lg text-[10px] font-black hover:bg-emerald-100 transition-all urdu-text">بل ریکارڈ</button>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 text-[10px] font-bold border-b border-gray-200 transition-colors urdu-text">لاگ آؤٹ</button>
                <button onClick={shareLink} className="text-blue-500 hover:text-blue-600 text-[10px] font-black underline flex items-center gap-1 urdu-text">
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                   شیئر کریں
                </button>
              </div>
            </div>
            
            {deferredPrompt && (
              <button onClick={installApp} className="shrink-0 bg-blue-600 text-white text-[10px] font-black px-3 py-2 rounded-xl shadow-lg shadow-blue-100 flex items-center gap-1 animate-bounce">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                ایپ انسٹال کریں
              </button>
            )}
          </div>

          <div className="flex items-center bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 shrink-0">
            <button 
              onClick={() => setActiveTab('editor')}
              className={`px-8 py-3 rounded-xl font-black text-sm transition-all duration-200 urdu-text ${activeTab === 'editor' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
            >
              ایڈیٹر
            </button>
            <button 
              onClick={() => setActiveTab('preview')}
              className={`px-8 py-3 rounded-xl font-black text-sm transition-all duration-200 urdu-text ${activeTab === 'preview' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
            >
              پیش نظارہ
            </button>
          </div>
        </header>

        <main className="relative mb-10">
          <div className={`transition-all duration-500 ease-out ${activeTab === 'editor' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 absolute inset-0 pointer-events-none translate-y-10 scale-95'}`}>
            <InvoiceForm 
              data={data} 
              onChange={setData} 
              onScan={() => isOnline ? setShowScanner(true) : alert('انٹرنیٹ ضروری ہے')} 
              onPrint={printInvoice}
              onSavePdf={saveAsPdf}
              onNewBill={resetData}
              onAutoIncrement={() => setData(prev => ({...prev, billNumber: generateNextBillNumber()}))}
            />
          </div>

          <div className={`transition-all duration-500 ease-out ${activeTab === 'preview' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 absolute inset-0 pointer-events-none translate-y-10 scale-95'}`}>
            <InvoiceView data={data} />
          </div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 no-print z-50 flex justify-center pointer-events-none">
          <div className="flex gap-2 w-full max-w-xl bg-white/90 backdrop-blur-2xl p-4 rounded-[2.5rem] border border-gray-200 shadow-2xl pointer-events-auto items-center ring-1 ring-black/5 animate-in slide-in-from-bottom duration-700">
            <button 
              onClick={resetData} 
              className="flex-1 px-3 py-4 bg-white hover:bg-emerald-50 text-emerald-700 font-black rounded-3xl transition-all active:scale-95 flex items-center justify-center gap-2 border-2 border-emerald-100 shadow-sm group urdu-text"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
              نیا بل
            </button>
            <button 
              onClick={saveAsPdf} 
              className="flex-1 px-3 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-3xl shadow-xl shadow-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 urdu-text"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              PDF
            </button>
            <button 
              onClick={printInvoice} 
              className="flex-[1.5] px-4 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-3xl shadow-xl shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2 urdu-text"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              پرنٹ بل
            </button>
          </div>
        </div>

        {showScanner && (
          <AIScanner onData={(d) => setData(prev => ({...prev, ...d}))} onClose={() => setShowScanner(false)} />
        )}

        {showHistory && (
          <BillHistory 
            bills={history} 
            onLoad={handleLoadBill} 
            onDelete={handleDeleteBill} 
            onClose={() => setShowHistory(false)} 
          />
        )}
      </div>
    </div>
  );
};

export default App;
