// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Campaign.sol";

contract CampaignFactory {
    address[] public deployedCampaigns;

    function createCampaign(uint goal, string memory title, string[] memory descriptions, uint[] memory percentages) external {
        Campaign newCampaign = new Campaign(msg.sender, goal, title, descriptions, percentages);
        deployedCampaigns.push(address(newCampaign));
    }

    function getCampaigns() external view returns (address[] memory) {
        return deployedCampaigns;
    }
}
