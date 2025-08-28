import { z } from "zod";

export const createFormSchema = z.object({
  name: z.string().trim().min(1, "Provide a name").max(50, "Too long!"),
  description: z.string().trim().min(1, "Provide a description"),
  tokenSymbol: z.string().min(2, "Provide a symbol").max(10, "Too long!"),
  logoUri: z.string().optional(),
  reserveAsset: z.enum(["ETH", "USDC"]),
  // TODO: add more validation rules
});
