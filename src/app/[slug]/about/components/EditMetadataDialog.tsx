"use client";

import { FieldGroup } from "@/app/create/form/Fields";
import { pinProjectMetadata } from "@/app/create/helpers/pinProjectMetaData";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { IpfsImageUploader } from "@/components/IpfsFileUploader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { ipfsUri } from "@/lib/ipfs";
import { Formik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import { jbControllerAbi, JBCoreContracts } from "juice-sdk-core";
import { useJBChainId, useJBContractContext, useJBProjectMetadataContext } from "juice-sdk-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { z } from "zod";

const metadataSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50, "Name is too long"),
  description: z.string().trim().min(1, "Description is required"),
  logoUri: z.string().optional(),
});

type MetadataFormData = z.infer<typeof metadataSchema>;

export function EditMetadataDialog() {
  const [open, setOpen] = useState(false);
  const { metadata } = useJBProjectMetadataContext();
  const { projectId, contractAddress } = useJBContractContext();
  const chainId = useJBChainId();
  const { toast } = useToast();
  const router = useRouter();
  const { address } = useAccount();
  const [callbackCalled, setCallbackCalled] = useState(false);

  const { writeContractAsync, isPending, data: txHash } = useWriteContract();

  const { isLoading: isTxLoading, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (!open || !isSuccess || callbackCalled) return;

    toast({
      title: "Metadata updated!",
      description: "New data will be visible shortly.",
    });

    setOpen(false);
    setCallbackCalled(true);

    setTimeout(() => {
      (metadata as any).refetch();
    }, 5000);
  }, [isSuccess, open, router, toast, metadata, callbackCalled]);

  const handleSubmit = async (values: MetadataFormData, { setSubmitting }: any) => {
    try {
      if (!address) throw new Error("Please connect your wallet");
      if (!chainId) throw new Error("Chain ID not available");

      const metadataCid = await pinProjectMetadata({
        name: values.name,
        description: values.description,
        logoUri: values.logoUri || metadata?.data?.logoUri,
      });

      const metadataUri = ipfsUri(metadataCid);

      setCallbackCalled(false);

      await writeContractAsync({
        abi: jbControllerAbi,
        functionName: "setUriOf",
        chainId,
        address: contractAddress(JBCoreContracts.JBController),
        args: [projectId, metadataUri],
      });

      toast({
        title: "Transaction submitted",
        description: "Awaiting confirmation...",
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: e.message || "Failed to update metadata",
      });
      console.error(e);
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit metadata
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Formik
          initialValues={{
            name: metadata?.data?.name || "",
            description: metadata?.data?.description || "",
            logoUri: metadata?.data?.logoUri || "",
          }}
          validate={withZodSchema(metadataSchema) as any}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ handleSubmit, setFieldValue, isSubmitting }) => (
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Edit metadata</DialogTitle>
                <DialogDescription>
                  Update the project name, logo, and description.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <FieldGroup id="name" name="name" label="Name" />

                <div>
                  <label
                    className="block mb-1 text-md font-semibold text-gray-900 dark:text-white"
                    htmlFor="logo_input"
                  >
                    Logo
                  </label>
                  <p className="text-sm text-zinc-500 mb-2">
                    Upload a new logo or leave unchanged to keep the current one.
                  </p>
                  <IpfsImageUploader
                    onUploadSuccess={(cid) => {
                      setFieldValue("logoUri", ipfsUri(cid));
                    }}
                    disabled={isSubmitting || isPending || isTxLoading}
                  />
                </div>

                <FieldGroup
                  id="description"
                  name="description"
                  label="Description"
                  component="textarea"
                  rows={4}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting || isPending || isTxLoading}
                >
                  Cancel
                </Button>
                <ButtonWithWallet
                  type="submit"
                  targetChainId={chainId}
                  loading={isSubmitting || isPending || isTxLoading}
                  disabled={isSubmitting || isPending || isTxLoading}
                >
                  Save changes
                </ButtonWithWallet>
              </DialogFooter>
            </form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
