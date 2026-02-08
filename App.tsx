
import React, { useState, useEffect, useCallback } from 'react';
import { InvoiceData, DEFAULT_INVOICE } from './types';
import InvoiceForm from './components/InvoiceForm';
import InvoiceView from './components/InvoiceView';
import AIScanner from './components/AIScanner';
import Login from './components/Login';
import BillHistory from './components/BillHistory';

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
    if (confirm('??? ?? ??? ??? ???? ????? ????')) {
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
    if (confirm('??? ?? ?? ?????? ????? ??? ???? ????? ????')) {
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
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-200 relative">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 00-2 2z" /></svg>
               {!isOnline && (
                 <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white" title="Offline Mode"></div>
               )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Mandi Bill Pro</h1>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold text-xs">{userProfile.name}</span>
                <button onClick={() => setShowHistory(true)} className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-black hover:bg-emerald-100 transition-colors">?? ??????</button>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 text-[10px] font-bold border-b border-gray-200">??? ???</button>
              </div>
            </div>
          </div>

          <div className="flex items-center bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200">
            <button 
              onClick={() => setActiveTab('editor')}
              className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'editor' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-gray-500 hover:text-emerald-600'}`}
            >
              ??????
            </button>
            <button 
              onClick={() => setActiveTab('preview')}
              className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'preview' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-gray-500 hover:text-emerald-600'}`}
            >
              ??? ?????
            </button>
          </div>
        </header>

        <main className="relative mb-10">
          <div className={`transition-all duration-300 ${activeTab === 'editor' ? 'opacity-100 translate-x-0' : 'opacity-0 absolute inset-0 pointer-events-none translate-x-10'}`}>
            <InvoiceForm 
              data={data} 
              onChange={setData} 
              onScan={() => isOnline ? setShowScanner(true) : alert('??????? ????? ??')} 
              onPrint={printInvoice}
              onNewBill={resetData}
              onAutoIncrement={() => setData(prev => ({...prev, billNumber: generateNextBillNumber()}))}
            />
          </div>

          <div className={`transition-all duration-300 ${activeTab === 'preview' ? 'opacity-100 translate-x-0' : 'opacity-0 absolute inset-0 pointer-events-none -translate-x-10'}`}>
            <InvoiceView data={data} />
          </div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 no-print z-50 flex justify-center pointer-events-none">
          <div className="flex gap-4 w-full max-w-lg bg-white/95 backdrop-blur-2xl p-4 rounded-[2.5rem] border border-gray-100 shadow-2xl pointer-events-auto items-center ring-1 ring-black/5">
            <button 
              onClick={resetData} 
              className="flex-1 px-4 py-4 bg-white hover:bg-emerald-50 text-emerald-700 font-black rounded-3xl transition-all active:scale-95 flex items-center justify-center gap-2 border-2 border-emerald-100 shadow-sm group"
            >
              <div className="bg-emerald-100 p-1.5 rounded-full group-hover:rotate-90 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
              </div>
              ??? ??
            </button>
            <button 
              onClick={printInvoice} 
              className="flex-[2] px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-3xl shadow-xl shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              ???? ??
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
