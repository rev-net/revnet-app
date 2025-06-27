"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAccount } from "wagmi";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { LoansByAccountDocument, ParticipantsDocument } from "@/generated/graphql";
import { useQueryClient } from "@tanstack/react-query";

interface AppDataContextType {
  // Token balances from GraphQL
  balances: ReturnType<typeof useBendystrawQuery>;
  
  // Loan data
  loans: ReturnType<typeof useBendystrawQuery>;
  
  // Cache invalidation methods
  invalidateUserData: () => void;
  invalidateLoans: () => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  // Fetch user token balances using GraphQL participants query
  const balances = useBendystrawQuery(ParticipantsDocument, {
    where: {
      address: address || "",
      balance_gt: 0, // Only get balances > 0
    },
    orderBy: "balance",
    orderDirection: "desc",
  }, {
    enabled: !!address, // Only fetch if user is connected
  });

  // Always fetch user loans (with polling)
  const loans = useBendystrawQuery(LoansByAccountDocument, {
    owner: address || "",
  }, {
    pollInterval: 5000, // Refresh every 5 seconds
    enabled: !!address, // Only fetch if user is connected
  });

  // Cache invalidation methods
  const invalidateUserData = () => {
    // Invalidate participant balance queries
    queryClient.invalidateQueries({
      queryKey: ["Participants", { where: { address: address || "", balance_gt: 0 } }]
    });
  };

  const invalidateLoans = () => {
    // Invalidate loan data queries
    queryClient.invalidateQueries({
      queryKey: ["LoansByAccount", { owner: address }]
    });
  };

  // Comprehensive data layer logging
  console.log('🔍 AppDataContext - Full Data Layer State:', {
    // User state
    address,
    isConnected: !!address,
    
    // Token balances from GraphQL
    balances: {
      isLoading: balances?.isLoading,
      isError: balances?.isError,
      data: balances?.data,
      participantsCount: balances?.data?.participants?.items?.length || 0,
      totalBalance: balances?.data?.participants?.items?.reduce((acc, participant) => 
        acc + BigInt(participant.balance || 0), 0n
      ) || 0n,
    },
    
    // Loan data
    loans: {
      isLoading: loans?.isLoading,
      isError: loans?.isError,
      data: loans?.data,
      loansCount: loans?.data?.loans?.items?.length || 0,
    },
    
    // Query client state
    queryClient: {
      queryCount: queryClient.getQueryCache().getAll().length,
    },
    
    // Timestamp for debugging
    timestamp: new Date().toISOString(),
  });

  const value: AppDataContextType = {
    balances,
    loans,
    invalidateUserData,
    invalidateLoans,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return context;
} 