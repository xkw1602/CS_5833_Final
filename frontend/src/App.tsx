import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import CampaignDetail from "./components/CampaignDetail";
import { ethers } from "ethers";
import CampaignFactoryABI from "./abi/CampaignFactory.json";
import CampaignABI from "./abi/Campaign.json";

const factoryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [account, setAccount] = useState<string>("");
  const [campaigns, setCampaigns] = useState<string[]>([]);
  const [title, setTitle] = useState<string>("");
  const [goal, setGoal] = useState<string>(""); // in ETH
  const [milestones, setMilestones] = useState<string>(""); // comma-separated
  const [percentages, setPercentages] = useState<string>(""); // comma-separated

  useEffect(() => {
    async function load() {
      if ((window as any).ethereum) {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        const factoryContract = new ethers.Contract(factoryAddress, CampaignFactoryABI.abi, signer);

        setAccount(await signer.getAddress());

        const deployedCampaigns = await factoryContract.getCampaigns();
        setCampaigns(deployedCampaigns);
      } else {
        alert("Please install MetaMask!");
      }
    }

    load();
  }, []);

  async function createCampaign() {
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const factory = new ethers.Contract(factoryAddress, CampaignFactoryABI.abi, signer);

    const parsedMilestones = milestones.split(",").map((m) => m.trim());
    const parsedPercentages = percentages.split(",").map((p) => parseInt(p.trim()));

    const goalWei = ethers.parseEther(goal);

    try {
      const tx = await factory.createCampaign(goalWei, title, parsedMilestones, parsedPercentages);
      await tx.wait();

      // Reload campaigns list
      const deployed = await factory.getCampaigns();
      setCampaigns(deployed);
      setTitle("");
      setGoal("");
      setMilestones("");
      setPercentages("");
    } catch (err) {
      console.error("Error creating campaign:", err);
      alert("Campaign creation failed.");
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
      <h1>Crowdfunding Platform</h1>
      <p><strong>Connected Account:</strong> {account}</p>

      <h2>Create Campaign</h2>
      <input
        type="text"
        placeholder="Campaign Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <input
        type="text"
        placeholder="Funding Goal (ETH)"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <input
        type="text"
        placeholder="Milestones (comma-separated)"
        value={milestones}
        onChange={(e) => setMilestones(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <input
        type="text"
        placeholder="Percentages (comma-separated)"
        value={percentages}
        onChange={(e) => setPercentages(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <button onClick={createCampaign} style={{ padding: "10px 20px", marginTop: 10 }}>
        Create Campaign
      </button>

      <h2 style={{ marginTop: 40 }}>Active Campaigns</h2>
      <ul>
        {campaigns.map((address) => (
          <li key={address}>
            <Link to={`/campaign/${address}`} style={{ textDecoration: "none", color: "blue" }}>
              <code>{address}</code>
            </Link>
          </li>
        ))}
      </ul>

      <Routes>
        <Route path="/campaign/:addr" element={<CampaignDetail />} />
      </Routes>
    </div>
  );
}

export default App;
