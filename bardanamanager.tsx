
import React, { useState } from 'react';
import { BardanaLog } from '../types';

interface Props {
  logs: BardanaLog[];
  onAddLog: (log: BardanaLog) => void;
  onClose: () => void;
}

const BardanaManager: React.FC<Props> = ({ logs, onAddLog, onClose }) => {
  const [qty, setQty] = useState('');
  const [type, setType] = useState<'in' | 'out'>('in');
  const [note, setNote] = useState('');

  const totalStock = logs.reduce((acc, log) => acc + (log.type === 'in' ? log.quantity : -log.quantity), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qty) return;
    onAddLog({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type,
      quantity: Number(qty),
      note
    });
    setQty('');
    setNote('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-white/10 dark:border-slate-800">
        <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-emerald-900 text-white">
          <div>
            <h3 className="text-xl font-black urdu-text">باردانہ مینجمنٹ</h3>
            <p className="text-xs font-bold opacity-60">تھیلوں کا موجودہ اسٹاک: {totalStock}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 bg-gray-50 dark:bg-slate-950/50 border-b dark:border-slate-800 space-y-4">
          <div className="flex gap-2">
            <button type="button" onClick={() => setType('in')} className={`flex-1 py-3 rounded-xl font-black urdu-text transition-all ${type === 'in' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'bg-white dark:bg-slate-800 border dark:border-slate-700 text-gray-400 dark:text-slate-500'}`}>آیا (+)</button>
            <button type="button" onClick={() => setType('out')} className={`flex-1 py-3 rounded-xl font-black urdu-text transition-all ${type === 'out' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'bg-white dark:bg-slate-800 border dark:border-slate-700 text-gray-400 dark:text-slate-500'}`}>گیا (-)</button>
          </div>
          <div className="flex gap-2">
            <input type="number" placeholder="تعداد" className="w-24 p-3 rounded-xl border dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none font-black text-center focus:border-emerald-500" value={qty} onChange={(e) => setQty(e.target.value)} />
            <input type="text" placeholder="تفصیل درج کریں..." className="flex-1 p-3 rounded-xl border dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none urdu-text text-right font-bold focus:border-emerald-500" value={note} onChange={(e) => setNote(e.target.value)} />
            <button type="submit" className="bg-emerald-900 hover:bg-emerald-950 text-white px-6 rounded-xl font-black urdu-text transition-colors">درج کریں</button>
          </div>
        </form>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {logs.length === 0 ? (
            <p className="text-center py-10 text-gray-400 dark:text-slate-500 font-bold urdu-text opacity-60">کوئی ریکارڈ موجود نہیں</p>
          ) : (
            logs.slice().reverse().map(log => (
              <div key={log.id} className="bg-white dark:bg-slate-800 border dark:border-slate-700 p-3 rounded-2xl flex justify-between items-center transition-colors">
                <span className={`font-black ${log.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {log.type === 'in' ? '+' : '-'}{log.quantity}
                </span>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-800 dark:text-white urdu-text leading-tight">{log.note || "---"}</p>
                  <p className="text-[9px] font-bold text-gray-400 dark:text-slate-500">{log.date}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BardanaManager;


