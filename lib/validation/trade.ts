import { z } from "zod";

export const buyOrderSchema = z.object({
  membershipId: z.string().min(1, { message: "Classroom selection is required." }),
  fundId: z.string().min(1, { message: "Mutual fund selection is required." }),
  amountInRupees: z
    .number()
    .positive({ message: "Investment amount must be greater than ₹0." })
    .max(10000000, { message: "Maximum trade limit exceeded." }),
});

export const sellOrderSchema = z.object({
  membershipId: z.string().min(1, { message: "Classroom selection is required." }),
  fundId: z.string().min(1, { message: "Mutual fund selection is required." }),
  unitsToSell: z
    .number()
    .positive({ message: "Units to sell must be greater than 0." }),
});

export type BuyOrderInput = z.infer<typeof buyOrderSchema>;
export type SellOrderInput = z.infer<typeof sellOrderSchema>;
