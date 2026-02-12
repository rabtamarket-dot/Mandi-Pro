
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
      
      {/* Shop Header - Centered */}
      <div className="mb-2 pb-1 border-b-2 border-dashed border-black/20 print:border-black/50 text-center">
        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 mb-1 print:text-2xl urdu-text leading-tight">{data.shopName || 'مل / شاپ کا نام'}</h1>
        <p className="text-base sm:text-xl font-bold text-gray-700 mb-0 print:text-[14px] urdu-text">{data.address || 'ایڈریس درج نہیں ہے'}</p>
        <div className="text-gray-900 font-black text-lg print:text-[16px] urdu-text">
          <span>فون: {data.phone || 'فون نمبر'}</span>
        </div>
      </div>

      {/* Bill/Party Info - Spaced per user request */}
      <div className="flex flex-col items-center mb-3 print:mb-2 text-sm sm:text-xl print:text-[16px] urdu-text border-b border-black/10 pb-2 space-y-1.5 print:space-y-1">
          <p className="font-bold">بل نمبر: <span className="font-black">{data.billNumber || '---'}</span></p>
          <p className="font-bold">تاریخ: <span className="font-black">{data.date}</span></p>
          <div className="w-full border-t border-dashed border-black/5 my-1"></div>
          <p className="font-bold">پارٹی: <span className="font-black text-lg print:text-[18px]">{data.partyName || '---'}</span></p>
          {data.brokerName && <p className="font-bold">بروکر کا نام: <span className="font-black">{data.brokerName}</span></p>}
          <p className="font-bold">گاڑی نمبر: <span className="font-black">{data.trolleyNo || '---'}</span></p>
      </div>

      {/* Summary Stats */}
      <div className="bg-emerald-50/50 p-2 rounded-xl mb-2 border border-emerald-100 print:bg-transparent print:p-0 print:border-none print:mb-1 text-center">
        <div className="grid grid-cols-3 gap-1 text-[12px] sm:text-lg print:text-[15px] urdu-text">
          <div className="flex flex-col">
            <span className="font-bold opacity-70 print:opacity-100">تھیلہ/بوری</span>
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

      <div className="hidden print:block border-t border-dashed border-black/30 my-1"></div>

      {/* Items Section - Enlarged Rate and Amount */}
      <div className="mb-2 print:mb-1 urdu-text text-center px-1">
        {data.items.map((item, idx) => {
          const itemNetWeight = item.weight - (item.quantity * item.katt);
          const itemNetMaunds = itemNetWeight / 40;
          const itemAmount = itemNetMaunds * item.rate;
          return (
            <div key={idx} className="border-b border-gray-100 print:border-dashed print:border-black/20 py-3 print:py-2">
              <div className="flex justify-center items-center gap-3 text-[14px] sm:text-xl print:text-[17px] font-bold">
                 <span>جنس: <span className="font-black">{item.quantity}</span></span>
                 <span className="font-black text-emerald-900">{item.description}</span>
                 <span>وزن: <span className="font-black">{itemNetWeight % 1 === 0 ? itemNetWeight : itemNetWeight.toFixed(3)}k</span></span>
              </div>
              <div className="flex flex-col items-center mt-1.5">
                 <span className="text-[16px] print:text-[18px] font-black bg-gray-50 print:bg-transparent px-2 py-0.5 rounded">
                    ریٹ: Rs {item.rate} | رقم: Rs {itemAmount.toLocaleString(undefined, {maximumFractionDigits: 0})} /-
                 </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deductions */}
      <div className="space-y-1 text-[12px] sm:text-lg print:text-[15px] mb-2 print:mb-1 urdu-text border-t-2 border-black/10 pt-2 px-1 text-right">
          <div className="flex justify-between items-center">
            <span>کمیشن ({data.commissionRate}%):</span>
            <span className="font-bold">-{commission.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
          </div>
          {khaliBardana > 0 && (
            <div className="flex justify-between items-center">
              <span className="font-bold">خالی باردانہ (Bag Charge):</span>
              <span className="font-black">-{khaliBardana.toLocaleString()}</span>
            </div>
          )}
          {brokerage > 0 && (
            <div className="flex justify-between items-center">
              <span className="font-bold">بروکری (Brokerage):</span>
              <span className="font-black">-{brokerage.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
            </div>
          )}
          {data.laborCharges > 0 && (
            <div className="flex justify-between items-center">
              <span>مزدوری (Labor):</span>
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
              <span>{exp.name} {exp.impact === 'plus' ? '(+)' : '(-)'}:</span>
              <span className={`font-bold ${exp.impact === 'plus' ? 'text-blue-600 print:text-black' : ''}`}>
                {exp.impact === 'plus' ? '+' : '-'}{exp.amount.toLocaleString()}
              </span>
            </div>
          ))}
      </div>

      <div className="hidden print:block border-t-2 border-dashed border-black/40 my-2"></div>

      {/* Final Total - Very prominent */}
      <div className="bg-gray-900 text-white p-3 rounded-2xl text-center print:bg-transparent print:text-black print:p-0 urdu-text">
        <p className="text-[12px] font-bold opacity-70 print:opacity-100 mb-0">کل صافی ادائیگی</p>
        <p className="text-3xl sm:text-6xl font-black print:text-3xl print:leading-none mt-1">Rs {netPayable.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
      </div>

      {/* Footer */}
      <div className="mt-5 print:mt-3 text-center urdu-text space-y-5">
        <div className="flex justify-between gap-2 px-2 border-t-2 border-black/10 pt-3 print:border-black/50 text-[13px] print:text-[15px] font-bold">
           <span>دستخط پارٹی</span>
           <span>منجانب {data.shopName}</span>
        </div>
        <p className="text-[14px] print:text-[15px] italic text-emerald-800 print:text-black font-black border-t border-dashed border-black/10 pt-2">
          Mandi Bill Pro سافٹ ویئر
        </p>
      </div>
    </div>
  );
};

export default InvoiceView;

