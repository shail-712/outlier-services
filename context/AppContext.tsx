'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Country, VAC, CartItem, PaymentMode, Currency, TransactionRecord } from '@/types';

interface AppContextValue {
  // Selections
  selectedCountry: Country | null;
  selectedVAC: VAC | null;
  selectedPayment: PaymentMode | null;
  selectedCurrency: Currency | null;

  // Cart
  cart: CartItem[];

  // Transaction history (session-local)
  transactions: TransactionRecord[];

  // Setters
  setSelectedCountry: (c: Country | null) => void;
  setSelectedVAC: (v: VAC | null) => void;
  setSelectedPayment: (p: PaymentMode | null) => void;
  setSelectedCurrency: (c: Currency | null) => void;

  // Cart actions
  addToCart: (item: CartItem) => void;
  updateCartQuantity: (serviceCode: string, quantity: number) => void;
  removeFromCart: (serviceCode: string) => void;
  clearCart: () => void;

  // Checkout
  checkout: () => TransactionRecord[] | null;

  // Computed
  grandTotal: number;
}

const AppContext = createContext<AppContextValue | null>(null);

let transactionCounter = 1000;

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedVAC, setSelectedVAC] = useState<VAC | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMode | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.service.Service_Code === item.service.Service_Code);
      if (existing) {
        return prev.map((i) =>
          i.service.Service_Code === item.service.Service_Code
            ? { ...i, quantity: i.quantity + item.quantity, line_total: (i.quantity + item.quantity) * i.service.Unit_Price }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const updateCartQuantity = (serviceCode: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(serviceCode); return; }
    setCart((prev) =>
      prev.map((i) =>
        i.service.Service_Code === serviceCode
          ? { ...i, quantity, line_total: quantity * i.service.Unit_Price }
          : i
      )
    );
  };

  const removeFromCart = (serviceCode: string) => {
    setCart((prev) => prev.filter((i) => i.service.Service_Code !== serviceCode));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedPayment(null);
  };

  const handleSetSelectedCountry = (c: Country | null) => {
    setSelectedCountry(c);
    setSelectedVAC(null);
    setCart([]);
    setSelectedPayment(null);
    setSelectedCurrency(null);
  };

  const grandTotal = cart.reduce((sum, item) => sum + item.line_total, 0);

  const checkout = (): TransactionRecord[] | null => {
    if (!selectedVAC || !selectedPayment || !selectedCurrency || !selectedCountry || cart.length === 0) return null;

    const now = new Date().toISOString();
    const batchId = `BATCH-${Date.now()}`;
    const total = cart.reduce((s, i) => s + i.line_total, 0);

    const records: TransactionRecord[] = cart.map((item) => {
      transactionCounter += 1;
      return {
        Transaction_ID: transactionCounter,
        VAC_Code: selectedVAC.VAC_Code,
        VAC_Name: selectedVAC.VAC_Name,
        Country_Name: selectedCountry.Country_Name,
        Service_Code: item.service.Service_Code,
        Service_Name: item.service.Service_Name,
        Payment_Code: selectedPayment.Payment_Code,
        Payment_Name: selectedPayment.Payment_Name,
        Currency_Code: selectedCurrency.Currency_Code,
        Currency_Symbol: selectedCurrency.Currency_Symbol,
        Unit_Price: item.service.Unit_Price,
        Quantity: item.quantity,
        Line_Total: item.line_total,
        Grand_Total: total,
        Transaction_Date: now,
        Transaction_Status: 'Completed',
        Batch_ID: batchId,
      };
    });

    setTransactions((prev) => [...records, ...prev]);
    clearCart();
    return records;
  };

  return (
    <AppContext.Provider
      value={{
        selectedCountry,
        selectedVAC,
        selectedPayment,
        selectedCurrency,
        cart,
        transactions,
        setSelectedCountry: handleSetSelectedCountry,
        setSelectedVAC,
        setSelectedPayment,
        setSelectedCurrency,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        checkout,
        grandTotal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
