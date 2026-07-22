import { JBChainId, SuckerPair } from "@bananapus/nana-sdk-core";
import { useJBChainId, useJBContractContext } from "@bananapus/nana-sdk-react";
import React, { createContext, ReactNode, useContext, useState } from "react";

interface SelectedSuckerContextType {
  selectedSucker: SuckerPair;
  setSelectedSucker: React.Dispatch<React.SetStateAction<SuckerPair>>;
}

const SelectedSuckerContext = createContext<SelectedSuckerContextType | undefined>(undefined);

export const SelectedSuckerProvider = ({ children }: { children: ReactNode }) => {
  const chainId = useJBChainId();
  const { projectId } = useJBContractContext();
  const [selectedSucker, setSelectedSucker] = useState<SuckerPair>(() => {
    return { peerChainId: chainId as JBChainId, projectId };
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
