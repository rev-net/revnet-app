"use client";

import { useJBContractContext } from "@bananapus/nana-sdk-react";
import { V6PayCard } from "../v6/pay/V6PayCard";
import { PayForm } from "./PayForm";
import { SelectedSuckerProvider } from "./SelectedSuckerContext";

export function PayCard() {
  const { version } = useJBContractContext();

  return (
    <div className="flex flex-col rounded-xl w-full">
      {/* <h2 className="mb-4">Join network</h2> */}
      <SelectedSuckerProvider>
        {version === 6 ? <V6PayCard /> : <PayForm />}
      </SelectedSuckerProvider>
    </div>
  );
}
