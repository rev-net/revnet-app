export type ChainPayment = {
  chain: number;
  token: `0x${string}`;
  amount: `0x${string}`;
  target: `0x${string}`;
  calldata: `0x${string}`;
  payment_deadline: string;
}

type TransactionRequest = {
  chain: number;
  target: `0x${string}`;
  data: `0x${string}`;
  value: `0x${string}`;
  gas_limit: `0x${string}`;
  virtual_nonce: null | number;
}

type TransactionStatus = {
  state: "Pending" | "Completed" | "Failed" | "Included";
  data?: { hash: `0x${string}` };
}

type Transaction = {
  tx_uuid: string;
  request: TransactionRequest;
  status: TransactionStatus;
}

export type RelayrAPIResponse = {
  bundle_uuid: string;
  payment_info: ChainPayment[];
  payment_received: boolean;
  transactions: Transaction[];
  created_at: string;
  expires_at: string;
}
