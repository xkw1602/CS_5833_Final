import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import CampaignABI from "../abi/Campaign.json";

function CampaignDetail() {
  const { addr } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<any>(null);
  const [summary, setSummary] = useState<any[]>([]);
  const [contribution, setContribution] = useState("");
  const [milestones, setMilestones] = useState<any[]>([]);
  const [account, setAccount] = useState("");

  useEffect(() => {
    async function load() {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);

      const contract = new ethers.Contract(addr!, CampaignABI.abi, signer);
      setCampaign(contract);

      const summary = await contract.getSummary();
      setSummary(summary);

      const count = Number(summary[4]);
      const milestoneData = [];

      for (let i = 0; i < count; i++) {
        const m = await contract.milestones(i);
        milestoneData.push({
          id: i,
          description: m.description,
          percentage: Number(m.percentage),
          approved: m.approved,
          votingActive: m.votingActive,
        });
      }

      setMilestones(milestoneData);
    }

    load();
  }, [addr]);

  async function handleContribute() {
    if (!campaign || !contribution) return;
    const tx = await campaign.contribute({ value: ethers.parseEther(contribution) });
    await tx.wait();
    alert("Contribution sent!");
    setContribution("");
  }

  async function voteOnMilestone(id: number) {
    try {
      const tx = await campaign.voteOnMilestone(id);
      await tx.wait();
      alert(`Voted on milestone ${id}`);
    } catch (err: any) {
      alert(`Vote failed: ${err.reason || err.message}`);
    }
  }

  async function handleRefund() {
    try {
      const tx = await campaign.refund();
      await tx.wait();
      alert("Refund issued!");
    } catch (err: any) {
      alert(`Refund failed: ${err.reason || err.message}`);
    }
  }

  async function activateMilestone(id: number) {
    try {
      const tx = await campaign.activateMilestoneVoting(id);
      await tx.wait();
      alert(`Milestone ${id} voting activated`);
    } catch (err: any) {
      alert(`Activation failed: ${err.reason || err.message}`);
    }
  }
  

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => navigate("/")}>⬅ Back to Campaigns</button>
      <h2>Campaign at {addr}</h2>
      <p><strong>Title:</strong> {summary[1]}</p>
      <p><strong>Creator:</strong> {summary[0]}</p>
      <p><strong>Funding Goal:</strong> {ethers.formatEther(summary[2] || 0)} ETH</p>
      <p><strong>Total Pending ETH:</strong> {ethers.formatEther(summary[7] || 0)} ETH</p>
      <p><strong>Total ETH Sent to Creator:</strong> {ethers.formatEther(summary[8] || 0)} ETH</p>
      <p><strong>Milestones:</strong> {summary[4]}</p>
      <p><strong>Contributors:</strong> {summary[5]}</p>

      <hr />
      <h3>Contribute</h3>
      <input
        type="text"
        placeholder="ETH amount"
        value={contribution}
        onChange={(e) => setContribution(e.target.value)}
      />
      <button onClick={handleContribute}>Send</button>

      <hr />
      <h3>Milestones</h3>
      {milestones.map((m) => (
        <div key={m.id} style={{ marginBottom: 15, padding: 10, border: "1px solid #ccc" , backgroundColor: "#f9f9f9"}}>
          <p><strong>Description:</strong> {m.description}</p>
          <p><strong>Percentage:</strong> {m.percentage}%</p>
          <p><strong>Approved:</strong> {m.approved ? "✅ Yes" : "❌ No"}</p>
          <p><strong>Voting Active:</strong> {m.votingActive ? "🟢 Active" : "⚪ Inactive"}</p>

          {/* If voting is active and user is a contributor (not creator), show vote button */}
          {m.votingActive && account.toLowerCase() !== summary[0]?.toLowerCase() && (
            <button onClick={() => voteOnMilestone(m.id)}>Vote on this milestone</button>
          )}

          {/* If user is the creator and voting isn't active or approved, allow activation */}
          {!m.approved && !m.votingActive && account.toLowerCase() === summary[0]?.toLowerCase() && (
            <button onClick={() => activateMilestone(m.id)}>Activate Voting</button>
          )}
        </div>
      ))}


      <hr />
      <h3>Refund</h3>
      <button onClick={handleRefund}>Request Refund</button>
    </div>
  );
}

export default CampaignDetail;
