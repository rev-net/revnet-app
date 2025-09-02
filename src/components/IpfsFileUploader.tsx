import { ipfsGatewayUrl } from "@/lib/ipfs";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { useMutation } from "wagmi/query";

export type InfuraPinResponse = {
  Hash: string;
};

export const pinFile = async (file: File | Blob | string, options?: { signal?: AbortSignal }) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("https://api.juicebox.money/api/ipfs/file", {
    method: "POST",
    body: formData,
    signal: options?.signal,
    // Note: Don't set Content-Type header - fetch will set it automatically with boundary for FormData
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const data: InfuraPinResponse = await res.json();
  return data;
};

export function IpfsImageUploader({
  onUploadSuccess,
  disabled = false,
}: {
  onUploadSuccess: (cid: string) => void;
  disabled?: boolean;
}) {
  const uploadFile = useMutation({
    mutationFn: async (file: File) => {
      const ipfsCid = await pinFile(file);
      onUploadSuccess(ipfsCid.Hash);

      return ipfsCid;
    },
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadFile.mutate(file);
  };

  return (
    <div className="mb-5">
      <input
        className={twMerge(
          "text-md focus:border-primary focus:shadow-te-primary dark:focus:border-primary block w-full rounded border border-solid border-zinc-300 bg-clip-padding px-3 py-[0.32rem] font-normal text-zinc-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-zinc-100 file:px-3 file:py-[0.32rem] file:text-zinc-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-zinc-200 focus:text-zinc-700 focus:outline-none dark:border-zinc-600 dark:text-zinc-200 dark:file:bg-zinc-700 dark:file:text-zinc-100",
          (disabled || uploadFile.isPending) &&
            "cursor-not-allowed file:bg-zinc-100 file:text-zinc-400 hover:file:bg-zinc-100",
        )}
        id="file_input"
        type="file"
        disabled={disabled || uploadFile.isPending}
        onChange={handleFileChange}
        accept="image/jpeg,image/png"
      />
      {uploadFile.isPending && <div className="text-md text-gray-500">Uploading...</div>}
      {uploadFile.error && (
        <div className="text-md text-red-500">Logo upload failed, try again.</div>
      )}
      {uploadFile.data && (
        <div className="mt-3 overflow-hidden">
          <Image
            src={ipfsGatewayUrl(uploadFile.data.Hash)}
            alt="Uploaded file"
            width={80}
            height={200}
          />
        </div>
      )}
    </div>
  );
}
