import { useFormikContext } from "formik";
import { RevnetFormData } from "../types";
import { FieldGroup } from "./Fields";
import { IpfsImageUploader } from "@/components/IpfsFileUploader";
import { ipfsUri } from "@/lib/ipfs";

export function DetailsPage({
  disabled = false
}: {
  disabled?: boolean
}) {
  const { setFieldValue } =
    useFormikContext<RevnetFormData>();

  return (
    <>
      <h1 className="mb-16 text-2xl md:col-span-3 font-semibold">
        Design and deploy a tokenized revnet for your project
      </h1>
      <div className="md:col-span-1">
        <h2 className="font-bold text-lg mb-2">1. Look and feel</h2>
      </div>
      <div className="md:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_2fr] sm:gap-6">
          <FieldGroup id="name" name="name" label="Name" disabled={disabled} />
          <FieldGroup
            id="tokenSymbol"
            name="tokenSymbol"
            label="Ticker"
            placeholder="MOON"
            prefix="$"
            disabled={disabled}
          />
          <div>
            <label
              className="block mb-1 text-md font-semibold text-gray-900 dark:text-white"
              htmlFor="file_input"
            >
              Logo
            </label>
            <IpfsImageUploader
              onUploadSuccess={(cid) => {
                setFieldValue("logoUri", ipfsUri(cid));
              }}
              disabled={disabled}
            />
          </div>
        </div>
        <FieldGroup
          id="description"
          name="description"
          label="Description"
          component="textarea"
          rows={2}
          className="max-w-lg"
          placeholder="What is your project about?"
          disabled={disabled}
        />
      </div>
    </>
  );
}
