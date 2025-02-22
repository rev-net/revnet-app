"use client";

import { Nav } from "@/components/layout/Nav";
import { useToast } from "@/components/ui/use-toast";
import { Formik } from "formik";
import { useState } from "react";
import { revDeployerAbi, revDeployerAddress } from "revnet-sdk";
import { encodeFunctionData } from "viem";
import { useAccount } from "wagmi";
import { DEFAULT_FORM_DATA } from "./constants";
import { DeployRevnetForm } from "./form/DeployRevnetForm";
import { parseDeployData } from "./helpers/parseDeployData";
import { parseSuckerDeployerConfig } from "juice-sdk-core";
import { pinProjectMetadata } from "./helpers/pinProjectMetaData";
import { RevnetFormData } from "./types";
import { useGetRelayrTxQuote } from "juice-sdk-react";

export default function Page() {
  const [isLoadingIpfs, setIsLoadingIpfs] = useState<boolean>(false);
  const { toast } = useToast();
  const { address } = useAccount();

  const { getRelayrTxQuote, isPending, data } = useGetRelayrTxQuote();

  const isLoading = isLoadingIpfs || isPending;

  async function deployProject(formData: RevnetFormData) {
    console.log({ formData });

    if (!address) {
      console.warn("no wallet connected, aborting deploy");
      return;
    }

    // Upload metadata
    setIsLoadingIpfs(true);
    const metadataCid = await pinProjectMetadata({
      name: formData.name,
      description: formData.description,
      logoUri: formData.logoUri,
    });
    setIsLoadingIpfs(false);

    const relayrTransactions = formData.chainIds.map((chainId) => {
      const suckerDeployerConfig = parseSuckerDeployerConfig(
        chainId,
        formData.chainIds
      );
      const deployData = parseDeployData(formData, {
        metadataCid,
        chainId,
        suckerDeployerConfig,
      });
      const encodedData = encodeFunctionData({
        abi: revDeployerAbi, // ABI of the contract
        functionName: "deployFor",
        args: deployData,
      });

      console.log("create::deploy calldata", chainId, encodedData);

      return {
        data: {
          from: address,
          to: revDeployerAddress[chainId],
          value: 0n,
          gas: 1_000_000n,
          data: encodedData,
        },
        chainId,
      };
    });

    await getRelayrTxQuote(relayrTransactions);
  }

  return (
    <>
      <Nav />
      <Formik
        initialValues={DEFAULT_FORM_DATA}
        onSubmit={(formData: RevnetFormData) => {
          try {
            deployProject?.(formData);
          } catch (e: any) {
            setIsLoadingIpfs(false);
            toast({
              variant: "destructive",
              title: "Error",
              description: e.message || "Error encoding transaction",
            });
            console.error(e);
          }
        }}
      >
        <DeployRevnetForm relayrResponse={data} isLoading={isLoading} />
      </Formik>
    </>
  );
}
