// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Campaign {
    // Milestsones wil be defined at construction with a percentage of how much to release upon approval
    struct Milestone {
        string description;
        uint percentage;
        bool approved;
        uint approvalCount;
        mapping(address => bool) approvals;
        bool votingActive;
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

    // All milestones are created at once along with the campaign
    constructor(address _creator, uint _goal, string memory _title, string[] memory _descriptions, uint[] memory _percentages) {
        require(_percentages.length == _descriptions.length, "Mismatched lengths");

        uint totalPercentage;
        creator = _creator;
        fundingGoal = _goal;
        title = _title;
        for (uint i = 0; i < _descriptions.length; i++) {
            Milestone storage m = milestones[i];
            m.description = _descriptions[i];
            m.percentage = _percentages[i];
            m.approved = false;
            m.approvalCount = 0;
            m.votingActive = false;
            totalPercentage += m.percentage;
            milestoneCount++;
        }

        // Check that the total percentage of all milestones is 100
        require(totalPercentage == 100, "Total percentage must be 100");
    }

    // Contributors can contribute to the campagin as a whole
    function contribute() external payable {
        require(msg.value > 0, "Must send ETH > 0");
        if (contributions[msg.sender] == 0) {
            contributors.push(msg.sender);
        }
        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;
    }


    // Once a milestone is activated, contributors can vote on it
    // If a milestone is approved, the funds are released to the creator
    function voteOnMilestone(uint id) external {
        Milestone storage m = milestones[id];
        require(m.votingActive, "Milestone not votable yet");
        require(contributions[msg.sender] > 0, "Not a contributor");
        require(!m.approvals[msg.sender], "Already voted");
        require(msg.sender != creator, "Creator cannot vote");
        require(!m.approved, "Milestone already approved");

        m.approvals[msg.sender] = true;
        m.approvalCount++;

        // 50%+ approval needed to approve
        if (m.approvalCount > contributors.length / 2) {
            m.approved = true;
            payable(creator).transfer(m.percentage * totalRaised / 100);
        }
    }

    // Creator activates a milestone when they are ready to have contributors vote on it
    function activateMilestone(uint id) external onlyCreator {
        Milestone storage m = milestones[id];
        require(!m.votingActive, "Milestone already active");

        m.votingActive = true;
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
