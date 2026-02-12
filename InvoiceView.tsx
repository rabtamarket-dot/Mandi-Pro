
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
  
  const otherDeductionsFixed = khaliBardana + brokerage + (data.laborCharges || 0) + (data.biltyCharges || 0);
  const customExpensesSum = (data.customExpenses || []).reduce((acc, e) => {
    return e.impact === 'plus' ? acc - e.amount : acc + e.amount;
  }, 0);

  const netPayable = totalGrossAmount - (commission + otherDeductionsFixed + customExpensesSum);

  return (
    <div className="print-container bg-white p-4 sm:p-6 rounded-3xl shadow-xl border-t-8 border-gray-800 mx-auto max-w-[800px] print:max-w-full print:p-0 print:m-0 print:shadow-none print:border-none print:rounded-none overflow-hidden font-sans rtl text-center" dir="rtl">
      
      {/* Shop Header - Matching Image Style */}
      <div className="mb-4 pb-2 border-b-2 border-dashed border-black/20 print:border-black/50 text-center space-y-1">
        <h1 className="text-4xl sm:text-6xl font-black text-gray-900 mb-2 print:text-3xl urdu-text leading-tight">{data.shopName || 'مل / شاپ کا نام'}</h1>
        <p className="text-lg sm:text-2xl font-bold text-gray-700 print:text-[15px] urdu-text">{data.address || 'ایڈریس درج نہیں ہے'}</p>
        <div className="text-gray-900 font-black text-xl print:text-[17px] urdu-text">
          <span>فون: {data.phone || 'فون نمبر'}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black/30 my-2 print:my-1"></div>

      {/* Bill & Date Info - One Line as per image */}
      <div className="mb-4 print:mb-2 text-base sm:text-2xl print:text-[16px] urdu-text border-b border-black/10 pb-2 flex justify-center gap-4">
          <p className="font-bold">بل نمبر: <span className="font-black">{data.billNumber || '---'}</span></p>
          <span className="opacity-30">|</span>
          <p className="font-bold">تاریخ: <span className="font-black">{data.date}</span></p>
      </div>

      {/* Party & Broker Details - More spacing */}
      <div className="text-center space-y-2 mb-4 print:mb-3 urdu-text text-lg sm:text-2xl print:text-[18px]">
          <p className="font-bold">پارٹی: <span className="font-black border-b-2 border-dotted border-gray-300">{data.partyName || '---'}</span></p>
          {data.brokerName && <p className="font-bold">بروکر کا نام: <span className="font-black border-b-2 border-dotted border-gray-300">{data.brokerName}</span></p>}
          <p className="font-bold uppercase">گاڑی نمبر: <span className="font-black">{data.trolleyNo || '---'}</span></p>
      </div>

      {/* Summary Box - Three Columns with Borders */}
      <div className="border-y-2 border-dashed border-black/40 py-2 mb-4 print:mb-2 text-center">
        <div className="grid grid-cols-3 gap-1 text-[13px] sm:text-2xl print:text-[16px] urdu-text">
          <div className="flex flex-col border-l border-black/10">
            <span className="font-bold opacity-70 print:opacity-100">تھیلہ/بوری</span>
            <span className="font-black text-2xl print:text-lg">{totalBags}</span>
          </div>
          <div className="flex flex-col border-l border-black/10">
            <span className="font-bold opacity-70 print:opacity-100">کل کٹوتی</span>
            <span className="font-black text-2xl print:text-lg text-red-600 print:text-black">-{totalKattWeight % 1 === 0 ? totalKattWeight : totalKattWeight.toFixed(3)}k</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold opacity-70 print:opacity-100">صافی وزن</span>
            <span className="font-black text-2xl print:text-lg text-emerald-800 print:text-black">{maunds} من {kgs > 0 ? `${kgs} کلو` : ''}</span>
          </div>
        </div>
      </div>

      {/* Item Details - Enlarged for Visibility */}
      <div className="mb-4 print:mb-3 urdu-text text-center px-1">
        {data.items.map((item, idx) => {
          const itemNetWeight = item.weight - (item.quantity * item.katt);
          const itemNetMaunds = itemNetWeight / 40;
          const itemAmount = itemNetMaunds * item.rate;
          return (
            <div key={idx} className="border-b border-dashed border-black/10 py-4 print:py-2">
              <div className="flex justify-center items-center gap-3 text-lg sm:text-3xl print:text-[20px] font-black">
                 <span>جنس: <span className="underline">{item.quantity}</span></span>
                 <span className="text-emerald-900">{item.description}</span>
                 <span>وزن: <span>{itemNetWeight % 1 === 0 ? itemNetWeight : itemNetWeight.toFixed(3)}k</span></span>
              </div>
              <div className="mt-3">
                 <span className="text-2xl sm:text-4xl print:text-[24px] font-black block bg-gray-50 print:bg-transparent py-1 border-y border-dashed border-black/5 print:border-black/20">
                    Rs {itemAmount.toLocaleString(undefined, {maximumFractionDigits: 0})} /-
                 </span>
                 <p className="text-sm sm:text-xl print:text-[14px] mt-1 opacity-70">ریٹ: Rs {item.rate} فی من</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deductions - Clean List */}
      <div className="space-y-1 text-sm sm:text-2xl print:text-[16px] mb-4 print:mb-2 urdu-text pt-2 px-2 text-right border-t-2 border-black/10">
          <div className="flex justify-between items-center">
            <span>کمیشن ({data.commissionRate}%):</span>
            <span className="font-bold">-{commission.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
          </div>
          {khaliBardana > 0 && (
            <div className="flex justify-between items-center">
              <span className="font-bold">خالی باردانہ:</span>
              <span className="font-black">-{khaliBardana.toLocaleString()}</span>
            </div>
          )}
          {brokerage > 0 && (
            <div className="flex justify-between items-center">
              <span className="font-bold">بروکری:</span>
              <span className="font-black">-{brokerage.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
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
              <span className="font-bold">{exp.impact === 'plus' ? '+' : '-'}{exp.amount.toLocaleString()}</span>
            </div>
          ))}
      </div>

      <div className="border-t-2 border-dashed border-black/50 my-4 print:my-2"></div>

      {/* Final Total - Promoting prominence */}
      <div className="text-center urdu-text py-2">
        <p className="text-base sm:text-2xl print:text-[15px] font-bold opacity-70 mb-1">کل صافی ادائیگی</p>
        <p className="text-4xl sm:text-7xl font-black print:text-[34px] print:leading-none text-gray-900">Rs {netPayable.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
      </div>

      <div className="border-t-2 border-dashed border-black/40 my-4 print:my-2"></div>

      {/* Footer - Signature Style */}
      <div className="mt-6 print:mt-4 text-center urdu-text">
        <div className="flex justify-between gap-4 px-2 text-base sm:text-2xl print:text-[17px] font-black pb-8">
           <span className="border-t border-black/20 pt-1 flex-1">دستخط پارٹی</span>
           <span className="border-t border-black/20 pt-1 flex-1">منجانب {data.shopName}</span>
        </div>
        <p className="text-[14px] print:text-[16px] italic font-black pt-4 border-t border-dashed border-black/10">
          Mandi Bill Pro سافٹ ویئر
        </p>
      </div>
    </div>
  );
};

export default InvoiceView;

