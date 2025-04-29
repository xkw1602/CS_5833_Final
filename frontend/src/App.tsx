import { useEffect, useState } from "react";
import { ethers } from "ethers";
import CampaignFactoryABI from "./abi/CampaignFactory.json";
import CampaignABI from "./abi/Campaign.json";

const factoryAddress = "0xYourDeployedFactoryAddress"; // <-- update this

function App() {
  const [account, setAccount] = useState<string>("");
  const [campaigns, setCampaigns] = useState<string[]>([]);

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

  return (
    <div style={{ padding: 20 }}>
      <h1>Crowdfunding Platform</h1>
      <p>Connected Account: {account}</p>

      <h2>Active Campaigns</h2>
      <ul>
        {campaigns.map((address) => (
          <li key={address}>{address}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
