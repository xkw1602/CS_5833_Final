import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat";

describe("CampaignFactory", function () {
  async function deployFactoryFixture() {
    const [owner, otherUser] = await hre.ethers.getSigners();

    const Factory = await hre.ethers.getContractFactory("CampaignFactory");
    const factory = await Factory.deploy();

    return { factory, owner, otherUser };
  }

  describe("Deployment", function () {
    it("should deploy successfully", async function () {
      const { factory } = await loadFixture(deployFactoryFixture);
      expect(factory.target).to.properAddress;
    });
  });

  describe("Creating Campaigns", function () {
    it("should allow users to create campaigns", async function () {
      const { factory, owner } = await loadFixture(deployFactoryFixture);

      const descriptions = ["Milestone 1", "Milestone 2"];
      const percentages = [50, 50];

      await factory.createCampaign(ethers.parseEther("5"), "Test Campaign", descriptions, percentages);

      const deployedCampaigns = await factory.getCampaigns();
      expect(deployedCampaigns.length).to.equal(1);
      expect(deployedCampaigns[0]).to.properAddress;
    });

    it("should deploy a campaign with the correct creator and goal", async function () {
      const { factory, otherUser } = await loadFixture(deployFactoryFixture);

      const descriptions = ["Milestone 1", "Milestone 2"];
      const percentages = [50, 50];

      await factory.connect(otherUser).createCampaign(ethers.parseEther("10"), "Community DAO", descriptions, percentages);

      const campaignAddress = (await factory.getCampaigns())[0];
      const Campaign = await ethers.getContractFactory("Campaign");
      const campaign = await Campaign.attach(campaignAddress);

      expect(await campaign.creator()).to.equal(otherUser.address);
      expect(await campaign.fundingGoal()).to.equal(10);
      expect(await campaign.title()).to.equal("Community DAO");
    });
  });
});
