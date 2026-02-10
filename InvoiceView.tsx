
import React from 'react';
import { InvoiceData } from './types';

interface Props {
  data: InvoiceData;
}

const InvoiceView: React.FC<Props> = ({ data }) => {
  const totalBags = data.items.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalKattWeight = data.items.reduce((acc, curr) => acc + (curr.quantity * curr.katt), 0);
  
  const totalItemsWeight = data.items.reduce((acc, curr) => acc + curr.weight, 0);
  const totalManualWeights = data.weights.reduce((acc, curr) => acc + curr.weight, 0);
  
  const finalGrossWeight = totalItemsWeight > 0 ? totalItemsWeight : totalManualWeights;
  const activeNetWeight = finalGrossWeight - totalKattWeight;
  
  const totalGrossAmount = data.items.reduce((acc, item) => {
    const itemNetWeight = item.weight - (item.quantity * item.katt);
    const itemNetMaunds = itemNetWeight / 40;
    return acc + (itemNetMaunds * item.rate);
  }, 0);

  const netMaundsTotal = activeNetWeight / 40;
  const maunds = Math.floor(netMaundsTotal);
  const kgs = Math.round((netMaundsTotal - maunds) * 40);

  const commission = (totalGrossAmount * Math.abs(data.commissionRate)) / 100;
  const khaliBardana = totalBags * (data.khaliBardanaRate || 0);
  const brokerage = netMaundsTotal * (data.brokerageRate || 0);
  const customExpensesTotal = (data.customExpenses || []).reduce((acc, e) => acc + e.amount, 0);
  const otherDeductions = khaliBardana + brokerage + (data.laborCharges || 0) + (data.biltyCharges || 0) + customExpensesTotal;
  
  let netPayable = totalGrossAmount - otherDeductions;
  if (data.commissionImpact === 'plus') {
    netPayable += commission;
  } else {
    netPayable -= commission;
  }

  return (
    <div className="print-container bg-white p-4 sm:p-6 md:p-8 rounded-3xl shadow-xl border-t-8 border-gray-800 mx-auto max-w-[800px] print:max-w-[76mm] print:p-0 print:m-0 print:shadow-none print:border-none print:rounded-none overflow-visible font-sans rtl" dir="rtl">
      
      {/* Header - Scaled Up Fonts (+5pt approx) */}
      <div className="text-center mb-4 pb-2 border-b-2 border-dashed border-black/20 print:border-black/50">
        <h1 className="text-2xl sm:text-5xl font-black text-gray-900 mb-1 print:text-xl urdu-text">{data.shopName || 'مل / شاپ کا نام'}</h1>
        <p className="text-sm sm:text-xl font-bold text-gray-700 mb-1 print:text-[14px] urdu-text">{data.address || 'ایڈریس درج نہیں ہے'}</p>
        <div className="text-gray-900 font-black text-lg print:text-[15px] urdu-text">
          <span>فون: {data.phone || 'فون نمبر'}</span>
        </div>
      </div>

      {/* Info Section - Increased Spacing & Font */}
      <div className="grid grid-cols-2 gap-x-1 mb-4 print:mb-2 text-xs sm:text-xl print:text-[14px] leading-relaxed urdu-text px-1">
        <div className="space-y-1.5 text-right">
          <p className="font-bold">بل نمبر: <span className="font-black">{data.billNumber || '---'}</span></p>
          <p className="font-bold">تاریخ: <span className="font-black">{data.date}</span></p>
        </div>
        <div className="text-right space-y-1.5 border-r border-black/10 pr-2 print:border-black/30">
          <p className="font-bold">پارٹی: <span className="font-black">{data.partyName || '---'}</span></p>
          <p className="font-bold">گاڑی: <span className="font-black">{data.trolleyNo || '---'}</span></p>
        </div>
      </div>

      <div className="hidden print:block border-t border-dashed border-black/30 my-2"></div>

      {/* Weight Grid - Bigger Text */}
      <div className="bg-emerald-50/50 p-2 rounded-xl mb-3 border border-emerald-100 print:bg-transparent print:p-0 print:border-none print:mb-2">
        <div className="grid grid-cols-3 gap-1 text-center text-xs sm:text-lg print:text-[13px] urdu-text">
          <div className="flex flex-col">
            <span className="font-bold opacity-60 print:opacity-100">کل نول</span>
            <span className="font-black">{totalBags}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold opacity-60 print:opacity-100">کل کٹوتی</span>
            <span className="font-black text-red-600 print:text-black">-{totalKattWeight}k</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold opacity-60 print:opacity-100">صافی وزن</span>
            <span className="font-black text-emerald-700 print:text-black leading-tight">
              {maunds} من {kgs > 0 ? `${kgs} کلو` : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="hidden print:block border-t border-dashed border-black/30 my-2"></div>

      {/* Table - Optimized Width to prevent Cutoff */}
      <div className="mb-4 print:mb-2">
        <table className="w-full text-right text-[11px] sm:text-lg print:text-[12px] border-collapse urdu-text">
          <thead>
            <tr className="border-b-2 border-gray-800 bg-gray-50 print:bg-transparent print:border-black">
              <th className="py-2 px-0.5 text-center font-black">نول</th>
              <th className="py-2 px-0.5 font-black text-right">آئٹم</th>
              <th className="py-2 px-0.5 text-center font-black">وزن</th>
              <th className="py-2 px-0.5 text-center font-black">ریٹ</th>
              <th className="py-2 px-0.5 text-left font-black">رقم</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, idx) => {
              const itemNetWeight = item.weight - (item.quantity * item.katt);
              const itemNetMaunds = itemNetWeight / 40;
              const itemAmount = itemNetMaunds * item.rate;
              return (
                <tr key={idx} className="border-b border-gray-100 print:border-dashed print:border-black/20">
                  <td className="py-2.5 px-0.5 text-center font-bold">{item.quantity}</td>
                  <td className="py-2.5 px-0.5 text-right font-black">{item.description}</td>
                  <td className="py-2.5 px-0.5 text-center font-bold">{itemNetWeight}k</td>
                  <td className="py-2.5 px-0.5 text-center font-bold">@{item.rate}</td>
                  <td className="py-2.5 px-0.5 text-left font-black">{itemAmount.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Deductions - Increased Font and Vertical Spacing */}
      <div className="space-y-2 text-[10px] sm:text-lg print:text-[13px] mb-4 print:mb-2 urdu-text border-t-2 border-black/10 pt-2 px-1">
          <div className="flex justify-between items-center">
            <span>کمیشن ({data.commissionRate}%):</span>
            <span className="font-bold">-{commission.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
          </div>
          {data.khaliBardanaRate > 0 && (
            <div className="flex justify-between items-center">
              <span>خالی باردانہ (@{data.khaliBardanaRate}):</span>
              <span className="font-bold">-{khaliBardana.toLocaleString()}</span>
            </div>
          )}
          {data.laborCharges > 0 && (
            <div className="flex justify-between items-center">
              <span>مزدوری:</span>
              <span className="font-bold">-{data.laborCharges.toLocaleString()}</span>
            </div>
          )}
          {data.biltyCharges > 0 && (
            <div className="flex justify-between items-center">
              <span>بلٹی کرایہ:</span>
              <span className="font-bold">-{data.biltyCharges.toLocaleString()}</span>
            </div>
          )}
          {data.customExpenses && data.customExpenses.map(exp => (
            <div key={exp.id} className="flex justify-between items-center">
              <span>{exp.name}:</span>
              <span className="font-bold">-{exp.amount.toLocaleString()}</span>
            </div>
          ))}
      </div>

      <div className="hidden print:block border-t-2 border-dashed border-black/40 my-2"></div>

      {/* Final Amount - Bold and Clear */}
      <div className="bg-gray-900 text-white p-3 rounded-2xl text-center print:bg-transparent print:text-black print:p-0 urdu-text">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 print:opacity-100 mb-1">کل صافی ادائیگی</p>
        <p className="text-2xl sm:text-5xl font-black print:text-2xl print:leading-none">Rs {netPayable.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
      </div>

      {/* Footer - Final Marker */}
      <div className="mt-6 print:mt-4 text-center text-[11px] print:text-[12px] font-bold space-y-4 urdu-text">
        <div className="flex justify-between gap-4 px-1 border-t-2 border-black/10 pt-3 print:border-black/50">
           <span>دستخط پارٹی</span>
           <span>منجانب {data.shopName}</span>
        </div>
        <p className="pt-2 italic text-emerald-800 print:text-black font-black border-t border-dashed border-black/10 mt-4">Mandi Bill Pro سافٹ ویئر</p>
      </div>
      {/* Explicit end of document for thermal printers */}
    </div>
  );
};

export default InvoiceView;

