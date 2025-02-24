import React, { createContext, useContext, useState, ReactNode } from "react";
import { SuckerPair } from "juice-sdk-core";
import { useJBChainId, useJBContractContext } from "juice-sdk-react";

interface SelectedSuckerContextType {
  selectedSucker: SuckerPair | undefined;
  setSelectedSucker: React.Dispatch<React.SetStateAction<SuckerPair | undefined>>;
}

const SelectedSuckerContext = createContext<SelectedSuckerContextType | undefined>(undefined);

export const SelectedSuckerProvider = ({ children }: { children: ReactNode }) => {
  const chainId = useJBChainId();
  const { projectId } = useJBContractContext();
  const [selectedSucker, setSelectedSucker] = useState<SuckerPair | undefined>(() => {
    return { peerChainId: chainId, projectId };
  });

  return (
    <SelectedSuckerContext.Provider value={{ selectedSucker, setSelectedSucker }}>
      {children}
    </SelectedSuckerContext.Provider>
  );
};

export const useSelectedSucker = () => {
  const context = useContext(SelectedSuckerContext);
  if (!context) {
    throw new Error("useSelectedSucker must be used within a SelectedSuckerProvider");
  }
  return context;
}; 
