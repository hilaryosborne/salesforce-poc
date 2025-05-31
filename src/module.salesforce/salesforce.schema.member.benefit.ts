import { z } from "zod";

const MemberBenefitSchema = z.object({
  benefitId: z.string(),
  benefitName: z.string(),
  benefitTypeId: z.string(),
  benefitTypeName: z.string(),
  createdRecordId: z.string().nullable(),
  createdRecordName: z.string().nullable(),
  description: z.string().nullable(),
  endDate: z.string().nullable(),
  isActive: z.boolean(),
  memberBenefitStatus: z.string().nullable(),
  startDate: z.string().nullable(),
});

export type MemberBenefit = z.infer<typeof MemberBenefitSchema>;

export default MemberBenefitSchema;
