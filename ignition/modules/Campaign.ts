import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CampaignModule = buildModule("CampaignModule", (m) => {
  const creator = m.getParameter("creator", "0x0000000000000000000000000000000000000000"); // Replace in config
  const goal = m.getParameter("goal", 5n * 10n ** 18n); // 5 ETH
  const title = m.getParameter("title", "Sample Campaign");

  const descriptions = m.getParameter("descriptions", ["Milestone 1", "Milestone 2"]);
  const percentages = m.getParameter("percentages", [50, 50]);

  const campaign = m.contract("Campaign", [
    creator,
    goal,
    title,
    descriptions,
    percentages
  ]);

  return { campaign };
});

export default CampaignModule;
