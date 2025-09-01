"use client";

import { PayForm } from "./PayForm";
import { SelectedSuckerProvider } from "./SelectedSuckerContext";

export function PayCard() {
  return (
    <div className="flex flex-col rounded-xl w-full">
      {/* <h2 className="mb-4">Join network</h2> */}
      <SelectedSuckerProvider>
        <PayForm />
      </SelectedSuckerProvider>
    </div>
  );
}
