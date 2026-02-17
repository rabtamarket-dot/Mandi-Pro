
import React from 'react';
import { InvoiceData, InvoiceItem, CustomExpense } from './types';
import VoiceEntry from './VoiceEntry';

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

  const handleVoiceResult = (result: Partial<InvoiceItem>) => {
    if (result.quantity || result.weight || result.rate) {
      const newItem: InvoiceItem = {
        id: Date.now().toString(),
        description: result.description || 'دھان',
        bharti: 60,
        quantity: result.quantity || 1,
        weight: result.weight || 60,
        rate: result.rate || data.ratePerMaund || 0,
        katt: 1
      };
      updateField('items', [...data.items, newItem]);
    }
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

  const totalBags = data.items.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalKattWeight = data.items.reduce((acc, curr) => acc + (curr.quantity * curr.katt), 0);
  const totalItemsWeight = data.items.reduce((acc, curr) => acc + curr.weight, 0);
  const totalManualWeights = (data.weights || []).reduce((acc, curr) => acc + curr.weight, 0);
  
  const finalGrossWeight = totalItemsWeight > 0 ? totalItemsWeight : totalManualWeights;
  const activeNetWeight = finalGrossWeight - totalKattWeight;
  const netMaundsTotal = activeNetWeight / 40;

  const totalGrossAmount = data.items.reduce((acc, item) => {
    const itemNetMaunds = (item.weight - (item.quantity * item.katt)) / 40;
    return acc + (itemNetMaunds * item.rate);
  }, 0);

  const totalAdditions = ((totalGrossAmount * (data.add_commissionRate || 0)) / 100) + 
                         (totalBags * (data.add_laborCharges || 0)) + 
                         (totalBags * (data.add_khaliBardanaRate || 0)) + 
                         (netMaundsTotal * (data.add_brokerageRate || 0)) + 
                         (data.add_biltyCharges || 0) + 
                         (data.customExpenses || []).filter(e => e.impact === 'plus').reduce((acc, e) => acc + (e.amount || 0), 0);

  const totalDeductions = ((totalGrossAmount * (data.commissionRate || 0)) / 100) + 
                          (totalBags * (data.laborCharges || 0)) + 
                          (totalBags * (data.khaliBardanaRate || 0)) + 
                          (netMaundsTotal * (data.brokerageRate || 0)) + 
                          (data.biltyCharges || 0) + 
                          (data.customExpenses || []).filter(e => e.impact === 'minus').reduce((acc, e) => acc + (e.amount || 0), 0);

  const finalPayable = totalGrossAmount + totalAdditions - totalDeductions;

  return (
    <div className="bg-white dark:bg-slate-900 p-3 sm:p-5 md:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl space-y-6 sm:space-y-10 border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-emerald-50 dark:border-emerald-900/20 pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-black text-emerald-900 dark:text-emerald-400 urdu-text">بل ایڈیٹر Pro</h2>
          <p className="text-xs text-emerald-600 dark:text-emerald-500/70 font-bold opacity-80 urdu-text">تمام تفصیلات درج کریں</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={onScan} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 group">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
            <span className="font-black urdu-text">AI اسکینر</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'بل نمبر', field: 'billNumber', type: 'text', withIncrement: true },
          { label: 'پارٹی کا نام', field: 'partyName', type: 'text', urdu: true },
          { label: 'بروکر کا نام', field: 'brokerName', type: 'text', urdu: true },
          { label: 'گاڑی نمبر', field: 'trolleyNo', type: 'text' },
          { label: 'تاریخ', field: 'date', type: 'date' }
        ].map((item) => (
          <div key={item.field} className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-1 urdu-text">{item.label}</label>
            <div className="relative">
              <input 
                type={item.type}
                className={`w-full rounded-xl border-emerald-100 dark:border-slate-700 bg-emerald-50/20 dark:bg-slate-800/50 p-3 border font-black text-sm text-right dark:text-white outline-none focus:border-emerald-500 ${item.urdu ? 'urdu-text' : ''}`} 
                value={(data as any)[item.field]} 
                onChange={(e) => updateField(item.field as keyof InvoiceData, e.target.value)} 
              />
              {item.withIncrement && (
                <button onClick={onAutoIncrement} className="absolute left-2 top-1/2 -translate-y-1/2 text-emerald-500 hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-emerald-50/30 dark:bg-emerald-950/20 p-4 sm:p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black text-emerald-900 dark:text-emerald-400 urdu-text">اشیاء اور وزن</h3>
          <div className="flex items-center gap-4">
            <VoiceEntry onResult={handleVoiceResult} />
            <button onClick={addItem} className="bg-white dark:bg-slate-800 border dark:border-slate-700 text-emerald-700 dark:text-emerald-400 px-6 py-2.5 rounded-2xl font-black text-sm urdu-text shadow-sm hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors">+ نیا آئٹم</button>
          </div>
        </div>
        <div className="space-y-3">
          {data.items.map((item, idx) => (
            <div key={item.id} className="grid grid-cols-2 md:grid-cols-12 gap-3 items-end bg-white dark:bg-slate-800 p-3 rounded-2xl border border-emerald-50 dark:border-slate-700 shadow-sm transition-colors">
              <div className="md:col-span-3">
                <label className="text-[9px] font-black text-gray-400 dark:text-slate-500 urdu-text">تفصیل</label>
                <input className="w-full rounded-lg border-gray-100 dark:border-slate-700 bg-transparent p-2 font-bold text-sm text-right urdu-text dark:text-white" value={item.description} onChange={(e) => {
                  const items = [...data.items]; items[idx].description = e.target.value; updateField('items', items);
                }} />
              </div>
              <div className="md:col-span-1">
                <label className="text-[9px] font-black text-gray-400 dark:text-slate-500 text-center urdu-text">تھیلے</label>
                <input type="number" className="w-full rounded-lg border-gray-100 dark:border-slate-700 bg-transparent p-2 font-bold text-sm text-center dark:text-white" value={item.quantity || ''} onChange={(e) => {
                  const items = [...data.items]; items[idx].quantity = Number(e.target.value); updateField('items', items);
                }} />
              </div>
              <div className="md:col-span-2">
                <label className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 text-center urdu-text">وزن</label>
                <input type="number" step="0.01" className="w-full rounded-lg border-emerald-100 dark:border-slate-700 p-2 font-black text-sm text-center bg-emerald-50/20 dark:bg-emerald-900/10 dark:text-white" value={item.weight || ''} onChange={(e) => {
                  const items = [...data.items]; items[idx].weight = Number(e.target.value); updateField('items', items);
                }} />
              </div>
              <div className="md:col-span-2">
                <label className="text-[9px] font-black text-red-500 text-center urdu-text">کاٹ</label>
                <input type="number" step="0.001" className="w-full rounded-lg border-red-100 dark:border-slate-700 p-2 font-bold text-sm text-center bg-red-50/10 dark:bg-red-900/10 dark:text-red-400" value={item.katt || ''} onChange={(e) => {
                  const items = [...data.items]; items[idx].katt = Number(e.target.value); updateField('items', items);
                }} />
              </div>
              <div className="md:col-span-2">
                <label className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 text-center urdu-text">ریٹ</label>
                <input type="number" step="0.01" className="w-full rounded-lg border-emerald-100 dark:border-slate-700 p-2 font-black text-sm text-center bg-emerald-50/20 dark:bg-emerald-900/10 dark:text-white" value={item.rate || ''} onChange={(e) => {
                  const items = [...data.items]; items[idx].rate = Number(e.target.value); updateField('items', items);
                }} />
              </div>
              <div className="md:col-span-2 flex justify-between items-center px-2">
                <span className="font-black text-emerald-700 dark:text-emerald-400 text-xs">Rs {((item.weight - (item.quantity * item.katt)) / 40 * item.rate).toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                <button onClick={() => removeItem(item.id)} className="text-red-400 font-black hover:scale-125 transition-transform">×</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-blue-50/30 dark:bg-blue-950/10 p-6 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 space-y-4 transition-colors">
          <div className="flex justify-between items-center"><h4 className="font-black text-blue-900 dark:text-blue-400 urdu-text">اخراجات جمع (+)</h4><button onClick={() => addCustomExpense('plus')} className="text-[10px] bg-blue-600 text-white px-3 py-1.5 rounded-xl font-black urdu-text hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none">+ دیگر</button></div>
          <div className="grid grid-cols-2 gap-3">
             {[
               { field: 'add_commissionRate', label: 'کمیشن %' },
               { field: 'add_laborCharges', label: 'مزدوری' },
               { field: 'add_khaliBardanaRate', label: 'باردانہ' },
               { field: 'add_brokerageRate', label: 'بروکری' }
             ].map(f => (
               <input key={f.field} type="number" step="0.01" placeholder={f.label} className="p-3 rounded-xl border dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-center font-black outline-none focus:border-blue-500" value={(data as any)[f.field] || ''} onChange={(e) => updateField(f.field as keyof InvoiceData, Number(e.target.value))} />
             ))}
          </div>
          {(data.customExpenses || []).filter(e => e.impact === 'plus').map((exp) => (
            <div key={exp.id} className="flex gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl border border-blue-100 dark:border-slate-700">
              <input className="flex-1 text-right urdu-text font-bold outline-none text-sm bg-transparent dark:text-white" value={exp.name} onChange={(e) => {
                const exps = data.customExpenses.map(it => it.id === exp.id ? {...it, name: e.target.value} : it);
                updateField('customExpenses', exps);
              }} />
              <input type="number" className="w-20 text-center font-black text-sm bg-transparent dark:text-white" value={exp.amount || ''} onChange={(e) => {
                const exps = data.customExpenses.map(it => it.id === exp.id ? {...it, amount: Number(e.target.value)} : it);
                updateField('customExpenses', exps);
              }} />
              <button onClick={() => removeCustomExpense(exp.id)} className="text-red-300 dark:text-red-900/50 hover:text-red-500">×</button>
            </div>
          ))}
        </div>

        <div className="bg-red-50/30 dark:bg-red-950/10 p-6 rounded-[2rem] border border-red-100 dark:border-red-900/30 space-y-4 transition-colors">
          <div className="flex justify-between items-center"><h4 className="font-black text-red-900 dark:text-red-400 urdu-text">اخراجات منفی (-)</h4><button onClick={() => addCustomExpense('minus')} className="text-[10px] bg-red-600 text-white px-3 py-1.5 rounded-xl font-black urdu-text hover:bg-red-700 transition-colors shadow-lg shadow-red-200 dark:shadow-none">+ دیگر</button></div>
          <div className="grid grid-cols-2 gap-3">
             {[
               { field: 'commissionRate', label: 'کمیشن %' },
               { field: 'laborCharges', label: 'مزدوری' },
               { field: 'khaliBardanaRate', label: 'باردانہ' },
               { field: 'brokerageRate', label: 'بروکری' }
             ].map(f => (
               <input key={f.field} type="number" step="0.01" placeholder={f.label} className="p-3 rounded-xl border dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-center font-black outline-none focus:border-red-500" value={(data as any)[f.field] || ''} onChange={(e) => updateField(f.field as keyof InvoiceData, Number(e.target.value))} />
             ))}
          </div>
          {(data.customExpenses || []).filter(e => e.impact === 'minus').map((exp) => (
            <div key={exp.id} className="flex gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl border border-red-100 dark:border-slate-700">
              <input className="flex-1 text-right urdu-text font-bold outline-none text-sm bg-transparent dark:text-white" value={exp.name} onChange={(e) => {
                const exps = data.customExpenses.map(it => it.id === exp.id ? {...it, name: e.target.value} : it);
                updateField('customExpenses', exps);
              }} />
              <input type="number" className="w-20 text-center font-black text-sm bg-transparent dark:text-white" value={exp.amount || ''} onChange={(e) => {
                const exps = data.customExpenses.map(it => it.id === exp.id ? {...it, amount: Number(e.target.value)} : it);
                updateField('customExpenses', exps);
              }} />
              <button onClick={() => removeCustomExpense(exp.id)} className="text-red-300 dark:text-red-900/50 hover:text-red-500">×</button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-emerald-900 dark:bg-emerald-950 text-white p-8 rounded-[3rem] shadow-2xl text-center space-y-4 relative overflow-hidden transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            <div><span className="text-[10px] opacity-60 block urdu-text uppercase tracking-widest">صافی وزن</span><span className="text-2xl font-black">{activeNetWeight.toFixed(2)} کلو</span></div>
            <div><span className="text-[10px] opacity-60 block urdu-text uppercase tracking-widest">کل تھیلے</span><span className="text-2xl font-black">{totalBags}</span></div>
            <div><span className="text-[10px] opacity-60 block urdu-text uppercase tracking-widest">جمع رقم</span><span className="text-2xl font-black text-blue-300">Rs {totalAdditions.toLocaleString()}</span></div>
            <div><span className="text-[10px] opacity-60 block urdu-text uppercase tracking-widest">منفی رقم</span><span className="text-2xl font-black text-red-300">Rs {totalDeductions.toLocaleString()}</span></div>
          </div>
          <div className="border-t border-white/10 pt-6 relative z-10">
             <p className="text-xs opacity-50 urdu-text mb-1 uppercase tracking-widest">صافی قابلِ ادائیگی رقم</p>
             <p className="text-5xl font-black tracking-tight">Rs {finalPayable.toLocaleString(undefined, {maximumFractionDigits:0})}</p>
          </div>
      </div>
    </div>
  );
};

export default InvoiceForm;

