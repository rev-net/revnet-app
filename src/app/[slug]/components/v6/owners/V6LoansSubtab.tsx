"use client";

import { EthereumAddress } from "@/components/EthereumAddress";
import { TableSkeleton } from "@/components/loading/LoadingSkeletons";
import { ChainLogo } from "@/components/ChainLogo";
import { Button } from "@/components/ui/button";
import { formatTokenSymbol } from "@/lib/utils";
import { JBChainId } from "@bananapus/nana-sdk-core";
import {
  useBendystrawQuery,
  useJBContractContext,
  useJBTokenContext,
} from "@bananapus/nana-sdk-react";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { ConnectKitButton } from "connectkit";
import gql from "graphql-tag";
import { useState } from "react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { LoanDetailsTable } from "../../Value/LoansDetailsTable";
import { ReallocateDialog } from "../../Value/ReallocateDialog";
import { RepayDialog } from "../../Value/RepayDialog";
import { ProjectItem } from "../shared";

type AllLoansRow = {
  id: string;
  borrowAmount: string;
  collateral: string;
  beneficiary: string;
  owner: string;
  createdAt: number;
  chainId: number;
};

type AllLoansQuery = { loans?: { items?: AllLoansRow[] | null; totalCount?: number } | null };
type AllLoansVars = { where: { projectId_in: number[]; version: number; chainId_in: number[] } };

/** website BENDYSTRAW_LOANS_QUERY parity: every active loan, not just yours. */
const AllLoansDocument = gql`
  query V6AllLoans($where: loanFilter) {
    loans(where: $where, orderBy: "createdAt", orderDirection: "desc", limit: 50) {
      items {
        id
        borrowAmount
        collateral
        beneficiary
        owner
        createdAt
        chainId
      }
      totalCount
    }
  }
` as TypedDocumentNode<AllLoansQuery, AllLoansVars>;

function AllLoansCard({
  projects,
  tokenSymbol,
  version,
}: {
  projects: ProjectItem[];
  tokenSymbol: string;
  version: number;
}) {
  const { data, isLoading } = useBendystrawQuery(AllLoansDocument, {
    where: {
      projectId_in: projects.map((p) => p.projectId),
      version,
      chainId_in: projects.map((p) => p.chainId),
    },
  });
  const rows = data?.loans?.items ?? [];

  return (
    <div className="mb-8">
      <h3 className="mb-2 text-base font-semibold text-zinc-700">Active loans</h3>
      {isLoading ? (
        <TableSkeleton rows={4} columns={5} />
      ) : rows.length === 0 ? (
        <div className="text-zinc-500">No active loans indexed.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500 border-b border-zinc-200">
                <th className="py-2 pr-4 font-medium">Chain</th>
                <th className="py-2 pr-4 font-medium">Owner</th>
                <th className="py-2 pr-4 font-medium">Borrowed</th>
                <th className="py-2 pr-4 font-medium">Collateral</th>
                <th className="py-2 font-medium">Opened</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((loan) => (
                <tr key={`${loan.chainId}:${loan.id}`} className="border-b border-zinc-100">
                  <td className="py-2 pr-4">
                    <ChainLogo chainId={loan.chainId as JBChainId} />
                  </td>
                  <td className="py-2 pr-4">
                    <EthereumAddress address={loan.owner as `0x${string}`} short withEnsName />
                  </td>
                  <td className="py-2 pr-4">
                    {Number(formatUnits(BigInt(loan.borrowAmount), 18)).toLocaleString("en-US", {
                      maximumFractionDigits: 4,
                    })}
                  </td>
                  <td className="py-2 pr-4">
                    {Number(formatUnits(BigInt(loan.collateral), 18)).toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}{" "}
                    {tokenSymbol}
                  </td>
                  <td className="py-2">{new Date(loan.createdAt * 1000).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/**
 * Loans subtab (website/ parity: renderLoansTable): every active REVLoan on the
 * project (indexed), plus the connected wallet's loans with per-loan Repay and
 * Refinance (reallocate collateral) entry points. The "Get a loan" flow lives on
 * the Accounts subtab's You card.
 */
export function V6LoansSubtab({ projects }: { projects: ProjectItem[] }) {
  const { projectId, version } = useJBContractContext();
  const { token } = useJBTokenContext();
  const tokenSymbol = formatTokenSymbol(token);
  const { address } = useAccount();

  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [selectedChainId, setSelectedChainId] = useState<JBChainId | null>(null);
  const [showRepayDialog, setShowRepayDialog] = useState(false);
  const [reallocateLoan, setReallocateLoan] = useState<any>(null);
  const [showReallocateDialog, setShowReallocateDialog] = useState(false);

  if (!address) {
    return (
      <div className="flex flex-col items-start gap-3">
        <AllLoansCard projects={projects} tokenSymbol={tokenSymbol} version={version} />
        <p className="text-md text-black font-light italic">
          Connect a wallet to see and manage your loans against {tokenSymbol} collateral.
        </p>
        <ConnectKitButton.Custom>
          {({ isConnecting, show }) => (
            <Button variant="outline" onClick={show} loading={isConnecting}>
              Connect wallet
            </Button>
          )}
        </ConnectKitButton.Custom>
      </div>
    );
  }

  return (
    <div>
      <AllLoansCard projects={projects} tokenSymbol={tokenSymbol} version={version} />

      <p className="text-md text-black font-light italic mb-2">
        Loans borrow against your {tokenSymbol} as collateral through REVLoans. Repay to reclaim
        collateral, or refinance to borrow against appreciated collateral.
      </p>

      <LoanDetailsTable
        title="Your loans"
        revnetId={projectId}
        address={address}
        chainId={0}
        tokenSymbol={tokenSymbol}
        projects={projects}
        onSelectLoan={(loanId, chainId) => {
          setSelectedLoanId(loanId);
          setSelectedChainId(chainId as JBChainId);
          setShowRepayDialog(true);
        }}
        onReallocateLoan={(loan) => {
          setReallocateLoan(loan);
          setShowReallocateDialog(true);
        }}
      />

      {selectedLoanId && selectedChainId && (
        <RepayDialog
          loanId={selectedLoanId}
          chainId={selectedChainId}
          projectId={projectId}
          open={showRepayDialog}
          onOpenChange={setShowRepayDialog}
        />
      )}

      {reallocateLoan && (
        <ReallocateDialog
          projectId={BigInt(projectId)}
          tokenSymbol={tokenSymbol}
          selectedLoan={reallocateLoan}
          open={showReallocateDialog}
          onOpenChange={(open) => {
            setShowReallocateDialog(open);
            if (!open) setReallocateLoan(null);
          }}
        >
          <div style={{ display: "none" }} />
        </ReallocateDialog>
      )}

    </div>
  );
}
