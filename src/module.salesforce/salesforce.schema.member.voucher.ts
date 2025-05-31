import { z } from "zod";

const MemberVoucherSchema = z.object({
  effectiveDate: z.string().date(), // YYYY-MM-DD format
  expirationDate: z.string().date(), // YYYY-MM-DD format
  hasTimeBasedVoucherPeriod: z.boolean(),
  isVoucherDefinitionActive: z.boolean(),
  isVoucherPartiallyRedeemable: z.boolean(),
  partnerAccountName: z.string(),
  productId: z.string(),
  productName: z.string(),
  status: z.string(), // Could be z.enum(['Issued', 'Redeemed', 'Expired', ...]) if you know all possible values
  type: z.string(), // Could be z.enum(['ProductOrService', ...]) if you know all possible values
  voucherCode: z.string(),
  voucherDefinition: z.string(),
  voucherId: z.string(),
  voucherNumber: z.string(),
});

export type MemberVoucher = z.infer<typeof MemberVoucherSchema>;

export default MemberVoucherSchema;
