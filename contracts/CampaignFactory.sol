// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Campaign.sol";

contract CampaignFactory {
    address[] public deployedCampaigns;

    function createCampaign(uint goal, string memory title) external {
        Campaign newCampaign = new Campaign(msg.sender, goal, title);
        deployedCampaigns.push(address(newCampaign));
    }

    function getCampaigns() external view returns (address[] memory) {
        return deployedCampaigns;
    }
}
