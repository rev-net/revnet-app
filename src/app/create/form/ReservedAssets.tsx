import { useCreateForm } from "./useCreateForm";

export function AssetsSection({ disabled = false }: { disabled?: boolean }) {
  const { setFieldValue, revnetTokenSymbol } = useCreateForm();

  return (
    <>
      <div className="md:col-span-1">
        <h2 className="font-bold text-lg mb-2">2. Assets</h2>
        <p className="text-zinc-600 text-lg">
          Pick which reserve asset will back the value of {revnetTokenSymbol}.
        </p>
      </div>
      <div className="mb-4 col-span-2">
        <span className="font-semibold text-md mr-4">Choose your reserve asset</span>
        <div className="flex flex-row gap-8 mt-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="reserveAsset"
              value="ETH"
              defaultChecked
              onChange={() => setFieldValue("reserveAsset", "ETH")}
              disabled={disabled}
            />
            ETH
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="reserveAsset"
              value="USDC"
              onChange={() => setFieldValue("reserveAsset", "USDC")}
              disabled={disabled}
            />
            USDC
          </label>
        </div>
      </div>
    </>
  );
}
