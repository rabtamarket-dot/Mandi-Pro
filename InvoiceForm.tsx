
import React from 'react';
import { InvoiceData, InvoiceItem, CustomExpense } from './types';

interface Props {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
  onScan: () => void;
  onPrint: () => void;
  onSavePdf: () => void;
  onNewBill: () => void;
  onAutoIncrement: () => void;
}

const InvoiceForm: React.FC<Props> = ({ data, onChange, onScan, onPrint, onSavePdf, onNewBill, onAutoIncrement }) => {
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
      name: impact === 'plus' ? 'دیگر اخراجات' : 'دیگر کٹوتی',
      amount: 0,
      impact: impact
    };
    updateField('customExpenses', [...(data.customExpenses || []), newExpense]);
  };

  const removeCustomExpense = (id: string) => {
    updateField('customExpenses', data.customExpenses.filter(e => e.id !== id));
  };

  // --- Calculations ---
  const totalBags = data.items.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalKattWeight = data.items.reduce((acc, curr) => acc + (curr.quantity * curr.katt), 0);
  const totalItemsWeight = data.items.reduce((acc, curr) => acc + curr.weight, 0);
  const totalManualWeights = data.weights.reduce((acc, curr) => acc + curr.weight, 0);
  
  const finalGrossWeight = totalItemsWeight > 0 ? totalItemsWeight : totalManualWeights;
  const activeNetWeight = finalGrossWeight - totalKattWeight;
  const netMaundsTotal = activeNetWeight / 40;

  const totalGrossAmount = data.items.reduce((acc, item) => {
    const itemNetMaunds = (item.weight - (item.quantity * item.katt)) / 40;
    return acc + (itemNetMaunds * item.rate);
  }, 0);

  // 1. ADDITIONS (+) Logic - Matches the handwritten instructions
  const add_commission = (totalGrossAmount * (data.add_commissionRate || 0)) / 100;
  const add_labor = totalBags * (data.add_laborCharges || 0);
  const add_bardana = totalBags * (data.add_khaliBardanaRate || 0);
  const add_brokerage = netMaundsTotal * (data.add_brokerageRate || 0);
  const add_custom = (data.customExpenses || []).filter(e => e.impact === 'plus').reduce((acc, e) => acc + (e.amount || 0), 0);
  
  const totalAdditions = add_commission + add_labor + add_bardana + add_brokerage + (data.add_biltyCharges || 0) + add_custom;

  // 2. DEDUCTIONS (-) Logic - Matches the handwritten instructions
  const neg_commission = (totalGrossAmount * (data.commissionRate || 0)) / 100;
  const neg_labor = totalBags * (data.laborCharges || 0);
  const neg_bardana = totalBags * (data.khaliBardanaRate || 0);
  const neg_brokerage = netMaundsTotal * (data.brokerageRate || 0);
  const neg_custom = (data.customExpenses || []).filter(e => e.impact === 'minus').reduce((acc, e) => acc + (e.amount || 0), 0);
  
  const totalDeductions = neg_commission + neg_labor + neg_bardana + neg_brokerage + (data.biltyCharges || 0) + neg_custom;

  const finalPayable = totalGrossAmount + totalAdditions - totalDeductions;

  return (
    <div className="bg-white p-3 sm:p-5 md:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl space-y-6 sm:space-y-10 border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-emerald-50 pb-6 gap-4 sm:gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-emerald-900 tracking-tight urdu-text">بل ایڈیٹر <span className="text-emerald-500 font-sans">Pro</span></h2>
          <p className="text-xs sm:text-sm text-emerald-600 font-bold opacity-80 mt-1 urdu-text">وزن، ریٹ اور اخراجات درج کریں</p>
        </div>
        <button onClick={onScan} className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 group">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <span className="font-black text-base sm:text-lg urdu-text">AI اسکینر</span>
        </button>
      </div>

      {/* Basic Info */}
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

      {/* Items Section */}
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

      {/* Main Accounting Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ADDITIONS سیکشن (+) */}
        <div className="bg-blue-50/40 p-5 sm:p-8 rounded-[2.5rem] border border-blue-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
             <h3 className="text-xl font-black text-blue-900 urdu-text">اخراجات جمع (+)</h3>
             <span className="text-[10px] bg-blue-600 text-white px-3 py-1 rounded-lg font-black tracking-widest uppercase">Additions</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
             <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 block text-center urdu-text">منوتی / کمیشن (%)</label>
                <input type="number" step="0.01" className="w-full p-2.5 rounded-xl border border-blue-200 bg-white font-black text-center" value={data.add_commissionRate || 0} onChange={(e) => updateField('add_commissionRate', Number(e.target.value))} />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 block text-center urdu-text">مزدوری (ریٹ)</label>
                <input type="number" step="0.01" className="w-full p-2.5 rounded-xl border border-blue-200 bg-white font-black text-center" value={data.add_laborCharges || 0} onChange={(e) => updateField('add_laborCharges', Number(e.target.value))} />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 block text-center urdu-text">باردانہ (ریٹ)</label>
                <input type="number" step="0.01" className="w-full p-2.5 rounded-xl border border-blue-200 bg-white font-black text-center" value={data.add_khaliBardanaRate || 0} onChange={(e) => updateField('add_khaliBardanaRate', Number(e.target.value))} />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 block text-center urdu-text">بروکری (ریٹ)</label>
                <input type="number" step="0.01" className="w-full p-2.5 rounded-xl border border-blue-200 bg-white font-black text-center" value={data.add_brokerageRate || 0} onChange={(e) => updateField('add_brokerageRate', Number(e.target.value))} />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 block text-center urdu-text">بلٹی کرایہ</label>
                <input type="number" className="w-full p-2.5 rounded-xl border border-blue-200 bg-white font-black text-center" value={data.add_biltyCharges || 0} onChange={(e) => updateField('add_biltyCharges', Number(e.target.value))} />
             </div>
             <div className="flex items-end">
                <button onClick={() => addCustomExpense('plus')} className="w-full p-2.5 bg-blue-600 text-white rounded-xl font-black text-[10px] urdu-text hover:bg-blue-700 shadow-sm">+ دیگر اخراجات</button>
             </div>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
            {(data.customExpenses || []).filter(e => e.impact === 'plus').map((exp) => (
              <div key={exp.id} className="flex gap-2 items-center bg-white p-2 rounded-2xl border border-blue-100 shadow-sm">
                <input className="flex-1 p-2 bg-transparent text-sm text-right urdu-text font-bold outline-none" placeholder="نام درج کریں" value={exp.name} onChange={(e) => {
                  const exps = data.customExpenses.map(item => item.id === exp.id ? {...item, name: e.target.value} : item);
                  updateField('customExpenses', exps);
                }} />
                <input type="number" className="w-24 p-2 bg-gray-50 rounded-xl text-sm text-center font-black border border-blue-100" placeholder="رقم" value={exp.amount || ''} onChange={(e) => {
                  const exps = data.customExpenses.map(item => item.id === exp.id ? {...item, amount: Number(e.target.value)} : item);
                  updateField('customExpenses', exps);
                }} />
                <button onClick={() => removeCustomExpense(exp.id)} className="text-red-400 font-black px-2">×</button>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-blue-100 flex justify-between items-center px-2">
             <span className="text-xs font-black text-blue-800 urdu-text">کل اخراجات جمع (+) :</span>
             <span className="font-black text-blue-900 text-lg">Rs {totalAdditions.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
          </div>
        </div>

        {/* DEDUCTIONS سیکشن (-) */}
        <div className="bg-red-50/40 p-5 sm:p-8 rounded-[2.5rem] border border-red-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
             <h3 className="text-xl font-black text-red-900 urdu-text">اخراجات منفی (-)</h3>
             <span className="text-[10px] bg-red-600 text-white px-3 py-1 rounded-lg font-black tracking-widest uppercase">Deductions</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
             <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 block text-center urdu-text">کمیشن (%)</label>
                <input type="number" step="0.01" className="w-full p-2.5 rounded-xl border border-red-200 bg-white font-black text-center" value={data.commissionRate || 0} onChange={(e) => updateField('commissionRate', Number(e.target.value))} />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 block text-center urdu-text">مزدوری (ریٹ)</label>
                <input type="number" step="0.01" className="w-full p-2.5 rounded-xl border border-red-200 bg-white font-black text-center" value={data.laborCharges || 0} onChange={(e) => updateField('laborCharges', Number(e.target.value))} />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 block text-center urdu-text">باردانہ (ریٹ)</label>
                <input type="number" step="0.01" className="w-full p-2.5 rounded-xl border border-red-200 bg-white font-black text-center" value={data.khaliBardanaRate || 0} onChange={(e) => updateField('khaliBardanaRate', Number(e.target.value))} />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 block text-center urdu-text">بروکری (ریٹ)</label>
                <input type="number" step="0.01" className="w-full p-2.5 rounded-xl border border-red-200 bg-white font-black text-center" value={data.brokerageRate || 0} onChange={(e) => updateField('brokerageRate', Number(e.target.value))} />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 block text-center urdu-text">بلٹی کرایہ</label>
                <input type="number" className="w-full p-2.5 rounded-xl border border-red-200 bg-white font-black text-center" value={data.biltyCharges || 0} onChange={(e) => updateField('biltyCharges', Number(e.target.value))} />
             </div>
             <div className="flex items-end">
                <button onClick={() => addCustomExpense('minus')} className="w-full p-2.5 bg-red-600 text-white rounded-xl font-black text-[10px] urdu-text hover:bg-red-700 shadow-sm">+ دیگر کٹوتی</button>
             </div>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
            {(data.customExpenses || []).filter(e => e.impact === 'minus').map((exp) => (
              <div key={exp.id} className="flex gap-2 items-center bg-white p-2 rounded-2xl border border-red-100 shadow-sm">
                <input className="flex-1 p-2 bg-transparent text-sm text-right urdu-text font-bold outline-none" placeholder="نام درج کریں" value={exp.name} onChange={(e) => {
                  const exps = data.customExpenses.map(item => item.id === exp.id ? {...item, name: e.target.value} : item);
                  updateField('customExpenses', exps);
                }} />
                <input type="number" className="w-24 p-2 bg-gray-50 rounded-xl text-sm text-center font-black border border-red-100" placeholder="رقم" value={exp.amount || ''} onChange={(e) => {
                  const exps = data.customExpenses.map(item => item.id === exp.id ? {...item, amount: Number(e.target.value)} : item);
                  updateField('customExpenses', exps);
                }} />
                <button onClick={() => removeCustomExpense(exp.id)} className="text-red-400 font-black px-2">×</button>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-red-100 flex justify-between items-center px-2">
             <span className="text-xs font-black text-red-800 urdu-text">کل اخراجات منفی (-) :</span>
             <span className="font-black text-red-900 text-lg">Rs {totalDeductions.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
          </div>
        </div>
      </div>

      {/* Summary Dashboard */}
      <div className="bg-emerald-900 text-white p-6 rounded-[2.5rem] shadow-2xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div className="bg-white/5 p-3 rounded-3xl backdrop-blur-sm border border-white/10">
              <span className="text-[9px] opacity-60 block uppercase urdu-text mb-1">کانٹا وزن</span>
              <span className="text-xl font-black">{finalGrossWeight.toFixed(2)} کلو</span>
            </div>
            <div className="bg-white/5 p-3 rounded-3xl backdrop-blur-sm border border-white/10">
              <span className="text-[9px] opacity-60 block uppercase urdu-text mb-1">باردانہ کٹوتی</span>
              <span className="text-xl font-black text-red-300">-{totalKattWeight.toFixed(2)} کلو</span>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-3xl backdrop-blur-sm border border-blue-400/20">
              <span className="text-[9px] text-blue-300 block uppercase urdu-text mb-1">کل جمع (+)</span>
              <span className="text-xl font-black text-blue-300">Rs {totalAdditions.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
            </div>
            <div className="bg-red-500/10 p-3 rounded-3xl backdrop-blur-sm border border-red-400/20">
              <span className="text-[9px] text-red-300 block uppercase urdu-text mb-1">کل کٹوتی (-)</span>
              <span className="text-xl font-black text-red-300">Rs {totalDeductions.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
            </div>
            <div className="bg-white/5 p-3 rounded-3xl backdrop-blur-sm border border-white/10">
              <span className="text-[9px] opacity-60 block uppercase urdu-text mb-1">صافی وزن</span>
              <span className="text-xl font-black text-emerald-300">{activeNetWeight.toFixed(2)} کلو</span>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-6 text-center">
             <p className="text-xs opacity-60 urdu-text font-bold mb-1">کل صافی قابلِ ادائیگی رقم</p>
             <p className="text-5xl font-black tracking-tighter">Rs {finalPayable.toLocaleString(undefined, {maximumFractionDigits:0})}</p>
          </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
        <button onClick={onNewBill} className="p-5 border-2 border-emerald-100 text-emerald-700 font-black rounded-3xl hover:bg-emerald-50 transition-all active:scale-95 urdu-text">نیا بل</button>
        <button onClick={onSavePdf} className="p-5 bg-red-600 text-white font-black rounded-3xl shadow-xl hover:bg-red-700 transition-all active:scale-95 urdu-text flex items-center justify-center gap-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          PDF محفوظ کریں
        </button>
        <button onClick={onPrint} className="p-5 bg-emerald-600 text-white font-black rounded-3xl shadow-xl hover:bg-emerald-700 transition-all active:scale-95 urdu-text">پرنٹ کریں</button>
      </div>
    </div>
  );
};

export default InvoiceForm;

