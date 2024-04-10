import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Components
import Navigation from "./components/Navigation";
import Sort from "./components/Sort";
import Card from "./components/Card";
import SeatChart from "./components/SeatChart";

// ABIs
import TokenMaster from "./abis/TokenMaster.json";

// Config
import config from "./config.json";

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null); // setting account address by null in initial stage

  const [tokenMaster, setTokenMaster] = useState(null);
  const [occasions, setOccasions] = useState([]);

  const [occasion, setOccasion] = useState({});
  const [toggle, setToggle] = useState(false);

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum); // specifying metamask to provider
    setProvider(provider);
    const network = await provider.getNetwork(); // getting the network id from provider
    const address = config[network.chainId].TokenMaster.address; // getting contract address from config file
    const tokenMaster = new ethers.Contract(address, TokenMaster, provider); // connecting with contract
    setTokenMaster(tokenMaster);

    const totalOccasions = await tokenMaster.totalOccasions();
    const occasions = [];

    for (var i = 1; i <= totalOccasions; i++) {
      const occasion = await tokenMaster.getOccasion(i);
      occasions.push(occasion); // pushing the occasion to in a array
    }

    setOccasions(occasions);
    

    // fetch accounts
    // const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})  // requesting the accounts from hardhat method and it will add accounts in array
    // const account = ethers.utils.getAddress(accounts[0])  // getting the 0th account add. from accounts array
    // setAccount(account) // setting the first account address in setter function

    // Refresh Accounts ==> it will work after changing the address and then refresh the page
    window.ethereum.on("accountsChanged", async () => {
      // When account will be change in metamask and this function will execute
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      }); // it will prompts the user to switch accounts and fetch current account address
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);
    });
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <div>
      <header>
        <Navigation account={account} setAccount={setAccount} />
        <h2 className="header__title">
          <strong>Event</strong>Tickets
        </h2>
      </header>
      
      <div className="cards">
        {occasions.map((occasion, index) => (
          <Card
            occasion={occasion}
            id={index + 1}
            tokenMaster={tokenMaster}
            provider={provider}
            account={account}
            toggle={toggle}
            setToggle={setToggle}
            setOccasion={setOccasion}
            key={index}
          />
        ))}
      </div>

      {toggle && (
          <SeatChart
            occasion={occasion}
            tokenMaster={tokenMaster}
            provider={provider}
            setToggle={setToggle}
          />
        )}
    
    </div>
  );
}
export default App;
