"use client";

import { FieldGroup } from "@/app/create/form/Fields";
import { pinProjectMetadata } from "@/app/create/helpers/pinProjectMetaData";
import { IpfsImageUploader } from "@/components/IpfsFileUploader";
import { RelayrPaymentSelect } from "@/components/RelayrPaymentSelect";
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
import { Project } from "@/generated/graphql";
import { useTokenA } from "@/hooks/useTokenA";
import { ipfsUri } from "@/lib/ipfs";
import { formatWalletError } from "@/lib/utils";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { getPublicClient } from "@wagmi/core";
import { Formik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import { JBChainId, jbControllerAbi, JBCoreContracts } from "juice-sdk-core";
import {
  ChainPayment,
  RelayrPostBundleResponse,
  useGetRelayrTxQuote,
  useJBContractContext,
  useJBProjectMetadataContext,
  useSendRelayrTx,
} from "juice-sdk-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { encodeFunctionData } from "viem";
import { useAccount, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { z } from "zod";

const metadataSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50, "Name is too long"),
  description: z.string().trim().min(1, "Description is required"),
  logoUri: z.string().optional(),
});

type MetadataFormData = z.infer<typeof metadataSchema>;

interface Props {
  projects: Array<Pick<Project, "projectId" | "token" | "chainId">>;
}

export function EditMetadataDialog({ projects }: Props) {
  const [open, setOpen] = useState(false);
  const { metadata } = useJBProjectMetadataContext();
  const { contractAddress } = useJBContractContext();
  const { toast } = useToast();
  const router = useRouter();
  const { address, chainId: connectedChainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const [callbackCalled, setCallbackCalled] = useState(false);
  const { symbol: tokenSymbol } = useTokenA();

  const { getRelayrTxQuote, reset: resetRelayr } = useGetRelayrTxQuote();
  const { sendRelayrTx } = useSendRelayrTx();
  const [relayrQuote, setRelayrQuote] = useState<RelayrPostBundleResponse | null>(null);
  const [selectedPayment, selectPayment] = useState<ChainPayment | null>(null);

  const { writeContractAsync, isPending, data: txHash } = useWriteContract();

  const { isLoading: isTxLoading, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const resetQuote = useCallback(() => {
    setRelayrQuote(null);
    selectPayment(null);
    resetRelayr();
  }, [resetRelayr, selectPayment, setRelayrQuote]);

  const onSuccess = useCallback(() => {
    setOpen(false);
    resetQuote();

    toast({
      title: "Metadata updated!",
      description: "New data will be visible shortly.",
    });
    setTimeout(() => {
      (metadata as any).refetch();
      router.refresh();
    }, 5000);
  }, [toast, metadata, router, resetQuote]);

  useEffect(() => {
    if (!open || !isSuccess || callbackCalled) return;
    onSuccess();
    setCallbackCalled(true);
  }, [isSuccess, open, callbackCalled, onSuccess]);

  const handleSubmit = async (values: MetadataFormData, { setSubmitting }: any) => {
    try {
      if (!address) throw new Error("Please connect your wallet");

      setSubmitting(true);

      const metadataCid = await pinProjectMetadata({
        name: values.name,
        description: values.description,
        logoUri: values.logoUri || metadata?.data?.logoUri,
      });

      const metadataUri = ipfsUri(metadataCid);
      setCallbackCalled(false);

      // Single chain - use direct writeContract
      if (projects.length === 1) {
        const project = projects[0];
        const chainId = project.chainId as JBChainId;

        if (connectedChainId !== chainId) {
          await switchChainAsync?.({ chainId });
        }

        await writeContractAsync({
          abi: jbControllerAbi,
          functionName: "setUriOf",
          chainId,
          address: contractAddress(JBCoreContracts.JBController, chainId),
          args: [BigInt(project.projectId), metadataUri],
        });

        toast({
          title: "Transaction submitted",
          description: "Awaiting confirmation...",
        });

        return;
      }

      // Multi-chain - use relayr
      const relayrTransactions = [];

      for (const project of projects) {
        const chainId = project.chainId as JBChainId;

        const controller = contractAddress(JBCoreContracts.JBController, chainId);
        const args = [BigInt(project.projectId), metadataUri] as const;

        const gasEstimate = await getPublicClient(wagmiConfig, { chainId }).estimateContractGas({
          address: controller,
          abi: jbControllerAbi,
          functionName: "setUriOf",
          args,
          account: address,
        });

        relayrTransactions.push({
          data: {
            from: address,
            to: controller,
            value: 0n,
            gas: gasEstimate + 50_000n,
            data: encodeFunctionData({ abi: jbControllerAbi, functionName: "setUriOf", args }),
          },
          chainId,
        });
      }

      const quote = await getRelayrTxQuote(relayrTransactions);
      if (!quote) throw new Error("Failed to get relayr tx quote");

      setRelayrQuote(quote);
      selectPayment(quote.payment_info[0]);
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: formatWalletError(e) || "Failed to update metadata",
      });
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayAndSubmit = async () => {
    if (!relayrQuote || !selectedPayment || !sendRelayrTx) return;

    try {
      await sendRelayrTx(selectedPayment);

      toast({
        title: "Metadata updated!",
        description: "New data will be visible shortly.",
      });
      onSuccess();
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: formatWalletError(e) || "Failed to submit transaction",
      });
      console.error(e);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        resetQuote();
      }}
    >
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
          {({ handleSubmit, setFieldValue, isSubmitting }) => {
            const isLoading = isSubmitting || isPending || isTxLoading;
            return (
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
                      Leave empty to keep the current one.
                    </p>
                    <IpfsImageUploader
                      onUploadSuccess={(cid) => {
                        setFieldValue("logoUri", ipfsUri(cid));
                      }}
                      disabled={isLoading}
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

                {relayrQuote && (
                  <div className="py-4">
                    <RelayrPaymentSelect
                      payments={relayrQuote.payment_info}
                      tokenSymbol={tokenSymbol}
                      selectedPayment={selectedPayment}
                      onSelectPayment={selectPayment}
                      disabled={isLoading}
                    />
                  </div>
                )}

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  {relayrQuote ? (
                    <Button
                      type="button"
                      onClick={handlePayAndSubmit}
                      loading={isLoading}
                      disabled={isLoading}
                    >
                      Pay and submit
                    </Button>
                  ) : (
                    <Button type="submit" loading={isLoading} disabled={isLoading}>
                      {projects.length > 1 ? "Get quote" : "Save changes"}
                    </Button>
                  )}
                </DialogFooter>
              </form>
            );
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
