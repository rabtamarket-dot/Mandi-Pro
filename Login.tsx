
import React, { useState } from 'react';

interface Props {
  onLogin: (profile: { name: string, phone: string, address: string }) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && phone && address) {
      onLogin({ name, phone, address });
    } else {
      alert('???? ??? ???? ???? ??? ?????');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 to-emerald-950 p-4 rtl">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="p-8 sm:p-10 text-center space-y-2">
          <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900">??? ?????!</h2>
          <p className="text-gray-500 font-bold text-sm">???? ???? ?? ?? ????? ????</p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-1">?? / ??? ?? ???</label>
            <input
              type="text"
              placeholder="????: ???? ???? ???"
              className="w-full rounded-2xl border-gray-100 bg-gray-50 p-4 border font-bold text-gray-800 focus:border-emerald-500 focus:bg-white transition-all outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-1">??? ????</label>
            <input
              type="text"
              placeholder="0300-1234567"
              className="w-full rounded-2xl border-gray-100 bg-gray-50 p-4 border font-bold text-gray-800 focus:border-emerald-500 focus:bg-white transition-all outline-none"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-1">?????? / ???</label>
            <input
              type="text"
              placeholder="????: ??? ??? ????? ????????"
              className="w-full rounded-2xl border-gray-100 bg-gray-50 p-4 border font-bold text-gray-800 focus:border-emerald-500 focus:bg-white transition-all outline-none"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-3xl shadow-xl shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg mt-4"
          >
            ???? ????
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
