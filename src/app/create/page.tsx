"use client";

import { Nav } from "@/components/layout/Nav";
import { useToast } from "@/components/ui/use-toast";
import { useDeployRevnetRelay } from "@/lib/relayr/hooks/useDeployRevnetRelay";
import { Formik } from "formik";
import { readErc2771ForwarderNonces } from "juice-sdk-core";
import { erc2771ForwarderAbi, erc2771ForwarderAddress } from "juice-sdk-react";
import { useState } from "react";
import { revDeployerAbi, revDeployerAddress } from "revnet-sdk";
import { encodeFunctionData } from "viem";
import { sepolia } from "viem/chains";
import { useAccount, useConfig, useSignTypedData } from "wagmi";
import { DEFAULT_FORM_DATA } from "./constants";
import { DeployRevnetForm } from "./form/DeployRevnetForm";
import { parseDeployData } from "./helpers/parseDeployData";
import { parseSuckerDeployerConfig } from "./helpers/parseSuckerDeployerConfig";
import { pinProjectMetadata } from "./helpers/pinProjectMetaData";
import { RevnetFormData } from "./types";
import { reset } from "viem/actions";

export default function Page() {
  const [isLoadingIpfs, setIsLoadingIpfs] = useState<boolean>(false);
  const { toast } = useToast();

  const config = useConfig();
  const { signTypedData } = useSignTypedData();
  const { address } = useAccount();
  const { deployRevnet } = useDeployRevnetRelay();

  const isLoading = isLoadingIpfs || deployRevnet.isPending;

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

    /**
     *  1. Build revnet data
     */
    const deployData = parseDeployData(formData, {
      metadataCid,
      chainId: sepolia.id,
      suckerDeployerConfig: suckerDeployerConfig,
    });
    const encodedData = encodeFunctionData({
      abi: revDeployerAbi, // ABI of the contract
      functionName: "deployFor",
      args: deployData,
    });

    /**
     *  2. Sign a ForwardRequest
     */
    const deadline = Number(
      ((Date.now() + 3600 * 48 * 1000) / 1000).toFixed(0)
    );
    const nonce = await readErc2771ForwarderNonces(config, {
      chainId: sepolia.id, // TODO do for each chain
      args: [address],
    });
    signTypedData(
      {
        domain: {
          name: "Juicebox",
          chainId: sepolia.id,
          verifyingContract: erc2771ForwarderAddress[sepolia.id],
          version: "1",
        },
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
          gas: 1_000_000n,
          deadline,
          nonce,
          data: encodedData,
        },
      },

      {
        onError: (e) => {
          console.error(e);
        },
        onSuccess: (signature) => {
          /**
           *  3. Build ERC2771Forwarder.execute call data
           *     Includes the signature from the previous step
           */
          const executeData = encodeFunctionData({
            abi: erc2771ForwarderAbi, // ABI of the contract
            functionName: "execute",
            args: [
              {
                from: address,
                to: revDeployerAddress[sepolia.id],
                value: 0n,
                gas: 1_000_000n,
                deadline,
                data: encodedData,
                signature,
              },
            ],
          });

          /**
           *  4. Send to Relayr
           */
          deployRevnet.mutateAsync([
            {
              chain: sepolia.id,
              data: executeData,
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
          relayrResponse={deployRevnet.data}
          isLoading={isLoading}
        />
      </Formik>
    </>
  );
}
