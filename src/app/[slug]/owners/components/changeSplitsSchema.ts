import { isAddress } from "viem";
import { z } from "zod";

const splitSchema = z.object({
  percentage: z.coerce
    .string()
    .min(1, "Percentage is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Percentage must be greater than 0"),
  beneficiary: z.coerce
    .string()
    .min(1, "Address is required")
    .refine((v) => isAddress(v, { strict: false }), "Invalid Ethereum address"),
});

const chainSplitSchema = z
  .object({
    chainId: z.number(),
    selected: z.boolean(),
    splits: z.array(splitSchema),
  })
  .refine(
    (chain) => {
      // Only validate selected chains
      if (!chain.selected) return true;

      // Empty splits array is valid (no splits)
      if (chain.splits.length === 0) return true;

      // Check if splits sum to 100%
      const total = chain.splits.reduce((sum, split) => sum + Number(split.percentage || 0), 0);
      return Math.abs(total - 100) < 0.01;
    },
    {
      message: "Splits must sum to 100%",
      path: ["splits"],
    },
  );

export const changeSplitsSchema = z.object({
  chains: z.array(chainSplitSchema),
});
