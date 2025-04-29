import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CampaignFactoryModule = buildModule("CampaignFactoryModule", (m) => {
  const factory = m.contract("CampaignFactory"); // No constructor args

  return { factory };
});

export default CampaignFactoryModule;
