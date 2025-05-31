import salesforce from "./salesforce.client";

const SalesForceHttpHandler = async () => {
  const sf = salesforce();
  await sf.authenticate();
  //   await sf.getMemberByNumber("129382932");
  // await sf.getMemberBenefits("0lMQE0000002yCz2AI");
  // await sf.getMemberVouchersByMemberNumber("129382932");
  // const blah = await sf.assignTierBenefitToMember();
  // const tier = await sf.getAvailableMemberBenefitsByMemberID("0lMQE0000002yCz2AI");
  const stuff = await sf.getMemberBenefits("0lMQE0000002yCz2AI");
  console.log("stuff", stuff);
  // await sf.upgradeMemberTier("129382932", "270", "XTRDSDDF");
  // console.log("tier", tier);
  // return tier;
  return { things: true };
};

export default SalesForceHttpHandler;
