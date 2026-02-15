
import React, { useState } from 'react';

interface Props {
  onLogin: (profile: { name: string, phone: string, address: string }) => void;
}

// آپ یہاں اپنی مرضی کا خفیہ کوڈ بدل سکتے ہیں
const MASTER_ACCESS_CODE = "Mandi786";

const Login: React.FC<Props> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !phone || !address || !accessKey) {
      setError('براہ کرم تمام خانے پُر کریں۔');
      return;
    }

    if (accessKey !== MASTER_ACCESS_CODE) {
      setError('غلط رسائی کوڈ! براہ کرم مالک سے درست کوڈ حاصل کریں۔');
      return;
    }

    onLogin({ name, phone, address });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 to-emerald-950 p-4 rtl notranslate" dir="rtl">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500 border border-white/20">
        <div className="p-8 sm:p-10 text-center space-y-2">
          <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-inner">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900 urdu-text">خوش آمدید!</h2>
          <p className="text-gray-500 font-bold text-sm urdu-text">ایپ استعمال کرنے کے لیے رجسٹر ہوں</p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-black text-center border border-red-100 animate-bounce">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-1 urdu-text">مل / شاپ کا نام</label>
            <input
              type="text"
              placeholder="مثال: شریف اینڈ سنز"
              className="w-full rounded-2xl border-gray-100 bg-gray-50 p-4 border font-bold text-gray-800 focus:border-emerald-500 focus:bg-white transition-all outline-none urdu-text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-1 urdu-text">فون نمبر</label>
            <input
              type="text"
              placeholder="0300-1234567"
              className="w-full rounded-2xl border-gray-100 bg-gray-50 p-4 border font-bold text-gray-800 focus:border-emerald-500 focus:bg-white transition-all outline-none"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-1 urdu-text">ایڈریس / پتہ</label>
            <input
              type="text"
              placeholder="مثال: غلہ منڈی، بہاولنگر"
              className="w-full rounded-2xl border-gray-100 bg-gray-50 p-4 border font-bold text-gray-800 focus:border-emerald-500 focus:bg-white transition-all outline-none urdu-text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest px-1 urdu-text">خفیہ رسائی کوڈ (Access Key)</label>
            <div className="relative">
              <input
                type="password"
                placeholder="مالک سے کوڈ حاصل کریں"
                className="w-full rounded-2xl border-amber-100 bg-amber-50/30 p-4 border font-black text-gray-800 focus:border-amber-500 focus:bg-white transition-all outline-none urdu-text"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-3xl shadow-xl shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg mt-4"
          >
            <span className="urdu-text">لاگ ان کریں</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </form>
        
        <div className="bg-gray-50 p-4 text-center">
          <p className="text-[9px] font-bold text-gray-400 urdu-text opacity-70">صرف مجاز صارفین کے لیے محفوظ رسائی</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

