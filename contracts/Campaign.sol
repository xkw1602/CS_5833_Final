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
    uint public fundingGoal; // Total amount of ETH needed to be raised, arbitrary
    uint public totalPotentialEarnings; // Total amount of ETH donated -- not awarded
    uint public milestoneCount;
    uint public percentageAwarded; // Percentage of the total funds that has been awarded the creator based on milestone completion
    uint public amountSent; // Amount of ETH sent to the creator

    mapping(uint => Milestone) public milestones;
    address[] public contributors;
    mapping(address => uint) public contributions; // Amount of ETH contributed by each address -- mostly for refunds

    // Modifier to restrict access of certain functions to the creator of the campaign
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

    // Contributors can contribute to the campagin as a whole, milestone completion will award from the total pool of funds
    function contribute() external payable {
        require(msg.value > 0, "Must send ETH > 0");
        if (contributions[msg.sender] == 0) {
            contributors.push(msg.sender);
        }
        contributions[msg.sender] += msg.value;
        totalPotentialEarnings += msg.value;
        // If the creator has already been awarded a percentage of the funds, new contributions will automatically send the same percentage
        if(percentageAwarded > 0){
            uint amount = msg.value * percentageAwarded / 100;
            payable(creator).transfer(amount);
            amountSent += amount;
        }
    }


    // Once a milestone is activated, contributors can vote on it
    // If a milestone is approved, the funds are released to the creator
    function voteOnMilestone(uint id) external {
        Milestone storage m = milestones[id];
        require(m.votingActive, "Milestone not votable yet");
        require(msg.sender != creator, "Creator cannot vote");
        require(contributions[msg.sender] > 0, "Not a contributor");
        require(!m.approvals[msg.sender], "Already voted");
        require(!m.approved, "Milestone already approved");

        m.approvals[msg.sender] = true;
        m.approvalCount++;

        // 50%+ approval needed to approve -- can easily be changed to a different percentage
        if (m.approvalCount > contributors.length / 2) {
            uint amount = totalPotentialEarnings * m.percentage / 100;
            m.approved = true;
            payable(creator).transfer(amount);
            amountSent += amount;
            percentageAwarded += m.percentage;
            m.votingActive = false; // Deactivate voting after approval
        }
    }

    // Creator activates a milestone when they are ready to have contributors vote on it
    function activateMilestoneVoting(uint id) external onlyCreator {
        Milestone storage m = milestones[id];
        require(!m.votingActive, "Milestone already active");
        require(!m.approved, "Milestone already approved");

        m.votingActive = true;
    }

    // Contributors can refund their pending funds at any time before campaign completion
    function refund() external {
        require(contributions[msg.sender] > 0, "Nothing to refund");

        uint amount = contributions[msg.sender] - (contributions[msg.sender]*percentageAwarded / 100);
        contributions[msg.sender] = 0;
        totalPotentialEarnings -= amount;

        // Remove contributor from the array
        for (uint i = 0; i < contributors.length; i++) {
            if (contributors[i] == msg.sender) {
                contributors[i] = contributors[contributors.length - 1]; // Move last element into place
                contributors.pop(); // Remove last element
                break;
            }
        }
        // Transfer the amount back to the contributor
        payable(msg.sender).transfer(amount);
    }

    function getSummary() external view returns (
        address, string memory, uint, uint, uint, uint, uint, uint, uint
    ) {
        return (
            creator,
            title,
            fundingGoal,
            totalPotentialEarnings,
            milestoneCount,
            contributors.length,
            percentageAwarded,
            address(this).balance,
            amountSent
        );
    }
}
