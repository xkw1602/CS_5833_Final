import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CampaignModule = buildModule("CampaignModule", (m) => {
  const creator = m.getParameter("creator", "0x0000000000000000000000000000000000000000"); // Replace default if needed
  const goal = m.getParameter("goal", 5n * 10n ** 18n); // 5 ETH
  const title = m.getParameter("title", "Sample Campaign");

  const campaign = m.contract("Campaign", [creator, goal, title]);

  return { campaign };
});

export default CampaignModule;
