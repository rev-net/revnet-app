"use client";

import { Nav } from "@/components/layout/Nav";
import { useToast } from "@/components/ui/use-toast";
import { useDeployRevnetRelay } from "@/lib/relayr/hooks/useDeployRevnetRelay";
import { Formik } from "formik";
import { useState } from "react";
import { revDeployerAbi, revDeployerAddress } from "revnet-sdk";
import { encodeFunctionData } from "viem";
import { sepolia } from "viem/chains";
import { useAccount, useSignTypedData } from "wagmi";
import { DEFAULT_FORM_DATA } from "./constants";
import { DeployRevnetForm } from "./form/DeployRevnetForm";
import { parseDeployData } from "./helpers/parseDeployData";
import { parseSuckerDeployerConfig } from "./helpers/parseSuckerDeployerConfig";
import { pinProjectMetadata } from "./helpers/pinProjectMetaData";
import { RevnetFormData } from "./types";

export default function Page() {
  const [isLoadingIpfs, setIsLoadingIpfs] = useState<boolean>(false);
  const { toast } = useToast();
  const {
    write,
    response,
    isLoading: isRelayrLoading,
    reset,
  } = useDeployRevnetRelay();

  const { signTypedData, data: signedData } = useSignTypedData();
  const { address } = useAccount();
  const { write: deployRevnet } = useDeployRevnetRelay();

  const isLoading = isLoadingIpfs || isRelayrLoading;

  async function deployProject(formData: RevnetFormData) {
    console.log({ formData });
    // Upload metadata
    setIsLoadingIpfs(true);
    const metadataCid = await pinProjectMetadata({
      name: formData.name,
      description: formData.description,
      logoUri: formData.logoUri,
    });
    setIsLoadingIpfs(false);

    if (!address) return;
    const suckerDeployerConfig = parseSuckerDeployerConfig();

    const deployData = parseDeployData(formData, {
      metadataCid,
      chainId: sepolia.id,
      suckerDeployerConfig: suckerDeployerConfig,
    });

    debugger;

    const encodedData = encodeFunctionData({
      abi: revDeployerAbi, // ABI of the contract
      functionName: "deployFor",
      args: deployData,
    });

    signTypedData(
      {
        primaryType: "ForwardRequest",
        types: {
          ForwardRequest: [
            {
              name: "from",
              type: "address",
            },
            {
              name: "to",
              type: "address",
            },
            {
              name: "value",
              type: "uint256",
            },
            {
              name: "gas",
              type: "uint256",
            },
            {
              name: "nonce",
              type: "uint256",
            },
            {
              name: "deadline",
              type: "uint48",
            },
            {
              name: "data",
              type: "bytes",
            },
          ],
        },
        message: {
          from: address,
          to: revDeployerAddress[sepolia.id],
          value: 0n,
          gas: 0n,
          deadline: 0,
          nonce: 0n,
          data: encodedData,
        },
      },
      {
        onSuccess: (d) => {
          console.log("encoded!", d);
          deployRevnet([
            {
              chain: sepolia.id,
              data: d,
            },
          ]);
        },
      }
    );
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
        <DeployRevnetForm
          relayrResponse={response}
          isLoading={isLoading}
          reset={reset}
        />
      </Formik>
    </>
  );
}
