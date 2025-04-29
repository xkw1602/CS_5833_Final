// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Campaign {
    struct Milestone {
        string description;
        uint amount;
        bool approved;
        uint approvalCount;
        mapping(address => bool) approvals;
    }

    address public creator;
    string public title;
    uint public fundingGoal;
    uint public totalRaised;
    uint public milestoneCount;

    mapping(uint => Milestone) public milestones;
    address[] public contributors;
    mapping(address => uint) public contributions;

    modifier onlyCreator() {
        require(msg.sender == creator, "Only creator can call");
        _;
    }

    constructor(address _creator, uint _goal, string memory _title) {
        creator = _creator;
        fundingGoal = _goal;
        title = _title;
    }

    function contribute() external payable {
        require(msg.value > 0, "Must send ETH > 0");
        if (contributions[msg.sender] == 0) {
            contributors.push(msg.sender);
        }
        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;
    }

    function createMilestone(string calldata desc, uint amount) external onlyCreator {
        require(amount <= totalRaised, "Insufficient funds");
        Milestone storage m = milestones[milestoneCount++];
        m.description = desc;
        m.amount = amount;
    }

    function voteOnMilestone(uint id) external {
        Milestone storage m = milestones[id];
        require(contributions[msg.sender] > 0, "Not a contributor");
        require(!m.approvals[msg.sender], "Already voted");

        m.approvals[msg.sender] = true;
        m.approvalCount++;

        if (m.approvalCount > contributors.length / 2) {
            m.approved = true;
            payable(creator).transfer(m.amount);
        }
    }

    function refund() external {
        require(contributions[msg.sender] > 0, "Nothing to refund");
        require(totalRaised < fundingGoal, "Goal met");

        uint amount = contributions[msg.sender];
        contributions[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    function getSummary() external view returns (
        address, string memory, uint, uint, uint, uint
    ) {
        return (
            creator,
            title,
            fundingGoal,
            totalRaised,
            milestoneCount,
            contributors.length
        );
    }
}
