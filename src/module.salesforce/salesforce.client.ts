import fetch from "node-fetch";
import { z } from "zod";
import LoyaltyProgramMemberSchema, { LoyaltyProgramMember } from "./salesforce.schema.member";
import MemberBenefitSchema, { MemberBenefit } from "./salesforce.schema.member.benefit";
import MemberVoucherSchema, { MemberVoucher } from "./salesforce.schema.member.voucher";

const SalesForceAccessTokenSchema = z.object({
  access_token: z.string(),
  instance_url: z.string(),
  token_type: z.string(),
  issued_at: z.string(),
  signature: z.string(),
  id: z.string().optional(),
});

const SalesForceState = z.object({
  token: SalesForceAccessTokenSchema.optional(),
});

type SalesForceStateType = z.infer<typeof SalesForceState>;

function encodeSoqlQuery(query: string): string {
  return query.replace(/\s+/g, " ").trim().replace(/ /g, "+");
}

const salesforce = () => {
  const state: SalesForceStateType = {
    token: undefined,
  };
  const authenticate = async () => {
    try {
      const url = `https://${process.env.SALESFORCE_INSTANCE}.my.salesforce.com/services/oauth2/token`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: process.env.SALESFORCE_KEY || "",
          client_secret: process.env.SALESFORCE_SECRET || "",
        }).toString(),
      });
      if (!response.ok) throw new Error(`Salesforce authentication failed: ${response.statusText}`);
      state.token = SalesForceAccessTokenSchema.parse(await response.json());
    } catch (error) {
      console.error("Error authenticating with Salesforce:", error);
    }
  };

  const query = async (query: string): Promise<any> => {
    if (!state.token) throw new Error("Salesforce client is not authenticated");
    const url = `https://${process.env.SALESFORCE_INSTANCE}.my.salesforce.com/services/data/${process.env.SALESFORCE_VERSION}`;
    const response = await fetch(url + "/query/?q=" + encodeSoqlQuery(query), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.token.access_token}`,
      },
    });
    if (!response.ok) throw new Error(`Salesforce query failed: ${response.statusText}`);
    const data = (await response.json()) as { totalSize: number; done: boolean; records: Array<any> };
    return data.records || [];
  };

  const executeProcess = async (flow: string, params: any) => {
    if (!state.token) throw new Error("Salesforce client is not authenticated");
    const program = process.env.SALESFORCE_PROGRAM || "default";
    const url = `https://${process.env.SALESFORCE_INSTANCE}.my.salesforce.com/services/data/${process.env.SALESFORCE_VERSION}`;
    const response = await fetch(url + "/connect/loyalty/programs/" + program + "/program-processes/" + flow, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${state.token.access_token}`,
      },
      body: JSON.stringify({ processParameters: [params] }),
    });
    if (!response.ok) throw new Error(`Salesforce process execution failed: ${response.statusText}`);
    return await response.json();
  };

  const getSObject = async (path: string): Promise<any> => {
    if (!state.token) throw new Error("Salesforce client is not authenticated");
    const url = `https://${process.env.SALESFORCE_INSTANCE}.my.salesforce.com`;
    const response = await fetch(url + path, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.token.access_token}`,
      },
    });
    return await response.json();
  };

  const getMemberByNumber = async (memberNumber: string): Promise<LoyaltyProgramMember> => {
    try {
      if (!state.token) throw new Error("Salesforce client is not authenticated");
      const program = process.env.SALESFORCE_PROGRAM || "default";
      const url = `https://${process.env.SALESFORCE_INSTANCE}.my.salesforce.com/services/data/${process.env.SALESFORCE_VERSION}`;
      const response = await fetch(url + "/loyalty-programs/" + program + "/members?membershipNumber=" + memberNumber, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token.access_token}`,
        },
      });
      if (!response.ok) throw new Error(`Failed to fetch member: ${response.statusText}`);
      return LoyaltyProgramMemberSchema.parse(await response.json());
    } catch (error) {
      console.error("Error fetching member from Salesforce:", error);
      throw error;
    }
  };

  const getMemberBenefitsByMemberID = async (memberId: string): Promise<Array<MemberBenefit>> => {
    try {
      if (!state.token) throw new Error("Salesforce client is not authenticated");
      const url = `https://${process.env.SALESFORCE_INSTANCE}.my.salesforce.com/services/data/${process.env.SALESFORCE_VERSION}`;
      const response = await fetch(url + "/connect/loyalty/member/" + memberId + "/memberbenefits", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token.access_token}`,
        },
      });
      if (!response.ok) throw new Error(`Failed to fetch member benefits: ${response.statusText}`);
      const data = (await response.json()) as { memberBenefits: Array<MemberBenefit> };
      return data.memberBenefits.map((benefit: any) => MemberBenefitSchema.parse(benefit));
    } catch (error) {
      console.error("Error fetching member from Salesforce:", error);
      throw error;
    }
  };

  const getMemberBenefits = async (memberId: string): Promise<any> => {
    if (!state.token) throw new Error("Salesforce client is not authenticated");
    const soql = `
      SELECT Name
      FROM MemberBenefit 
      WHERE MemberId = '${memberId}'`;
    const data = await query(soql);
    if (!data || data.length === 0) return [];
    const benefits = await data.reduce(async (accPromise: Promise<any>, benefit: any) => {
      const acc = await accPromise;
      const benefitData = await getSObject(benefit.attributes.url);
      return [...acc, { ...benefitData }];
    }, Promise.resolve([]));
    return benefits;
  };

  const getTierBenefitById = async (id: string): Promise<any> => {
    if (!state.token) throw new Error("Salesforce client is not authenticated");
    const soql = `
      SELECT Name
      FROM Benefit 
      WHERE Id = '${id}'
      ORDER BY Name`;
    const results = await query(soql);
    const result = results[0];
    return await getSObject(result.attributes.url);
  };

  const getTierBenefits = async (tierId: string): Promise<any> => {
    if (!state.token) throw new Error("Salesforce client is not authenticated");
    const soql = `
      SELECT BenefitId, Name
      FROM LoyaltyTierBenefit 
      WHERE LoyaltyTierId = '${tierId}'
      ORDER BY Name`;
    const data = await query(soql);
    if (!data || data.length === 0) return [];
    const benefits = await data.reduce(async (accPromise: Promise<any>, benefit: any) => {
      const acc = await accPromise;
      const extra = await getTierBenefitById(benefit.BenefitId);
      const benefitData = await getSObject(benefit.attributes.url);
      return [...acc, { ...benefitData, extra }];
    }, Promise.resolve([]));
    return benefits;
  };

  const assignTierBenefitToMember = async (): Promise<any> => {
    if (!state.token) throw new Error("Salesforce client is not authenticated");
    const response = await executeProcess("SelectBenefit", {
      MemberId: "0lMQE0000002yCz2AI",
      MemberBenefitID: "0jiQE0000002DNlYAM",
      MemberBenefitName: "Lounge Access",
      SourceType: "Manual",
    });
    console.log("Assigning benefit to member:", response);
  };

  const getMemberTierByMemberID = async (memberId: string): Promise<any> => {
    if (!state.token) throw new Error("Salesforce client is not authenticated");
    const soql = `
      SELECT Id, LoyaltyTierId
      FROM LoyaltyMemberTier
      WHERE LoyaltyMemberId='${memberId}'
      LIMIT 1`;
    const results = await query(soql);
    const result = results[0];
    const data = await getSObject(result.attributes.url);
    const benefits = await getTierBenefits(result.LoyaltyTierId);
    return { data, benefits };
  };

  const getAvailableMemberBenefitsByMemberID = async (memberId: string): Promise<any> => {
    const tier = await getMemberTierByMemberID(memberId);
    const assigned = await getMemberBenefitsByMemberID(memberId);
    const benefits = tier.benefits.map((benefit: any) => {
      const current = assigned.find((b) => b.benefitId === benefit.BenefitId);
      return { ...benefit, Assignment: current ? current : null, MemberStatus: current ? "assigned" : "unassigned" };
    });
    return { data: tier.data, benefits };
  };

  const getMemberVouchersByMemberNumber = async (memberNumber: string): Promise<any> => {
    try {
      if (!state.token) throw new Error("Salesforce client is not authenticated");
      const program = process.env.SALESFORCE_PROGRAM || "default";
      const url = `https://${process.env.SALESFORCE_INSTANCE}.my.salesforce.com/services/data/${process.env.SALESFORCE_VERSION}`;
      const response = await fetch(url + "/loyalty/programs/" + program + "/members/" + memberNumber + "/vouchers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token.access_token}`,
        },
      });
      if (!response.ok) throw new Error(`Failed to fetch member vouchers: ${response.statusText}`);
      const data = (await response.json()) as { voucherCount: number; vouchers: Array<MemberVoucher> };
      return data.vouchers.map((benefit: any) => MemberVoucherSchema.parse(benefit));
    } catch (error) {
      console.error("Error fetching vouchers from Salesforce:", error);
      throw error;
    }
  };

  const upgradeMemberTier = async (memberNumber: string, amount: string, orderId: string): Promise<any> => {
    try {
      if (!state.token) throw new Error("Salesforce client is not authenticated");
      const program = process.env.SALESFORCE_PROGRAM || "default";
      const url = `https://${process.env.SALESFORCE_INSTANCE}.my.salesforce.com/services/data/${process.env.SALESFORCE_VERSION}`;
      const activityDate = new Date();
      const response = await fetch(url + "/connect/realtime/loyalty/programs/" + program, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token.access_token}`,
        },
        body: JSON.stringify({
          transactionJournals: [
            {
              // @TODO: name was my workaround for the trial API process engine
              Name: "upgrade",
              ActivityDate: activityDate.toISOString(),
              JournalTypeName: "Accrual",
              LoyaltyProgramName: program,
              MembershipNumber: "129382932",
              Status: "Pending",
              TransactionAmount: amount,
              // @TODO: these are not supported by the trial API
              // they will need to be added back into the request later
              // idempotencyKey__c: `${orderId}-${memberNumber}-membershipUpgrade`,
              // JournalSubTypeName: "Membership Upgrade",
              // ExternalTransactionNumber: orderId,
              // LMS_Originated_From__c: "REST",
            },
          ],
        }),
      });
      if (!response.ok) throw new Error(`Failed to fetch member vouchers: ${response.statusText}`);
      console.log(await response.json());
    } catch (error) {
      console.error("Error fetching vouchers from Salesforce:", error);
      throw error;
    }
  };

  return {
    authenticate,
    getMemberByNumber,
    getMemberBenefitsByMemberID,
    getMemberVouchersByMemberNumber,
    getAvailableMemberBenefitsByMemberID,
    upgradeMemberTier,
    getMemberBenefits,
    assignTierBenefitToMember,
  };
};

export default salesforce;
