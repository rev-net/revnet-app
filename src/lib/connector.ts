import sdk from "@farcaster/frame-sdk";
import { SwitchChainError, fromHex, getAddress, numberToHex } from "viem";
import { ChainNotConfiguredError, createConnector } from "wagmi";

frameConnector.type = "frameConnector" as const;

export function frameConnector() {
  let connected = false;

  return createConnector<typeof sdk.wallet.ethProvider>((config) => ({
    id: "farcaster",
    name: "Farcaster Wallet",
    type: frameConnector.type,

    async setup() {
      console.log("Setting up connector...", config);
      await this.connect({ chainId: config.chains[0].id });
    },

    async connect({ chainId } = {}) {
      console.log("Connecting to wallet...");

      const provider = await this.getProvider()
      console.log("Provider obtained:", provider);

      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });
      console.log("Accounts:", accounts);

      let currentChainId = await this.getChainId();
      console.log("Current chain ID:", currentChainId);

      if (chainId && currentChainId !== chainId) {
        try {
          const chain = await this.switchChain!({ chainId });
          currentChainId = chain.id;
          console.log("Switched to chain:", currentChainId);
        } catch (error) {
          console.error("Error switching chain:", error);
        }
      }

      connected = true;
      console.log("Connected successfully.");

      return {
        accounts: accounts.map((x) => getAddress(x)),
        chainId: currentChainId,
      };
    },

    async disconnect() {
      console.log("Disconnecting...");
      connected = false;
    },

    async getAccounts() {
      console.log("Fetching accounts...");
      if (!connected) throw new Error("Not connected");

      const provider = await this.getProvider();
      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });
      console.log("Accounts fetched:", accounts);
      return accounts.map((x) => getAddress(x));
    },

    async getChainId() {
      console.log("Fetching chain ID...");
      const provider = await this.getProvider();
      const hexChainId = await provider.request({ method: "eth_chainId" });
      const chainId = fromHex(hexChainId, "number");
      console.log("Chain ID:", chainId);
      return chainId;
    },

    async isAuthorized() {
      console.log("Checking authorization...");
      if (!connected) {
        console.log("Not connected.");
        return false;
      }

      const accounts = await this.getAccounts();
      const isAuthorized = !!accounts.length;
      console.log("Authorized:", isAuthorized);
      return isAuthorized;
    },

    async switchChain({ chainId }) {
      console.log("Switching chain to:", chainId);
      const provider = await this.getProvider();
      const chain = config.chains.find((x) => x.id === chainId);

      console.log("Provider switching chains. ", provider);

      if (!chain) {
        console.error("Chain not found in config:", chainId);
        throw new SwitchChainError(new ChainNotConfiguredError());
      }

      console.log("Found chain in config:", chain, chainId);
      try {
        console.log("about to call Switching chain...");
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: numberToHex(chainId) }],
        });
        console.log("Switched to chain:", chain);
      } catch (error) {
        console.error("Error switching chain:", error);
        throw error;
      }
      return chain;
    },

    onAccountsChanged(accounts) {
      console.log("Accounts changed:", accounts);
      if (accounts.length === 0) {
        this.onDisconnect();
      } else {
        config.emitter.emit("change", {
          accounts: accounts.map((x) => getAddress(x)),
        });
      }
    },

    onChainChanged(chain) {
      const chainId = Number(chain);
      console.log("Chain changed to:", chainId);
      config.emitter.emit("change", { chainId });
    },

    async onDisconnect() {
      console.log("Disconnecting...");
      config.emitter.emit("disconnect");
      connected = false;
    },

    async getProvider() {
      console.log("Getting provider...");
      console.log("SDK wallet:", sdk.wallet);
      return sdk.wallet.ethProvider;
    },
  }));
}
