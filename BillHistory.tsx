
import React from 'react';
import { InvoiceData } from './types';

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
        
        {/* Header */}
        <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-950/50">
          <div className="text-right">
            <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-400 urdu-text leading-tight">سابقہ بل ریکارڈ (Bill History)</h3>
            <p className="text-xs font-bold text-gray-500 dark:text-slate-400 urdu-text">{bills.length} بل محفوظ ہیں</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all shadow-sm active:scale-90 group"
          >
            <svg className="w-6 h-6 text-gray-400 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3 bg-white dark:bg-slate-900">
          {bills.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-emerald-200 dark:text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="font-black text-gray-400 dark:text-slate-600 urdu-text text-lg">کوئی بل ریکارڈ میں نہیں ہے</p>
              <p className="text-xs text-gray-400 dark:text-slate-700 mt-2 urdu-text">نیا بل بنانے کے لیے ایڈیٹر استعمال کریں</p>
            </div>
          ) : (
            bills.map((bill) => {
              const totalBags = bill.items.reduce((acc, curr) => acc + curr.quantity, 0);
              const totalGross = bill.items.reduce((acc, curr) => acc + curr.weight, 0);
              return (
                <div 
                  key={bill.id} 
                  className="bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900/50 p-4 rounded-3xl transition-all group flex items-center justify-between gap-4 shadow-sm hover:shadow-md"
                >
                  <div className="flex-1 text-right">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-tight">
                        بل #{bill.billNumber}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500">
                        {bill.date}
                      </span>
                    </div>
                    <h4 className="font-black text-gray-800 dark:text-white text-lg leading-tight urdu-text mb-2">
                      {bill.partyName || 'نامعلوم پارٹی'}
                    </h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-bold text-gray-500 dark:text-slate-400 urdu-text">
                      <span className="flex items-center gap-1"><span className="opacity-50">تعداد:</span> <span className="text-emerald-600 dark:text-emerald-400">{totalBags}</span></span>
                      <span className="flex items-center gap-1"><span className="opacity-50">وزن:</span> <span className="text-emerald-600 dark:text-emerald-400">{totalGross.toFixed(2)} کلو</span></span>
                      {bill.ratePerMaund > 0 && <span className="flex items-center gap-1"><span className="opacity-50">ریٹ:</span> <span className="text-emerald-600 dark:text-emerald-400">{bill.ratePerMaund}</span></span>}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button 
                      onClick={() => onLoad(bill)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-6 py-2.5 rounded-xl transition-all active:scale-95 urdu-text shadow-lg shadow-emerald-200 dark:shadow-none"
                    >
                      دیکھیں
                    </button>
                    <button 
                      onClick={() => bill.id && onDelete(bill.id)}
                      className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-400 dark:text-red-500 p-2.5 rounded-xl transition-all"
                      title="ڈیلیٹ کریں"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-slate-950/50 border-t dark:border-slate-800 text-center">
          <p className="text-[10px] font-bold text-gray-400 dark:text-slate-600 urdu-text opacity-80">
            تمام ریکارڈ آپ کے براؤزر کی میموری میں محفوظ ہے
          </p>
        </div>
      </div>
    </div>
  );
};

export default BillHistory;

