import { createContext, useContext, useState } from 'react';
import { ChainPayment } from '@/lib/revnet/hooks/useDeployRevnetRelay';

interface PayOptionsContextType {
  payOptions: ChainPayment[] | undefined;
  setPayOptions: (options: ChainPayment[] | undefined) => void;
  clearPayOptions: () => void;
}

export const PayOptionsContext = createContext<PayOptionsContextType | undefined>(undefined);

export function usePayOptions() {
  const context = useContext(PayOptionsContext);
  if (context === undefined) {
    throw new Error('usePayOptions must be used within a PayOptionsProvider');
  }
  return context;
}
