"use client";

import { Nav } from "@/components/layout/Nav";
import { useToast } from "@/components/ui/use-toast";
import { useDeployRevnetRelay } from "@/lib/relayr/hooks/useDeployRevnetRelay";
import { Formik } from "formik";
import { JBChainId, readErc2771ForwarderNonces } from "juice-sdk-core";
import { erc2771ForwarderAbi, erc2771ForwarderAddress } from "juice-sdk-react";
import { useState } from "react";
import { revDeployerAbi, revDeployerAddress } from "revnet-sdk";
import { Address, encodeFunctionData, Hash } from "viem";
import { useAccount, useConfig, useSignTypedData, useSwitchChain } from "wagmi";
import { DEFAULT_FORM_DATA } from "./constants";
import { DeployRevnetForm } from "./form/DeployRevnetForm";
import { parseDeployData } from "./helpers/parseDeployData";
import { parseSuckerDeployerConfig } from "./helpers/parseSuckerDeployerConfig";
import { pinProjectMetadata } from "./helpers/pinProjectMetaData";
import { RevnetFormData } from "./types";
import { sepolia } from "viem/chains";

type ERC2771ForwardRequestData = {
  from: Address;
  to: Address;
  value: bigint;
  gas: bigint;
  data: Hash;
};

function useSignErc2771ForwardRequest() {
  const { switchChain } = useSwitchChain();
  const { address } = useAccount();
  const config = useConfig();
  const { signTypedData } = useSignTypedData();

  async function sign(
    messageData: ERC2771ForwardRequestData,
    chainId: JBChainId
  ) {
    switchChain({ chainId });

    return new Promise<Hash>(async (resolve, reject) => {
      if (!address) return;

      // 48hrs
      const deadline = Number(
        ((Date.now() + 3600 * 48 * 1000) / 1000).toFixed(0)
      );

      const nonce = await readErc2771ForwarderNonces(config, {
        chainId,
        args: [address],
      });

      signTypedData(
        {
          domain: {
            name: "Juicebox",
            chainId,
            verifyingContract: erc2771ForwarderAddress[chainId],
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
          message: { ...messageData, deadline, nonce },
        },
        {
          onSuccess: (signature) => {
            const executeFnEncodedData = encodeFunctionData({
              abi: erc2771ForwarderAbi, // ABI of the contract
              functionName: "execute",
              args: [
                {
                  ...messageData,
                  deadline,
                  signature,
                },
              ],
            });

            resolve(executeFnEncodedData);
          },
          onError: (e) => {
            reject(e);
          },
        }
      );
    });
  }

  return {
    sign,
  };
}

function useGetRelayrTransactions() {
  const { deployRevnet } = useDeployRevnetRelay();
  const { sign } = useSignErc2771ForwardRequest();

  async function generateTxData(
    data: { chainId: JBChainId; data: ERC2771ForwardRequestData }[]
  ) {
    if (!data) return;

    /**
     * Prompt user to sign transactions for each chain
     */
    const txDataRequest = [];
    for (const d of data) {
      const signedData = await sign(d.data, d.chainId);
      txDataRequest.push({
        chain: d.chainId,
        data: signedData,
      });
    }
    debugger;
    return await deployRevnet.mutateAsync(txDataRequest);
  }

  return {
    generateTxData,
    deployRevnet,
  };
}

export default function Page() {
  const [isLoadingIpfs, setIsLoadingIpfs] = useState<boolean>(false);
  const { toast } = useToast();

  const { deployRevnet, generateTxData } = useGetRelayrTransactions();

  const { address } = useAccount();

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

    await generateTxData(
      formData.chainIds.map((chainId) => {
        const deployData = parseDeployData(formData, {
          metadataCid,
          chainId,
          suckerDeployerConfig: suckerDeployerConfig,
        });
        const encodedData = encodeFunctionData({
          abi: revDeployerAbi, // ABI of the contract
          functionName: "deployFor",
          args: deployData,
        });

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
      })
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
