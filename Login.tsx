
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface Props {
  onLogin: (profile: UserProfile) => void;
}

const OWNER_CODE = "Mandi786";
const STAFF_CODE = "Munshi123";

const Login: React.FC<Props> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [role, setRole] = useState<'owner' | 'staff'>('owner');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !phone || !address || !accessKey) {
      setError('براہ کرم تمام خانے پُر کریں۔');
      return;
    }

    if (role === 'owner' && accessKey !== OWNER_CODE) {
      setError('غلط مالک کوڈ!');
      return;
    }

    if (role === 'staff' && accessKey !== STAFF_CODE) {
      setError('غلط منشی کوڈ!');
      return;
    }

    onLogin({ name, phone, address, role });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-950 to-black p-4 rtl notranslate transition-colors duration-500" dir="rtl">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500 border border-white/20 dark:border-slate-800 relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600"></div>
        
        <div className="p-8 text-center space-y-2">
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400 shadow-inner">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m16-10a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white urdu-text tracking-tight">Mandi Pro</h2>
          <p className="text-gray-500 dark:text-gray-400 font-bold text-sm urdu-text opacity-80">سافٹ ویئر تک رسائی حاصل کریں</p>
        </div>

        <div className="flex px-8 gap-2 mb-4">
          <button 
            type="button"
            onClick={() => setRole('owner')}
            className={`flex-1 py-3 rounded-2xl font-black text-xs urdu-text transition-all ${role === 'owner' ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'}`}
          >مالک (Owner)</button>
          <button 
            type="button"
            onClick={() => setRole('staff')}
            className={`flex-1 py-3 rounded-2xl font-black text-xs urdu-text transition-all ${role === 'staff' ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'}`}
          >منشی (Staff)</button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-4">
          {error && <p className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs font-black text-center urdu-text border border-red-100 dark:border-red-900/40">{error}</p>}
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 urdu-text">دکان کا نام</label>
            <input className="w-full rounded-2xl border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 p-4 border font-bold text-gray-800 dark:text-white focus:border-emerald-500 outline-none urdu-text" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: شریف اینڈ سنز" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 urdu-text">فون نمبر</label>
            <input className="w-full rounded-2xl border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 p-4 border font-bold text-gray-800 dark:text-white focus:border-emerald-500 outline-none" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0300-1234567" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 urdu-text">پتہ / ایڈریس</label>
            <input className="w-full rounded-2xl border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 p-4 border font-bold text-gray-800 dark:text-white focus:border-emerald-500 outline-none urdu-text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="مثال: غلہ منڈی" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-amber-600 dark:text-amber-400 urdu-text">خفیہ رسائی کوڈ</label>
            <input type="password" placeholder="کوڈ درج کریں" className="w-full rounded-2xl border-amber-100 dark:border-amber-900/30 bg-amber-50/20 dark:bg-amber-900/10 p-4 border font-black text-gray-800 dark:text-white text-center tracking-widest outline-none" value={accessKey} onChange={(e) => setAccessKey(e.target.value)} />
          </div>

          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-3xl shadow-xl transition-all active:scale-95 urdu-text text-lg mt-4">لاگ ان کریں</button>
        </form>
      </div>
    </div>
  );
};

export default Login;

