const hre = require("hardhat")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  // Setup accounts & variables
  const [deployer] = await ethers.getSigners() // getting the signer
  const NAME = "TokenMaster"  // creating nft name 
  const SYMBOL = "TM"  // creating nft symbol

  // Deploy contract
  const TokenMaster = await ethers.getContractFactory("TokenMaster")  // fetching the contract file which is undeployed
  const tokenMaster = await TokenMaster.deploy(NAME, SYMBOL) // deploying contract and passing the arguments
  await tokenMaster.deployed() // wait untill deployment

  console.log(`Deployed TokenMaster Contract at: ${tokenMaster.address}`)

  // List 6 events
  const occasions = [
    {
      name: "UFC Miami",
      cost: tokens(0.25),  // token function will convert the numerical value into n value in smallest form of ether in wei  => so here 3 ether in wei will be represented
      tickets: 0,
      date: "August 31",
      time: "6:00PM EST",
      location: "Miami-Dade Arena - Miami, FL"
    },
    {
      name: "ETH Tokyo",
      cost: tokens(0.15),
      tickets: 125,
      date: "Jun 2",
      time: "1:00PM JST",
      location: "Tokyo, Japan"
    },
    {
      name: "ETH Privacy Hackathon",
      cost: tokens(0.35),
      tickets: 200,
      date: "Jun 9",
      time: "10:00AM TRT",
      location: "Turkey, Istanbul"
    },
    {
      name: "Dallas Mavericks vs. San Antonio Spurs",
      cost: tokens(0.50),
      tickets: 0,
      date: "Jun 11",
      time: "2:30PM CST",
      location: "American Airlines Center - Dallas, TX"
    },
    {
      name: "ETH Global Toronto",
      cost: tokens(0.40),
      tickets: 125,
      date: "Jun 23",
      time: "11:00AM EST",
      location: "Toronto, Canada"
    }
  ]

  for (var i = 0; i < 5; i++) {
    const transaction = await tokenMaster.connect(deployer).list(  // passing the 
      occasions[i].name,  // adding these items using occasion array 
      occasions[i].cost,
      occasions[i].tickets,
      occasions[i].date,
      occasions[i].time,
      occasions[i].location,
    )
 
    await transaction.wait()  // wait for that transaction untill deployer lists these function 

    console.log(`Listed Event ${i + 1}: ${occasions[i].name}`)
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});