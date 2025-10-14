import { z } from "zod";
import { addressSchema, chainIdSchema, stageSchema } from "./stageSchema";

export const createSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50, "Name is too long"),
  description: z.string().trim().min(1, "Description is required"),
  tokenSymbol: z
    .string()
    .min(2, "Token symbol must be at least 2 characters")
    .max(10, "Token symbol is too long"),
  logoUri: z.string().optional(),
  twitter: z.string().trim().optional(),
  telegram: z.string().trim().optional(),
  discord: z.string().trim().optional(),
  infoUri: z.string().trim().optional(),
  reserveAsset: z.enum(["ETH", "USDC"]),

  stages: z.array(stageSchema).min(1, "At least one stage is required"),

  chainIds: z.array(chainIdSchema).min(1, "At least one chain must be selected"),

  operator: z.array(
    z.object({
      chainId: chainIdSchema,
      address: addressSchema,
    }),
  ),
});
