
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

  // --- Deduction Logic ---
  const commission = (totalGrossAmount * Math.abs(data.commissionRate)) / 100;
  const laborRate = Number(data.laborCharges) || 0;
  const laborTotal = totalBags * laborRate;
  
  const bardanaRate = Number(data.khaliBardanaRate) || 0;
  const bardanaTotal = totalBags * bardanaRate;
  
  const brokerage = netMaundsTotal * (Number(data.brokerageRate) || 0);
  const bilty = Number(data.biltyCharges) || 0;

  const customSubtracts = (data.customExpenses || []).filter(e => e.impact === 'minus');
  const otherSubtractsTotal = customSubtracts.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

  const totalAllDeductions = commission + laborTotal + bardanaTotal + brokerage + bilty + otherSubtractsTotal;

  // --- Addition Logic ---
  const customAdditions = (data.customExpenses || []).filter(e => e.impact === 'plus');
  const additionsTotal = customAdditions.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

  const netPayable = totalGrossAmount + additionsTotal - totalAllDeductions;

  return (
    <div className="print-container bg-white p-4 sm:p-6 rounded-3xl shadow-xl border-t-8 border-gray-800 mx-auto max-w-[800px] print:max-w-full print:p-0 print:m-0 print:shadow-none print:border-none print:rounded-none overflow-hidden font-sans rtl text-center" dir="rtl">
      
      {/* Header */}
      <div className="mb-4 pb-2 border-b-2 border-dashed border-black/20 print:border-black/50 text-center space-y-1">
        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 mb-2 print:text-2xl urdu-text leading-tight">{data.shopName || 'مل / شاپ کا نام'}</h1>
        <p className="text-lg sm:text-xl font-bold text-gray-700 print:text-[12px] urdu-text">{data.address || 'ایڈریس درج نہیں ہے'}</p>
        <div className="text-gray-900 font-black text-xl print:text-[14px] urdu-text">
          <span>فون: {data.phone || 'فون نمبر'}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black/30 my-2 print:my-1"></div>

      {/* Bill Info */}
      <div className="mb-4 print:mb-2 text-base sm:text-xl print:text-[14px] urdu-text border-b border-black/10 pb-2 flex justify-center gap-4">
          <p className="font-bold">بل نمبر: <span className="font-black">{data.billNumber || '---'}</span></p>
          <span className="opacity-30">|</span>
          <p className="font-bold">تاریخ: <span className="font-black">{data.date}</span></p>
      </div>

      {/* Party Details */}
      <div className="text-center space-y-1 mb-4 print:mb-3 urdu-text text-lg sm:text-2xl print:text-[16px]">
          <p className="font-bold">پارٹی کا نام: <span className="font-black border-b-2 border-dotted border-gray-300">{data.partyName || '---'}</span></p>
          {data.brokerName && <p className="font-bold">بروکر: <span className="font-black border-b-2 border-dotted border-gray-300">{data.brokerName}</span></p>}
          <p className="font-bold">گاڑی نمبر: <span className="font-black">{data.trolleyNo || '---'}</span></p>
      </div>

      {/* Weights Summary Row */}
      <div className="border-y-2 border-dashed border-black/40 py-2 mb-4 print:mb-2 text-center">
        <div className="grid grid-cols-3 gap-1 text-[12px] sm:text-xl print:text-[14px] urdu-text">
          <div className="flex flex-col border-l border-black/10">
            <span className="font-bold opacity-70 print:opacity-100">کل تعداد</span>
            <span className="font-black text-2xl print:text-lg">{totalBags}</span>
          </div>
          <div className="flex flex-col border-l border-black/10">
            <span className="font-bold opacity-70 print:opacity-100">کل کٹوتی</span>
            <span className="font-black text-2xl print:text-lg text-red-600 print:text-black">-{totalKattWeight.toFixed(2)}k</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold opacity-70 print:opacity-100">صافی وزن</span>
            <span className="font-black text-2xl print:text-lg text-emerald-800 print:text-black">{maunds} من {kgs > 0 ? `${kgs} کلو` : ''}</span>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="mb-4 print:mb-3 urdu-text text-center px-1">
        {data.items.map((item, idx) => {
          const itemNetWeight = item.weight - (item.quantity * item.katt);
          const itemNetMaunds = itemNetWeight / 40;
          const itemAmount = itemNetMaunds * item.rate;
          return (
            <div key={idx} className="border-b border-dashed border-black/10 py-4 print:py-2">
              <div className="flex justify-center items-center gap-3 text-lg sm:text-2xl print:text-[16px] font-black">
                 <span>{item.quantity} {item.description}</span>
                 <span>وزن: <span>{itemNetWeight.toFixed(2)}k</span></span>
              </div>
              <div className="mt-1">
                 <span className="text-2xl sm:text-3xl print:text-[20px] font-black block py-1">
                    Rs {itemAmount.toLocaleString(undefined, {maximumFractionDigits: 0})} /-
                 </span>
                 <p className="text-xs sm:text-lg print:text-[12px] opacity-70">ریٹ: Rs {item.rate} فی من</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Account Additions (+) */}
      {additionsTotal > 0 && (
        <div className="mb-4 print:mb-2 urdu-text px-1 text-right border-t border-black/10 pt-2">
          <h3 className="text-sm font-black border-b border-blue-200 mb-2 text-blue-800 print:text-black">رقم جمع (+)</h3>
          <div className="space-y-1 text-sm sm:text-xl print:text-[13px]">
            {customAdditions.map(exp => (
              <div key={exp.id} className="flex justify-between items-center">
                <span>{exp.name}:</span>
                <span className="font-bold text-blue-700 print:text-black">+{exp.amount.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-1 border-t border-blue-100 font-black text-blue-900 print:text-black">
              <span>کل جمع شدہ:</span>
              <span>Rs {additionsTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Account Deductions (-) */}
      <div className="mb-4 print:mb-2 urdu-text px-1 text-right border-t border-black/10 pt-2">
        <h3 className="text-sm font-black border-b border-red-200 mb-2 text-red-800 print:text-black">رقم کٹوتی (-)</h3>
        <div className="space-y-1 text-sm sm:text-xl print:text-[13px]">
          <div className="flex justify-between items-center">
            <span>کمیشن ({data.commissionRate}%):</span>
            <span className="font-bold">-{commission.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
          </div>
          {laborTotal > 0 && (
            <div className="flex justify-between items-center">
              <span>مزدوری ({totalBags} تھیلے × {laborRate}):</span>
              <span className="font-bold">-{laborTotal.toLocaleString()}</span>
            </div>
          )}
          {bardanaTotal > 0 && (
            <div className="flex justify-between items-center">
              <span>خالی باردانہ ({totalBags} تھیلے × {bardanaRate}):</span>
              <span className="font-black">-{bardanaTotal.toLocaleString()}</span>
            </div>
          )}
          {brokerage > 0 && (
            <div className="flex justify-between items-center">
              <span>بروکری:</span>
              <span className="font-black">-{brokerage.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
            </div>
          )}
          {bilty > 0 && (
            <div className="flex justify-between items-center">
              <span>بلٹی کرایہ:</span>
              <span className="font-bold">-{bilty.toLocaleString()}</span>
            </div>
          )}
          {customSubtracts.map(exp => (
            <div key={exp.id} className="flex justify-between items-center">
              <span>{exp.name}:</span>
              <span className="font-bold text-red-700 print:text-black">-{exp.amount.toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-1 border-t border-red-100 font-black text-red-900 print:text-black">
            <span>کل کٹوتی (اخراجات):</span>
            <span>Rs {totalAllDeductions.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-dashed border-black/50 my-4 print:my-2"></div>

      {/* Total Section */}
      <div className="text-center urdu-text py-2">
        <p className="text-base sm:text-xl print:text-[14px] font-bold opacity-70 mb-1">کل صافی قابلِ ادائیگی رقم</p>
        <p className="text-4xl sm:text-6xl font-black print:text-[30px] text-gray-900">Rs {netPayable.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
      </div>

      <div className="border-t-2 border-dashed border-black/40 my-4 print:my-2"></div>

      {/* Footer */}
      <div className="mt-6 print:mt-4 text-center urdu-text">
        <div className="flex justify-between gap-4 px-2 text-base sm:text-xl print:text-[14px] font-black pb-8">
           <span className="border-t border-black/20 pt-1 flex-1">دستخط پارٹی</span>
           <span className="border-t border-black/20 pt-1 flex-1">منجانب {data.shopName}</span>
        </div>
        <p className="text-[12px] print:text-[12px] italic font-black pt-4 border-t border-dashed border-black/10 opacity-40">
          Mandi Bill Pro سافٹ ویئر
        </p>
      </div>
    </div>
  );
};

export default InvoiceView;

