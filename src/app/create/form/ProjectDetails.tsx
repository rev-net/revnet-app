import { IpfsImageUploader } from "@/components/IpfsFileUploader";
import { ipfsUri } from "@/lib/ipfs";
import { FieldGroup } from "./Fields";
import { useCreateForm } from "./useCreateForm";

export function ProjectDetails({ disabled = false }: { disabled?: boolean }) {
  const { setFieldValue } = useCreateForm();

  return (
    <>
      <h1 className="mb-16 text-2xl md:col-span-3 font-semibold">
        Design and deploy a revnet for your project
      </h1>
      <div className="md:col-span-1">
        <h2 className="font-bold text-lg mb-2">1. Look</h2>
      </div>
      <div className="md:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_2fr] sm:gap-6">
          <FieldGroup id="name" name="name" label="Name" disabled={disabled} />
          <FieldGroup
            id="tokenSymbol"
            name="tokenSymbol"
            label="Ticker"
            maxLength={10}
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
          label="About"
          component="textarea"
          rows={3}
          placeholder="What is the gist?"
          disabled={disabled}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <FieldGroup
            id="twitter"
            name="twitter"
            label="Twitter"
            placeholder="username..."
            autoComplete="off"
            disabled={disabled}
          />
          <FieldGroup
            id="telegram"
            name="telegram"
            label="Telegram"
            placeholder="t.me/yourchannel..."
            autoComplete="off"
            disabled={disabled}
          />
          <FieldGroup
            id="discord"
            name="discord"
            label="Discord"
            placeholder="discord.gg/your-invite..."
            autoComplete="off"
            disabled={disabled}
          />
          <FieldGroup
            id="infoUri"
            name="infoUri"
            label="Website"
            placeholder="example.com..."
            autoComplete="off"
            inputMode="url"
            disabled={disabled}
          />
        </div>
      </div>
    </>
  );
}
