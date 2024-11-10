import { PayForm } from "./PayForm";

export function PayCard() {
  return (
    <div className="flex flex-col p-5 rounded-xl bg-zinc-50 border border-black-800 w-full shadow-lg">
      {/* <h2 className="mb-4">Join network</h2> */}
      <PayForm />
    </div>
  );
}
