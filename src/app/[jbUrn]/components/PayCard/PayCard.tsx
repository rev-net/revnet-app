import { SelectedSuckerProvider } from "./SelectedSuckerContext";
import { PayForm } from "./PayForm";

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
