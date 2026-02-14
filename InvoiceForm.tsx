
import React from 'react';
import { InvoiceData, InvoiceItem, CustomExpense } from './types';

interface Props {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
  onScan: () => void;
  onPrint: () => void;
  onNewBill: () => void;
  onAutoIncrement: () => void;
}

const InvoiceForm: React.FC<Props> = ({ data, onChange, onScan, onPrint, onNewBill, onAutoIncrement }) => {
  const updateField = (field: keyof InvoiceData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addItem = () => {
    const newItem: InvoiceItem = { 
      id: Date.now().toString(), 
      description: 'دھان', 
      bharti: 60, 
      quantity: 1, 
      katt: 1, 
      rate: data.ratePerMaund || 0,
      weight: 60 
    };
    updateField('items', [...data.items, newItem]);
  };

  const removeItem = (id: string) => {
    updateField('items', data.items.filter(item => item.id !== id));
  };

  const addCustomExpense = (impact: 'plus' | 'minus') => {
    const newExpense: CustomExpense = {
      id: Date.now().toString(),
      name: impact === 'plus' ? 'اضافی جمع' : 'دیگر کٹوتی',
      amount: 0,
      impact: impact
    };
    updateField('customExpenses', [...(data.customExpenses || []), newExpense]);
  };

  const removeCustomExpense = (id: string) => {
    updateField('customExpenses', data.customExpenses.filter(e => e.id !== id));
  };

  const totalBags = data.items.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalKattWeight = data.items.reduce((acc, curr) => acc + (curr.quantity * curr.katt), 0);
  const totalItemsWeight = data.items.reduce((acc, curr) => acc + curr.weight, 0);
  const totalManualWeights = data.weights.reduce((acc, curr) => acc + curr.weight, 0);
  
  const finalGrossWeight = totalItemsWeight > 0 ? totalItemsWeight : totalManualWeights;
  const activeNetWeight = finalGrossWeight - totalKattWeight;

  const totalGrossAmount = data.items.reduce((acc, item) => {
    const itemNetMaunds = (item.weight - (item.quantity * item.katt)) / 40;
    return acc + (itemNetMaunds * item.rate);
  }, 0);

  // Standard Mandi Deductions
  const commission = (totalGrossAmount * Math.abs(data.commissionRate)) / 100;
  const khaliBardana = totalBags * (data.khaliBardanaRate || 0);
  const brokerage = (activeNetWeight / 40) * (data.brokerageRate || 0);
  const fixedDeductionsTotal = commission + khaliBardana + brokerage + (data.laborCharges || 0) + (data.biltyCharges || 0);

  // Categorized Custom Expenses
  const customAdditionsTotal = (data.customExpenses || [])
    .filter(e => e.impact === 'plus')
    .reduce((acc, e) => acc + e.amount, 0);

  const customSubtractsTotal = (data.customExpenses || [])
    .filter(e => e.impact === 'minus')
    .reduce((acc, e) => acc + e.amount, 0);
  
  const totalAllDeductions = fixedDeductionsTotal + customSubtractsTotal;
  const finalPayable = totalGrossAmount + customAdditionsTotal - totalAllDeductions;

  return (
    <div className="bg-white p-3 sm:p-5 md:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl space-y-6 sm:space-y-10 border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-emerald-50 pb-6 gap-4 sm:gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-emerald-900 tracking-tight urdu-text">بل ایڈیٹر <span className="text-emerald-500 font-sans">Pro</span></h2>
          <p className="text-xs sm:text-sm text-emerald-600 font-bold opacity-80 mt-1 urdu-text">وزن، ریٹ اور کٹوتیاں درج کریں</p>
        </div>
        <button onClick={onScan} className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 group">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <span className="font-black text-base sm:text-lg urdu-text">AI اسکینر</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1 urdu-text">بل نمبر</label>
          <div className="relative">
            <input type="text" className="w-full rounded-xl border-emerald-200 bg-emerald-50/20 p-3 border font-black text-sm text-right" value={data.billNumber} onChange={(e) => updateField('billNumber', e.target.value)} />
            <button onClick={onAutoIncrement} className="absolute left-2 top-1/2 -translate-y-1/2 text-emerald-500 p-1.5 hover:bg-white rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></button>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1 urdu-text">پارٹی کا نام</label>
          <input type="text" className="w-full rounded-xl border-gray-100 p-3 border font-bold text-sm text-right focus:border-emerald-50 urdu-text" value={data.partyName} onChange={(e) => updateField('partyName', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1 urdu-text">بروکر کا نام</label>
          <input type="text" className="w-full rounded-xl border-gray-100 p-3 border font-bold text-sm text-right focus:border-emerald-50 bg-emerald-50/5 urdu-text" value={data.brokerName} onChange={(e) => updateField('brokerName', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1 urdu-text">گاڑی نمبر</label>
          <input type="text" className="w-full rounded-xl border-gray-100 p-3 border font-bold text-sm text-right focus:border-emerald-50 urdu-text" value={data.trolleyNo} onChange={(e) => updateField('trolleyNo', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1 urdu-text">تاریخ</label>
          <input type="date" className="w-full rounded-xl border-gray-100 p-3 border font-bold text-sm" value={data.date} onChange={(e) => updateField('date', e.target.value)} />
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6 bg-gradient-to-tr from-emerald-50/40 to-white p-4 sm:p-6 rounded-2xl border border-emerald-100">
        <div className="flex justify-between items-center">
          <h3 className="text-lg sm:text-xl font-black text-emerald-900 urdu-text">اشیاء اور وزن</h3>
          <button onClick={addItem} className="text-emerald-700 font-black text-xs bg-white px-4 py-2 rounded-xl border shadow-sm urdu-text">+ آئٹم</button>
        </div>
        
        <div className="space-y-3">
          {data.items.map((item, idx) => (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-white p-3 rounded-2xl border border-emerald-50 shadow-sm">
              <div className="md:col-span-3">
                <label className="text-[9px] font-black text-gray-400 mb-1 block urdu-text">تفصیل (Item)</label>
                <input className="w-full rounded-lg border-gray-100 p-2 font-bold text-sm text-right urdu-text" value={item.description} onChange={(e) => {
                  const items = [...data.items]; items[idx].description = e.target.value; updateField('items', items);
                }} />
              </div>
              <div className="md:col-span-1">
                <label className="text-[9px] font-black text-gray-400 mb-1 block text-center urdu-text">تعداد</label>
                <input type="number" className="w-full rounded-lg border-gray-100 p-2 font-bold text-sm text-center" value={item.quantity || ''} onChange={(e) => {
                  const items = [...data.items]; items[idx].quantity = Number(e.target.value); updateField('items', items);
                }} />
              </div>
              <div className="md:col-span-2">
                <label className="text-[9px] font-black text-emerald-600 mb-1 block text-center urdu-text">وزن (Gross)</label>
                <input type="number" step="0.01" className="w-full rounded-lg border-emerald-100 p-2 font-black text-sm text-center bg-emerald-50/20" value={item.weight || ''} onChange={(e) => {
                  const items = [...data.items]; items[idx].weight = Number(e.target.value); updateField('items', items);
                }} />
              </div>
              <div className="md:col-span-2">
                <label className="text-[9px] font-black text-red-500 mb-1 block text-center urdu-text">کاٹ / تھیلہ</label>
                <input type="number" step="0.001" className="w-full rounded-lg border-red-100 p-2 font-bold text-sm text-center bg-red-50/10" value={item.katt || ''} onChange={(e) => {
                  const items = [...data.items]; items[idx].katt = Number(e.target.value); updateField('items', items);
                }} />
              </div>
              <div className="md:col-span-2">
                <label className="text-[9px] font-black text-emerald-600 mb-1 block text-center urdu-text">ریٹ (Rate)</label>
                <input type="number" step="0.01" className="w-full rounded-lg border-emerald-100 p-2 font-black text-sm text-center bg-emerald-50/20" value={item.rate || ''} onChange={(e) => {
                  const items = [...data.items]; items[idx].rate = Number(e.target.value); updateField('items', items);
                }} />
              </div>
              <div className="md:col-span-2 flex justify-between items-center p-2">
                <div className="text-right">
                   <span className="text-[8px] block font-black text-gray-400 urdu-text">رقم</span>
                   <span className="font-black text-emerald-700 text-xs">Rs {((item.weight - (item.quantity * item.katt)) / 40 * item.rate).toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-red-400 p-1 hover:bg-red-50 rounded-lg font-black">×</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 p-4 sm:p-6 rounded-[2rem] border border-gray-200">
        <h3 className="text-lg font-black text-gray-800 mb-4 urdu-text">اکاؤنٹ اور اخراجات (Account & Deductions)</h3>
        
        {/* Standard Mandi Deductions */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
           <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-500 block urdu-text">کمیشن (%)</label>
             <input type="number" step="0.01" className="w-full p-3 rounded-xl border border-gray-200 font-bold text-center" value={data.commissionRate} onChange={(e) => updateField('commissionRate', Number(e.target.value))} />
           </div>
           <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-500 block urdu-text">مزدوری (Labor)</label>
             <input type="number" className="w-full p-3 rounded-xl border border-gray-200 font-bold text-center" value={data.laborCharges} onChange={(e) => updateField('laborCharges', Number(e.target.value))} />
           </div>
           <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-500 block urdu-text">باردانہ (جنس)</label>
             <input type="number" step="0.01" className="w-full p-3 rounded-xl border border-gray-200 font-bold text-center" value={data.khaliBardanaRate} onChange={(e) => updateField('khaliBardanaRate', Number(e.target.value))} />
           </div>
           <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-500 block urdu-text">بروکری (ریٹ)</label>
             <input type="number" step="0.01" className="w-full p-3 rounded-xl border border-gray-200 font-bold text-center" value={data.brokerageRate} onChange={(e) => updateField('brokerageRate', Number(e.target.value))} />
           </div>
           <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-500 block urdu-text">بلٹی کرایہ</label>
             <input type="number" className="w-full p-3 rounded-xl border border-gray-200 font-bold text-center" value={data.biltyCharges || 0} onChange={(e) => updateField('biltyCharges', Number(e.target.value))} />
           </div>
        </div>

        {/* Two Separate Lists for Additions and Deductions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-gray-200 pt-6">
           
           {/* Section 1: Additions (Jama) */}
           <div className="space-y-4">
             <div className="flex justify-between items-center px-1">
               <h4 className="text-sm font-black text-blue-700 urdu-text">رقم جمع کریں (+)</h4>
               <button onClick={() => addCustomExpense('plus')} className="text-[10px] bg-blue-600 text-white px-3 py-1.5 rounded-xl font-black shadow-sm hover:bg-blue-700 urdu-text">+ نیا جمع</button>
             </div>
             <div className="space-y-2">
               {(data.customExpenses || []).filter(e => e.impact === 'plus').map((exp) => (
                 <div key={exp.id} className="flex gap-2 items-center bg-blue-50/40 p-2 rounded-2xl border border-blue-100/50">
                   <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-lg shadow-sm">+</div>
                   <input className="flex-1 p-2 bg-transparent text-sm text-right urdu-text font-bold outline-none" placeholder="نام (مثلاً پچھلا بقایا)" value={exp.name} onChange={(e) => {
                     const exps = data.customExpenses.map(item => item.id === exp.id ? {...item, name: e.target.value} : item);
                     updateField('customExpenses', exps);
                   }} />
                   <input type="number" className="w-28 p-2 bg-white rounded-xl text-sm text-center font-black border border-blue-100 shadow-inner" placeholder="رقم" value={exp.amount || ''} onChange={(e) => {
                     const exps = data.customExpenses.map(item => item.id === exp.id ? {...item, amount: Number(e.target.value)} : item);
                     updateField('customExpenses', exps);
                   }} />
                   <button onClick={() => removeCustomExpense(exp.id)} className="text-red-400 font-black px-2 hover:text-red-600 transition-colors">×</button>
                 </div>
               ))}
               {(data.customExpenses || []).filter(e => e.impact === 'plus').length === 0 && (
                 <p className="text-[10px] text-gray-300 text-center py-4 border-2 border-dashed border-gray-100 rounded-2xl urdu-text">کوئی جمع رقم درج نہیں ہے</p>
               )}
             </div>
           </div>

           {/* Section 2: Deductions (Manfi) */}
           <div className="space-y-4">
             <div className="flex justify-between items-center px-1">
               <h4 className="text-sm font-black text-red-700 urdu-text">رقم منہا کریں (-)</h4>
               <button onClick={() => addCustomExpense('minus')} className="text-[10px] bg-red-600 text-white px-3 py-1.5 rounded-xl font-black shadow-sm hover:bg-red-700 urdu-text">+ نیا کٹوتی</button>
             </div>
             <div className="space-y-2">
               {(data.customExpenses || []).filter(e => e.impact === 'minus').map((exp) => (
                 <div key={exp.id} className="flex gap-2 items-center bg-red-50/40 p-2 rounded-2xl border border-red-100/50">
                   <div className="bg-red-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-lg shadow-sm">-</div>
                   <input className="flex-1 p-2 bg-transparent text-sm text-right urdu-text font-bold outline-none" placeholder="نام (مثلاً ایڈوانس)" value={exp.name} onChange={(e) => {
                     const exps = data.customExpenses.map(item => item.id === exp.id ? {...item, name: e.target.value} : item);
                     updateField('customExpenses', exps);
                   }} />
                   <input type="number" className="w-28 p-2 bg-white rounded-xl text-sm text-center font-black border border-red-100 shadow-inner" placeholder="رقم" value={exp.amount || ''} onChange={(e) => {
                     const exps = data.customExpenses.map(item => item.id === exp.id ? {...item, amount: Number(e.target.value)} : item);
                     updateField('customExpenses', exps);
                   }} />
                   <button onClick={() => removeCustomExpense(exp.id)} className="text-red-400 font-black px-2 hover:text-red-600 transition-colors">×</button>
                 </div>
               ))}
               {(data.customExpenses || []).filter(e => e.impact === 'minus').length === 0 && (
                 <p className="text-[10px] text-gray-300 text-center py-4 border-2 border-dashed border-gray-100 rounded-2xl urdu-text">کوئی اضافی کٹوتی درج نہیں ہے</p>
               )}
             </div>
           </div>

        </div>
      </div>

      {/* Unified Summary Dashboard */}
      <div className="bg-emerald-900 text-white p-6 rounded-[2.5rem] shadow-2xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div className="bg-white/5 p-3 rounded-3xl backdrop-blur-sm border border-white/10">
              <span className="text-[9px] opacity-60 block uppercase urdu-text mb-1">کانٹا وزن</span>
              <span className="text-xl font-black">{finalGrossWeight.toFixed(2)} کلو</span>
            </div>
            <div className="bg-white/5 p-3 rounded-3xl backdrop-blur-sm border border-white/10">
              <span className="text-[9px] opacity-60 block uppercase urdu-text mb-1">باردانہ کٹوتی</span>
              <span className="text-xl font-black text-red-300">-{totalKattWeight.toFixed(3)} کلو</span>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-3xl backdrop-blur-sm border border-blue-400/20">
              <span className="text-[9px] text-blue-300 block uppercase urdu-text mb-1">کل اضافی (+)</span>
              <span className="text-xl font-black text-blue-300">Rs {customAdditionsTotal.toLocaleString()}</span>
            </div>
            <div className="bg-red-500/10 p-3 rounded-3xl backdrop-blur-sm border border-red-400/20">
              <span className="text-[9px] text-red-300 block uppercase urdu-text mb-1">کل کٹوتی (-)</span>
              <span className="text-xl font-black text-red-300">Rs {totalAllDeductions.toLocaleString()}</span>
            </div>
            <div className="bg-white/5 p-3 rounded-3xl backdrop-blur-sm border border-white/10">
              <span className="text-[9px] opacity-60 block uppercase urdu-text mb-1">صافی وزن</span>
              <span className="text-xl font-black text-emerald-300">{activeNetWeight.toFixed(3)} کلو</span>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-6 text-center">
             <p className="text-xs opacity-60 urdu-text font-bold mb-1">کل صافی قابلِ ادائیگی رقم (Net Payable)</p>
             <p className="text-5xl font-black tracking-tighter">Rs {finalPayable.toLocaleString(undefined, {maximumFractionDigits:0})}</p>
          </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 no-print">
        <button onClick={onNewBill} className="p-5 border-2 border-emerald-100 text-emerald-700 font-black rounded-3xl hover:bg-emerald-50 transition-all active:scale-95 urdu-text">نیا بل</button>
        <button onClick={onPrint} className="p-5 bg-emerald-600 text-white font-black rounded-3xl shadow-xl hover:bg-emerald-700 transition-all active:scale-95 urdu-text">پرنٹ کریں</button>
      </div>
    </div>
  );
};

export default InvoiceForm;

