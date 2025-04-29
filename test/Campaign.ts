import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat"; // Import ethers directly from the ethers library

describe("Campaign", function () {
  async function deployCampaignFixture() {
    const [creator, contributor1, contributor2] = await hre.ethers.getSigners();

    const Campaign = await hre.ethers.getContractFactory("Campaign");
    const campaign = await Campaign.deploy(
      creator.address,
      5, // funding goal
      "Cool Campaign"
    );

    return { campaign, creator, contributor1, contributor2 };
  }

  describe("Deployment", function () {
    it("Should set the correct creator and goal", async function () {
      const { campaign, creator } = await loadFixture(deployCampaignFixture);
      expect(await campaign.creator()).to.equal(creator.address);
      expect(await campaign.fundingGoal()).to.equal(5);
    });
  });

  describe("Contributions", function () {
    it("should accept ETH contributions and track them", async function () {
      const { campaign, contributor1 } = await loadFixture(deployCampaignFixture);

      await campaign.connect(contributor1).contribute({ value: 1 });

      const recorded = await campaign.contributions(contributor1.address);
      expect(recorded).to.equal(1);
    });
  });

  describe("Milestones", function () {
    it("should allow only the creator to create a milestone", async function () {
      const { campaign, contributor1 } = await loadFixture(deployCampaignFixture);

      await expect(
        campaign.connect(contributor1).createMilestone("Do something", 100)
      ).to.be.revertedWith("Only creator can call");
    });

    it("should store milestone and allow voting", async function () {
      const { campaign, creator, contributor1, contributor2 } = await loadFixture(deployCampaignFixture);

      // Contributions
      await campaign.connect(contributor1).contribute({ value: 1 });
      await campaign.connect(contributor2).contribute({ value: 1 });

      // Creator adds milestone
      await campaign.connect(creator).createMilestone("Deliver feature A", 1);

      // Contributors vote
      await campaign.connect(contributor1).voteOnMilestone(0);
      await campaign.connect(contributor2).voteOnMilestone(0);

      // You can check approval count or approved flag here if exposed
      const milestone = await campaign.milestones(0);
      expect(milestone.description).to.equal("Deliver feature A");
      expect(milestone.approved).to.equal(true); // Assuming both contributors voted
    });
  });

//   describe("Refunds", function () {
//     it("should allow refunds if goal not met", async function () {
//       const { campaign, contributor1 } = await loadFixture(deployCampaignFixture);

//       await campaign.connect(contributor1).contribute({ value: 1 });

//       const initialBalance = await hre.ethers.provider.getBalance(contributor1.address);

//       const tx = await campaign.connect(contributor1).refund();
//       const receipt = await tx.wait();
//       const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

//       const finalBalance = await hre.ethers.provider.getBalance(contributor1.address);
//       expect(finalBalance.add(gasUsed)).to.be.closeTo(initialBalance, ethers.utils.parseEther("0.001"));
//     });
//   });
});
