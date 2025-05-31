import { z } from "zod";

const AdditionalLoyaltyProgramMemberFieldsSchema = z.object({
  POSIntegration__posOrderCount__c: z.number().nullable(),
  POSIntegration__posName__c: z.string().nullable(),
  POSIntegration__posMemberId__c: z.string().nullable(),
  POSIntegration__posMemberPhone__c: z.string().nullable(),
});

const AssociatedContactSchema = z
  .object({
    contactId: z.string(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
  })
  .nullable();

const AdditionalLoyaltyMemberCurrencyFieldsSchema = z.object({});

const MemberCurrencySchema = z.object({
  additionalLoyaltyMemberCurrencyFields: AdditionalLoyaltyMemberCurrencyFieldsSchema,
  escrowPointsBalance: z.number(),
  expirablePoints: z.number(),
  lastAccrualProcessedDate: z.string().nullable(),
  lastEscrowProcessedDate: z.string().nullable(),
  lastExpirationProcessRunDate: z.string().nullable(),
  lastPointsAggregationDate: z.string().nullable(),
  lastPointsResetDate: z.string().nullable(),
  loyaltyMemberCurrencyName: z.string(),
  loyaltyProgramCurrencyId: z.string(),
  loyaltyProgramCurrencyName: z.string().nullable(),
  memberCurrencyId: z.string(),
  nextQualifyingPointsResetDate: z.string(),
  pointsBalance: z.number(),
  qualifyingPointsBalanceBeforeReset: z.number(),
  totalEscrowPointsAccrued: z.number(),
  totalEscrowRolloverPoints: z.number(),
  totalPointsAccrued: z.number(),
  totalPointsExpired: z.number(),
  totalPointsRedeemed: z.number(),
});

const AdditionalLoyaltyMemberTierFieldsSchema = z.object({});

const MemberTierSchema = z.object({
  additionalLoyaltyMemberTierFields: AdditionalLoyaltyMemberTierFieldsSchema,
  areTierBenefitsAssigned: z.boolean(),
  loyaltyMemberTierId: z.string(),
  loyaltyMemberTierName: z.string(),
  tierChangeReason: z.string().nullable(),
  tierChangeReasonType: z.string().nullable(),
  tierEffectiveDate: z.string(),
  tierExpirationDate: z.string().nullable(),
  tierGroupId: z.string(),
  tierGroupName: z.string(),
  tierId: z.string(),
  tierSequenceNumber: z.number(),
});

const LoyaltyProgramMemberSchema = z.object({
  additionalLoyaltyProgramMemberFields: AdditionalLoyaltyProgramMemberFieldsSchema,
  associatedAccount: z.string().nullable(),
  associatedContact: AssociatedContactSchema,
  canReceivePartnerPromotions: z.boolean(),
  canReceivePromotions: z.boolean(),
  enrollmentChannel: z.string(),
  enrollmentDate: z.string(),
  groupCreatedByMember: z.string().nullable(),
  groupName: z.string().nullable(),
  lastActivityDate: z.string().nullable(),
  loyaltyProgramMemberId: z.string(),
  loyaltyProgramName: z.string(),
  memberCurrencies: z.array(MemberCurrencySchema),
  memberStatus: z.string(),
  memberTiers: z.array(MemberTierSchema),
  memberType: z.string(),
  membershipEndDate: z.string().nullable(),
  membershipLastRenewalDate: z.string().nullable(),
  membershipNumber: z.string(),
  referredBy: z.string().nullable(),
  relatedCorporateMembershipNumber: z.string().nullable(),
  transactionJournalStatementFrequency: z.string(),
  transactionJournalStatementLastGeneratedDate: z.string().nullable(),
  transactionJournalStatementMethod: z.string(),
});

export type LoyaltyProgramMember = z.infer<typeof LoyaltyProgramMemberSchema>;
export type AssociatedContact = z.infer<typeof AssociatedContactSchema>;
export type MemberCurrency = z.infer<typeof MemberCurrencySchema>;
export type MemberTier = z.infer<typeof MemberTierSchema>;
export type AdditionalLoyaltyProgramMemberFields = z.infer<typeof AdditionalLoyaltyProgramMemberFieldsSchema>;

export default LoyaltyProgramMemberSchema;
