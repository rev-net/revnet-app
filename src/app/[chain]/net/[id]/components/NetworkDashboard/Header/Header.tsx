import EtherscanLink from "@/components/EtherscanLink";
import { NativeTokenValue } from "@/components/NativeTokenValue";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs";
import { ForwardIcon } from "@heroicons/react/24/solid";
import {
  useJBContractContext,
  useJBProjectMetadataContext,
  useJBTokenContext,
} from "juice-sdk-react";
import Image from "next/image";
import { useNativeTokenSurplus } from "@/hooks/useTokenASurplus";
import { ProjectsDocument } from "@/generated/graphql";
import { useSubgraphQuery } from "@/graphql/useSubgraphQuery";
import { formatTokenSymbol } from "@/lib/utils";

export function Header() {
  const { projectId } = useJBContractContext();
  const { metadata } = useJBProjectMetadataContext();
  const { token } = useJBTokenContext();

  const { data: projects } = useSubgraphQuery(ProjectsDocument, {
    where: {
      projectId: Number(projectId),
    },
    first: 1,
  });
  const { data: nativeTokenSurplus } = useNativeTokenSurplus();

  const { contributorsCount } = projects?.projects?.[0] ?? {};
  const { name: projectName, logoUri } = metadata?.data ?? {};

  return (
    <header className="mb-10">
      <div className="flex items-center gap-4">
        {logoUri ? (
          <Image
            src={ipfsUriToGatewayUrl(logoUri)}
            className="rounded-md overflow-hidden block"
            alt={"revnet logo"}
            width={80}
            height={80}
          />
        ) : (
          <div className="rounded-lg bg-zinc-100 h-20 w-20 flex items-center justify-center">
            <ForwardIcon className="h-5 w-5 text-zinc-700" />
          </div>
        )}

        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {projectName}
            </h1>
            {token?.data ? (
              <EtherscanLink
                value={token.data.address}
                className="text-zinc-500"
              >
                {formatTokenSymbol(token)}
              </EtherscanLink>
            ) : null}
          </div>
          <div className="flex gap-4">
            {typeof nativeTokenSurplus !== "undefined" ? (
              <span className="text-sm">
                <span className="font-medium text-zinc-500">
                  <NativeTokenValue wei={nativeTokenSurplus} />
                </span>{" "}
                <span className="text-zinc-500">TVL</span>
              </span>
            ) : null}
            <span className="text-sm">
              <span className="font-medium text-zinc-500">
                {contributorsCount ?? 0}
              </span>{" "}
              <span className="text-zinc-500">
                {contributorsCount === 1 ? "holder" : "holders"}
              </span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
