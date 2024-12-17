import { useFormikContext } from "formik";
import { RevnetFormData } from "../types";
import { FieldGroup } from "./Fields";
import { IpfsImageUploader } from "@/components/IpfsFileUploader";
import { ipfsUri } from "@/lib/ipfs";

export function DetailsPage() {
  const { setFieldValue, isSubmitting, isValid, initialErrors } =
    useFormikContext<RevnetFormData>();

  return (
    <>
      {/* Grid Container for Name, Ticker, and Upload Logo */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_2fr] sm:gap-6">
        <FieldGroup id="name" name="name" label="Name" />
        <FieldGroup
          id="tokenSymbol"
          name="tokenSymbol"
          label="Ticker"
          placeholder="MOON"
          prefix="$"
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
      />
    </>
  );
}
