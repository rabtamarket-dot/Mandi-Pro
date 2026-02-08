
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
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-xl font-black text-emerald-900">????? ?? ?????? (Bill History)</h3>
            <p className="text-xs font-bold text-gray-500">{bills.length} ?? ????? ???</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-full transition-colors shadow-sm">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
          {bills.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p className="font-black text-gray-400">???? ?? ?????? ??? ???? ??</p>
            </div>
          ) : (
            bills.map((bill) => {
              const totalBags = bill.items.reduce((acc, curr) => acc + curr.quantity, 0);
              const totalGross = bill.weights.reduce((acc, curr) => acc + curr.weight, 0);
              return (
                <div key={bill.id} className="bg-white border-2 border-gray-100 hover:border-emerald-200 p-4 rounded-3xl transition-all group flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="bg-emerald-100 text-emerald-700 font-black text-[10px] px-2 py-0.5 rounded-full">?? #{bill.billNumber}</span>
                      <span className="text-[10px] font-bold text-gray-400">{bill.date}</span>
                    </div>
                    <h4 className="font-black text-gray-800 text-lg leading-tight">{bill.partyName || '??????? ?????'}</h4>
                    <div className="flex gap-4 mt-1 text-[11px] font-bold text-gray-500">
                      <span>?????: {totalBags}</span>
                      <span>???: {totalGross} ???</span>
                      {bill.ratePerMaund > 0 && <span>???: {bill.ratePerMaund}</span>}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onLoad(bill)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2 rounded-xl transition-all active:scale-95"
                    >
                      ??????
                    </button>
                    <button 
                      onClick={() => bill.id && onDelete(bill.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-400 p-2 rounded-xl transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <div className="p-4 bg-gray-50 border-t">
          <p className="text-[10px] text-center font-bold text-gray-400">???? ?????? ?? ?? ?????? ?? ?????? ??? ????? ??</p>
        </div>
      </div>
    </div>
  );
};

export default BillHistory;
