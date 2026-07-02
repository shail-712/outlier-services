'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Country, VAC, CartItem, PaymentMode, Currency, TransactionRecord } from '@/types';
import { api } from '@/lib/api';

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

  // Checkout — now async since it hits the API
  checkout: () => Promise<TransactionRecord[] | null>;
  checkoutError: string | null;
  isCheckingOut: boolean;

  // Computed
  grandTotal: number;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedVAC, setSelectedVAC] = useState<VAC | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMode | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

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

  // Now hits POST /api/transactions instead of building the record locally.
  // Prices/totals are computed server-side; the response shape (flat
  // TransactionRecord[]) is identical to what the old local version returned,
  // so CartSummary / CheckoutModal / TransactionHistory need no changes.
  const checkout = async (): Promise<TransactionRecord[] | null> => {
    if (!selectedVAC || !selectedPayment || !selectedCurrency || !selectedCountry || cart.length === 0) {
      return null;
    }

    setCheckoutError(null);
    setIsCheckingOut(true);

    try {
      const records = await api.createTransaction({
        VAC_Code: selectedVAC.VAC_Code,
        Country_Code: selectedCountry.Country_Code,
        Payment_Code: selectedPayment.Payment_Code,
        Currency_Code: selectedCurrency.Currency_Code,
        line_items: cart.map((item) => ({
          Service_Code: item.service.Service_Code,
          Quantity: item.quantity,
        })),
      });

      setTransactions((prev) => [...records, ...prev]);
      clearCart();
      return records;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Checkout failed');
      return null;
    } finally {
      setIsCheckingOut(false);
    }
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
        checkoutError,
        isCheckingOut,
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