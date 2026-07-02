export interface Region {
  Region_Code: string;
  Region_Name: string;
}

export interface Currency {
  Currency_Code: string;
  Currency_Name: string;
  Currency_Symbol: string;
  Country_Code: string;
}

export interface Country {
  Country_Code: string;
  Country_Name: string;
  Region_Code: string;
  Currency_Code: string;
}

export interface VAC {
  VAC_Code: string;
  VAC_Name: string;
  Country_Code: string;
}

export interface Service {
  Service_Code: string;
  Service_Name: string;
  Service_Type: 'VAS';
  Currency_Code: string;
  Unit_Price: number;
  Country_Code: string;
}

export interface PaymentMode {
  Payment_Code: string;
  Payment_Name: string;
  Currency_Code: string;
}

export interface TransactionRecord {
  Transaction_ID: number;
  VAC_Code: string;
  VAC_Name: string;
  Country_Name: string;
  Service_Code: string;
  Service_Name: string;
  Payment_Code: string;
  Payment_Name: string;
  Currency_Code: string;
  Currency_Symbol: string;
  Unit_Price: number;
  Quantity: number;
  Line_Total: number;
  Grand_Total: number;          // total for the whole checkout batch
  Transaction_Date: string;     // ISO string
  Transaction_Status: 'Completed' | 'Pending' | 'Failed';
  Batch_ID: string;             // groups line items from one checkout
}

export interface CartItem {
  service: Service;
  quantity: number;
  line_total: number;
}
