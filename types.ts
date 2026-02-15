
export interface WeightEntry {
  id: string;
  weight: number;
  label: string;
}

export interface CustomExpense {
  id: string;
  name: string;
  amount: number;
  impact: 'plus' | 'minus';
}

export interface InvoiceItem {
  id: string;
  description: string;
  bharti: number;
  quantity: number;
  katt: number;
  rate: number; 
  weight: number; 
}

export interface InvoiceData {
  id?: string;
  shopName: string;
  address: string;
  phone: string;
  billNumber: string;
  partyName: string;
  date: string;
  trolleyNo: string;
  brokerName: string;
  ratePerMaund: number;
  
  // Deductions (-)
  commissionRate: number;
  khaliBardanaRate: number;
  brokerageRate: number;
  laborCharges: number;
  biltyCharges: number;
  
  // Additions (+)
  add_commissionRate: number;
  add_khaliBardanaRate: number;
  add_brokerageRate: number;
  add_laborCharges: number;
  add_biltyCharges: number;

  items: InvoiceItem[];
  weights: WeightEntry[];
  customExpenses: CustomExpense[];
}

export const DEFAULT_INVOICE: InvoiceData = {
  shopName: '',
  address: '',
  phone: '',
  billNumber: '',
  partyName: '',
  date: new Date().toISOString().split('T')[0],
  trolleyNo: '',
  brokerName: '',
  ratePerMaund: 0,
  
  commissionRate: 0,
  khaliBardanaRate: 0,
  brokerageRate: 0,
  laborCharges: 0,
  biltyCharges: 0,

  add_commissionRate: 0,
  add_khaliBardanaRate: 0,
  add_brokerageRate: 0,
  add_laborCharges: 0,
  add_biltyCharges: 0,

  items: [],
  weights: [],
  customExpenses: []
};

