import { ethers } from "hardhat";

async function main() {
  const deployedAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // <-- real address here

  const Campaign = await ethers.getContractFactory("Campaign");
  const campaign = Campaign.attach(deployedAddress);

  console.log("Connected to Campaign at:", campaign.target);

  // Example: Read basic info
  const summary = await campaign.getSummary();
  console.log("Campaign Summary:");
  console.log("Creator:", summary[0]);
  console.log("Title:", summary[1]);
  console.log("Goal:", ethers.formatEther(summary[2]), "ETH");
  console.log("Total Raised:", ethers.formatEther(summary[3]), "ETH");
  console.log("Milestones:", summary[4].toString());
  console.log("Contributors:", summary[5].toString());

  // Example: Send a contribution
  const [sender] = await ethers.getSigners();
  const tx = await campaign.connect(sender).contribute({ value: ethers.parseEther("0.1") });
  await tx.wait();
  console.log("Contribution sent!");

  // Verify updated balance
  const newContribution = await campaign.contributions(sender.address);
  console.log("New contribution for sender:", ethers.formatEther(newContribution), "ETH");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
