import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'bank' | 'ewallet' | 'cash';
  name: string;
  accountNumber?: string;
  accountName?: string;
  qrCode?: string;
  qrCodeImage?: string;
}

export interface BusinessInfo {
  id: string;
  name: string;
  logo?: string;
  description: string;
}

export interface Order {
  id: string;
  businessId: string;
  items: {
    menuItem: MenuItem;
    quantity: number;
  }[];
  tableNumber?: string;
  queueNumber: string;
  paymentMethod: PaymentMethod;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: Date;
}

interface AppContextType {
  businessInfo: BusinessInfo | null;
  setBusinessInfo: (info: BusinessInfo) => void;
  menuItems: MenuItem[];
  setMenuItems: (items: MenuItem[]) => void;
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (id: string, item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  paymentMethods: PaymentMethod[];
  setPaymentMethods: (methods: PaymentMethod[]) => void;
  addPaymentMethod: (method: PaymentMethod) => void;
  updatePaymentMethod: (id: string, method: PaymentMethod) => void;
  deletePaymentMethod: (id: string) => void;
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [businessInfo, setBusinessInfoState] = useState<BusinessInfo | null>(() => {
    const saved = localStorage.getItem('ordy_business');
    return saved ? JSON.parse(saved) : null;
  });

  const [menuItems, setMenuItemsState] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('ordy_menu');
    return saved ? JSON.parse(saved) : [];
  });

  const [paymentMethods, setPaymentMethodsState] = useState<PaymentMethod[]>(() => {
    const saved = localStorage.getItem('ordy_payments');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrdersState] = useState<Order[]>(() => {
    const saved = localStorage.getItem('ordy_orders');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt),
      }));
    }
    return [];
  });

  useEffect(() => {
    if (businessInfo) {
      localStorage.setItem('ordy_business', JSON.stringify(businessInfo));
    }
  }, [businessInfo]);

  useEffect(() => {
    localStorage.setItem('ordy_menu', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('ordy_payments', JSON.stringify(paymentMethods));
  }, [paymentMethods]);

  useEffect(() => {
    localStorage.setItem('ordy_orders', JSON.stringify(orders));
  }, [orders]);

  const setBusinessInfo = (info: BusinessInfo) => {
    setBusinessInfoState(info);
  };

  const setMenuItems = (items: MenuItem[]) => {
    setMenuItemsState(items);
  };

  const addMenuItem = (item: MenuItem) => {
    setMenuItemsState(prev => [...prev, item]);
  };

  const updateMenuItem = (id: string, item: MenuItem) => {
    setMenuItemsState(prev => prev.map(i => i.id === id ? item : i));
  };

  const deleteMenuItem = (id: string) => {
    setMenuItemsState(prev => prev.filter(i => i.id !== id));
  };

  const setPaymentMethods = (methods: PaymentMethod[]) => {
    setPaymentMethodsState(methods);
  };

  const addPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethodsState(prev => [...prev, method]);
  };

  const updatePaymentMethod = (id: string, method: PaymentMethod) => {
    setPaymentMethodsState(prev => prev.map(m => m.id === id ? method : m));
  };

  const deletePaymentMethod = (id: string) => {
    setPaymentMethodsState(prev => prev.filter(m => m.id !== id));
  };

  const addOrder = (order: Order) => {
    setOrdersState(prev => [order, ...prev]);
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrdersState(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  return (
    <AppContext.Provider
      value={{
        businessInfo,
        setBusinessInfo,
        menuItems,
        setMenuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        paymentMethods,
        setPaymentMethods,
        addPaymentMethod,
        updatePaymentMethod,
        deletePaymentMethod,
        orders,
        addOrder,
        updateOrderStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}