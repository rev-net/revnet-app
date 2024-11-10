import { JBChainId } from "juice-sdk-react";

export type ChainPayment = {
  amount: `0x${string}`;
  calldata: `0x${string}`;
  chain: JBChainId;
  payment_deadline: string;
  target: `0x${string}`;
  token: `0x${string}`;
}

type TransactionRequest = {
  chain: JBChainId;
  target: `0x${string}`;
  data: `0x${string}`;
  value: `0x${string}`;
  gas_limit: `0x${string}`;
  virtual_nonce: null | number;
}

export type TransactionStatus = {
  state: "Pending" | "Completed" | "Failed" | "Included";
  data?: { hash: `0x${string}` };
}

type Transaction = {
  tx_uuid: string;
  request: TransactionRequest;
  status: TransactionStatus;
}

type PerTransaction = {
  gas_cost: number;
  priced_in: { asset: string; type: string; }
  value: number;
}

export type RelayrPostBundleResponse = {
  bundle_uuid: string;
  payment_info: ChainPayment[]
  per_txn: PerTransaction[];
  txn_uuids: string[];
}

export type RelayrGetBundleResponse = {
  bundle_uuid: string;
  created_at: string;
  expires_at: string;
  payment: ChainPayment[];
  payment_received: boolean;
  transactions: Transaction[];
}
