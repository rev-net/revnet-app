import { isAddress } from "viem";
import { z } from "zod";

export const addressSchema = z.coerce
  .string()
  .min(1, "Address is required")
  .refine((v) => isAddress(v, { strict: false }), "Invalid address");

export const chainIdSchema = z.union([z.string(), z.number()]);

export const splitSchema = z.object({
  percentage: z.coerce.string().min(1, "Percentage is required"),
  defaultBeneficiary: addressSchema,
  beneficiary: z
    .array(z.object({ chainId: chainIdSchema, address: addressSchema }))
    .optional(),
});

export const stageSchema = z.object({
  initialOperator: z.string().optional(),
  initialIssuance: z.coerce.string().min(1, "Initial issuance is required"),
  priceCeilingIncreasePercentage: z
    .string()
    .min(1, "Price ceiling increase percentage is required"),
  priceCeilingIncreaseFrequency: z
    .string()
    .min(1, "Price ceiling increase frequency is required"),
  priceFloorTaxIntensity: z.coerce
    .string()
    .min(1, "Price floor tax intensity is required"),

  autoIssuance: z.array(
    z.object({
      amount: z.coerce.string().min(1, "Amount is required"),
      beneficiary: addressSchema,
    }),
  ),

  splits: z.array(splitSchema),
  stageStart: z.coerce.string().min(1, "Stage start is required"),
});
