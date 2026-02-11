
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
    <div className="print-container bg-white p-4 sm:p-10 rounded-3xl shadow-xl border-t-8 border-gray-800 mx-auto max-w-[800px] print:max-w-[80mm] print:p-0 print:m-0 print:shadow-none print:border-none print:rounded-none overflow-visible font-sans rtl text-center" dir="rtl">
      
      {/* Shop Header - Centered & Large */}
      <div className="mb-4 pb-2 border-b-2 border-dashed border-black/20 print:border-black/50 text-center">
        <h1 className="text-3xl sm:text-6xl font-black text-gray-900 mb-2 print:text-3xl urdu-text">{data.shopName || 'مل / شاپ کا نام'}</h1>
        <p className="text-base sm:text-2xl font-bold text-gray-700 mb-1 print:text-[20px] urdu-text">{data.address || 'ایڈریس درج نہیں ہے'}</p>
        <div className="text-gray-900 font-black text-xl print:text-[22px] urdu-text">
          <span>فون: {data.phone || 'فون نمبر'}</span>
        </div>
      </div>

      {/* Bill/Party Info - Centered */}
      <div className="flex flex-col items-center mb-4 print:mb-2 text-sm sm:text-2xl print:text-[18px] urdu-text border-b border-black/10 pb-2 print:pb-1">
          <p className="font-bold">بل نمبر: <span className="font-black">{data.billNumber || '---'}</span> | تاریخ: <span className="font-black">{data.date}</span></p>
          <p className="font-bold mt-1">پارٹی: <span className="font-black">{data.partyName || '---'}</span></p>
          <p className="font-bold">گاڑی نمبر: <span className="font-black">{data.trolleyNo || '---'}</span></p>
      </div>

      {/* Summary Summary - Center Stats */}
      <div className="bg-emerald-50/50 p-3 rounded-xl mb-4 border border-emerald-100 print:bg-transparent print:p-0 print:border-none print:mb-2 text-center">
        <div className="grid grid-cols-3 gap-2 text-[12px] sm:text-xl print:text-[17px] urdu-text">
          <div className="flex flex-col">
            <span className="font-bold opacity-70 print:opacity-100">کل نول</span>
            <span className="font-black">{totalBags}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold opacity-70 print:opacity-100">کل کٹوتی</span>
            <span className="font-black text-red-600 print:text-black">-{totalKattWeight % 1 === 0 ? totalKattWeight : totalKattWeight.toFixed(3)}k</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold opacity-70 print:opacity-100">صافی وزن</span>
            <span className="font-black text-emerald-800 print:text-black">{maunds} من {kgs > 0 ? `${kgs} کلو` : ''}</span>
          </div>
        </div>
      </div>

      <div className="hidden print:block border-t border-dashed border-black/30 my-3"></div>

      {/* Items Section - Centered with Amount on 2nd Line */}
      <div className="mb-4 print:mb-2 urdu-text text-center px-2">
        {data.items.map((item, idx) => {
          const itemNetWeight = item.weight - (item.quantity * item.katt);
          const itemNetMaunds = itemNetWeight / 40;
          const itemAmount = itemNetMaunds * item.rate;
          return (
            <div key={idx} className="border-b border-gray-100 print:border-dashed print:border-black/20 py-3 print:py-2">
              {/* Line 1: Basic Info Centered */}
              <div className="flex justify-center items-center gap-4 text-[13px] sm:text-xl print:text-[18px] font-bold">
                 <span className="bg-gray-100 print:bg-transparent px-2 rounded">نول: {item.quantity}</span>
                 <span className="font-black underline underline-offset-4">{item.description}</span>
                 <span>وزن: {itemNetWeight % 1 === 0 ? itemNetWeight : itemNetWeight.toFixed(3)}k</span>
              </div>
              {/* Line 2: Rate and Amount - Explicitly Separated */}
              <div className="flex flex-col items-center mt-2 space-y-1">
                 <span className="text-[13px] print:text-[17px] opacity-70">ریٹ: Rs {item.rate} فی من</span>
                 <span className="text-[16px] sm:text-2xl print:text-[20px] font-black bg-gray-50 print:bg-transparent px-4 py-1 rounded-lg">
                    رقم: {itemAmount.toLocaleString(undefined, {maximumFractionDigits: 0})} /-
                 </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deductions - Centered Spacing */}
      <div className="space-y-2 text-[11px] sm:text-xl print:text-[17px] mb-4 print:mb-2 urdu-text border-t-2 border-black/10 pt-3 px-2">
          <div className="flex justify-between items-center">
            <span>کمیشن ({data.commissionRate}%):</span>
            <span className="font-bold">-{commission.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
          </div>
          {data.khaliBardanaRate > 0 && (
            <div className="flex justify-between items-center">
              <span>خالی باردانہ:</span>
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

      <div className="hidden print:block border-t-2 border-dashed border-black/40 my-3"></div>

      {/* Final Total - Huge & Centered */}
      <div className="bg-gray-900 text-white p-4 rounded-2xl text-center print:bg-transparent print:text-black print:p-0 urdu-text">
        <p className="text-[12px] font-bold uppercase tracking-widest opacity-70 print:opacity-100 mb-1">کل صافی ادائیگی</p>
        <p className="text-4xl sm:text-7xl font-black print:text-4xl print:leading-none">Rs {netPayable.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
      </div>

      {/* Footer & Software Mark */}
      <div className="mt-10 print:mt-6 text-center urdu-text space-y-8">
        <div className="flex justify-between gap-4 px-4 border-t-2 border-black/10 pt-6 print:border-black/50 text-[12px] sm:text-xl print:text-[17px] font-bold">
           <div className="flex-1">دستخط پارٹی</div>
           <div className="flex-1 border-r border-black/10 pr-4">منجانب {data.shopName}</div>
        </div>
        
        {/* Strictly the last line - page ends here */}
        <p className="text-[16px] sm:text-2xl print:text-[18px] italic text-emerald-800 print:text-black font-black pt-5 border-t border-dashed border-black/20">
          Mandi Bill Pro سافٹ ویئر
        </p>
      </div>
    </div>
  );
};

export default InvoiceView;

