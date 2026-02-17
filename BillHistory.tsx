
import React from 'react';
import { InvoiceData } from '../types';

interface Props {
  bills: InvoiceData[];
  onLoad: (bill: InvoiceData) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const BillHistory: React.FC<Props> = ({ bills, onLoad, onDelete, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/10 dark:border-slate-800">
        <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-950/50">
          <div>
            <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-400 urdu-text">سابقہ بل ریکارڈ</h3>
            <p className="text-xs font-bold text-gray-500 dark:text-slate-400">{bills.length} بل محفوظ ہیں</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all shadow-sm active:scale-90">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
          {bills.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-200 dark:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p className="font-black text-gray-400 urdu-text opacity-60">کوئی بل ریکارڈ میں نہیں ہے</p>
            </div>
          ) : (
            bills.map((bill) => {
              const totalBags = bill.items.reduce((acc, curr) => acc + curr.quantity, 0);
              const totalGross = bill.items.reduce((acc, curr) => acc + curr.weight, 0);
              return (
                <div key={bill.id} className="bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-900 p-4 rounded-3xl transition-all group flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-black text-[10px] px-2 py-0.5 rounded-full">بل #{bill.billNumber}</span>
                      <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500">{bill.date}</span>
                    </div>
                    <h4 className="font-black text-gray-800 dark:text-white text-lg leading-tight urdu-text">{bill.partyName || 'نامعلوم پارٹی'}</h4>
                    <div className="flex gap-4 mt-1 text-[11px] font-bold text-gray-500 dark:text-slate-400 urdu-text">
                      <span>تعداد: {totalBags}</span>
                      <span>وزن: {totalGross} کلو</span>
                      {bill.ratePerMaund > 0 && <span>ریٹ: {bill.ratePerMaund}</span>}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onLoad(bill)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2 rounded-xl transition-all active:scale-95 urdu-text"
                    >
                      دیکھیں
                    </button>
                    <button 
                      onClick={() => bill.id && onDelete(bill.id)}
                      className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-400 dark:text-red-500 p-2 rounded-xl transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-slate-950/50 border-t dark:border-slate-800">
          <p className="text-[10px] text-center font-bold text-gray-400 dark:text-slate-500 urdu-text opacity-60">تمام ریکارڈ آپ کے براؤزر کی میموری میں محفوظ ہے</p>
        </div>
      </div>
    </div>
  );
};

export default BillHistory;

