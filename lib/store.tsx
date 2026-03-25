'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Order, OrderResponse } from './types';
import { MOCK_ORDERS, MOCK_RESPONSES } from './mock-data';

interface AppState {
  user: User | null;
  orders: Order[];
  responses: OrderResponse[];
}

interface AppContextType extends AppState {
  login: (email: string, password: string) => boolean;
  register: (user: Omit<User, 'id' | 'createdAt'>) => void;
  logout: () => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'responsesCount' | 'customerId' | 'customerName'>) => Order;
  addResponse: (response: Omit<OrderResponse, 'id' | 'createdAt' | 'designerId' | 'designerName' | 'designerCompany'>) => void;
  getOrderById: (id: string) => Order | undefined;
  getResponsesForOrder: (orderId: string) => OrderResponse[];
  getMyOrders: () => Order[];
  getMyResponses: () => OrderResponse[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function generateId() {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

function loadState(): AppState {
  if (typeof window === 'undefined') return { user: null, orders: MOCK_ORDERS, responses: MOCK_RESPONSES };
  try {
    const saved = localStorage.getItem('pm_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        user: parsed.user || null,
        orders: parsed.orders?.length ? parsed.orders : MOCK_ORDERS,
        responses: parsed.responses?.length ? parsed.responses : MOCK_RESPONSES,
      };
    }
  } catch {}
  return { user: null, orders: MOCK_ORDERS, responses: MOCK_RESPONSES };
}

function saveState(state: AppState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('pm_state', JSON.stringify(state));
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({ user: null, orders: MOCK_ORDERS, responses: MOCK_RESPONSES });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setState(loadState());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveState(state);
  }, [state, mounted]);

  const login = useCallback((email: string, _password: string) => {
    if (typeof window === 'undefined') return false;
    const users = JSON.parse(localStorage.getItem('pm_users') || '[]') as User[];
    const found = users.find((u) => u.email === email);
    if (found) {
      setState((prev) => ({ ...prev, user: found }));
      return true;
    }
    return false;
  }, []);

  const register = useCallback((userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
      const users = JSON.parse(localStorage.getItem('pm_users') || '[]') as User[];
      users.push(newUser);
      localStorage.setItem('pm_users', JSON.stringify(users));
    }
    setState((prev) => ({ ...prev, user: newUser }));
  }, []);

  const logout = useCallback(() => {
    setState((prev) => ({ ...prev, user: null }));
  }, []);

  const addOrder = useCallback((orderData: Omit<Order, 'id' | 'createdAt' | 'responsesCount' | 'customerId' | 'customerName'>) => {
    const newOrder: Order = {
      ...orderData,
      id: generateId(),
      customerId: state.user?.id || '',
      customerName: state.user?.name || '',
      responsesCount: 0,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, orders: [newOrder, ...prev.orders] }));
    return newOrder;
  }, [state.user]);

  const addResponse = useCallback((responseData: Omit<OrderResponse, 'id' | 'createdAt' | 'designerId' | 'designerName' | 'designerCompany'>) => {
    const newResponse: OrderResponse = {
      ...responseData,
      id: generateId(),
      designerId: state.user?.id || '',
      designerName: state.user?.name || '',
      designerCompany: state.user?.company,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      responses: [newResponse, ...prev.responses],
      orders: prev.orders.map((o) =>
        o.id === responseData.orderId
          ? { ...o, responsesCount: o.responsesCount + 1 }
          : o
      ),
    }));
  }, [state.user]);

  const getOrderById = useCallback((id: string) => {
    return state.orders.find((o) => o.id === id);
  }, [state.orders]);

  const getResponsesForOrder = useCallback((orderId: string) => {
    return state.responses.filter((r) => r.orderId === orderId);
  }, [state.responses]);

  const getMyOrders = useCallback(() => {
    return state.orders.filter((o) => o.customerId === state.user?.id);
  }, [state.orders, state.user]);

  const getMyResponses = useCallback(() => {
    return state.responses.filter((r) => r.designerId === state.user?.id);
  }, [state.responses, state.user]);

  return (
    <AppContext.Provider
      value={{
        ...state,
        login, register, logout,
        addOrder, addResponse,
        getOrderById, getResponsesForOrder,
        getMyOrders, getMyResponses,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
