const { expect } = require("chai");
const { ethers } = require("hardhat");

const NAME = "TokenMaster";
const SYMBOL = "TM";

const OCCASION_NAME = "ETH Texas";
const OCCASION_COST = ethers.utils.parseUnits('1','ether')
const OCCASION_MAX_TICKETS = 100
const OCCASION_DATE = 'Apr 27' 
const OCCASION_TIME = '10:00AM CST'
const OCCASION_LOCATION = 'Austin, Texas'

describe("TokenMaster", () => {
  // describe function is called from mocha framework and it will test for tokenmaster contract
  let tokenMaster;
  let deployer, buyer;

  beforeEach(async () => {
    // before each function code will take places on each function by replicating code
    //setup accounts
    [deployer, buyer] = await ethers.getSigners(); // here we are signing the contract for deployer and buyer address and get signer is a ethereum signer object which contains array and 1st address is assigned to deployer and 2nd address is assigned to buyer
    const TokenMaster = await ethers.getContractFactory("TokenMaster"); // fetching the contract file which is undeployed
    tokenMaster = await TokenMaster.deploy(NAME, SYMBOL); // deploying contract and passing the arguments

    const transaction = await tokenMaster.connect(deployer).list(   // connecting the deployer address to list function and assuring that signer is executing the list function with passing the arguments
      OCCASION_NAME,
      OCCASION_COST,
      OCCASION_MAX_TICKETS,    
      OCCASION_DATE,
      OCCASION_TIME,
      OCCASION_LOCATION
    )  

    await transaction.wait() //wait till transaction will not execute. It will add into mempool
  });

  describe("Deployment", () => {
    // it will test for deployment related tests

    it("Sets the name", async () => {
      // checking the contract name and it is for individual test case
      let name = await tokenMaster.name(); // reading the contract name
      expect(name).to.equal(NAME); // expecting that contract name should be equal
    });
  
    it("Sets the symbol", async () => {
      let symbol = await tokenMaster.symbol();
      expect(symbol).to.equal(SYMBOL);
    });

    it("Sets the owner", async () => {
      let owner = await tokenMaster.owner();
      expect(owner).to.equal(deployer.address);
    });
  });

  describe("Occasions",() => {
    it('Updates occasions count', async () => {
      const totalOccasions = await tokenMaster.totalOccasions()
      expect(totalOccasions).to.equal(1)
    })

    it('Returns occasions attributes',async() => {
      const occasion = await tokenMaster.getOccasion(1)
      expect(occasion.id).to.be.equal(1)
      expect(occasion.name).to.be.equal(OCCASION_NAME)
      expect(occasion.cost).to.be.equal(OCCASION_COST)
      expect(occasion.tickets).to.be.equal(OCCASION_MAX_TICKETS)
      expect(occasion.date).to.be.equal(OCCASION_DATE)
      expect(occasion.time).to.be.equal(OCCASION_TIME)
      expect(occasion.location).to.be.equal(OCCASION_LOCATION)
    })
  })

  describe("Minting", () => {  
    const ID = 1;  // defining occasion id
    const SEAT = 50; // defining seat no
    const AMOUNT = ethers.utils.parseUnits("4","ether")  // minting through 1 ether

    beforeEach(async() => {
      const transaction = await tokenMaster.connect(buyer).mint(ID, SEAT, { value: AMOUNT}) // buyer should use mint function by passing the function parameter
      await transaction.wait()  // wait untill this function parameter passes
    })

    it('Updates ticket count', async () => {
      const occasion = await tokenMaster.getOccasion(1)  // passing the occasion id 
      expect(occasion.tickets).to.be.equal(99)  // checking tickets no from same 
    })

    it('Updates buying status', async () => {
      const status = await tokenMaster.hasBought(ID,buyer.address)  // passing the occasion id and address in hasBought function
      expect(status).to.be.equal(true)  // checking that ticket bought status should be equal to true   
    })
 
    it('Update seat status', async() => {
      const owner = await tokenMaster.seatTaken(ID,SEAT) // passing the id no and seat no to seattaken function
      expect(owner).to.equal(buyer.address)  // checking that buyer address is similar to seattaken function address or not
    })

    it('Updates overall seating status', async() => {
      const seats = await tokenMaster.getSeatsTaken(ID)  // passing the occasion id to getseatstaken function
      expect(seats.length).to.equal(1)  // checking the seats array length to 1 
      expect(seats[0]).to.equal(SEAT)  // checking the seat value should be equal to seats 0th index value
    })

    it('Updates the contract balance', async() => {
      const balance = await ethers.provider.getBalance(tokenMaster.address) // fetching the contract balance
      expect(balance).to.be.equal(AMOUNT) // checking the contract balance should be equal to minted function amount 
    })
  })

  describe("Withdrawing", () => {  // for withdraw status will use this 
    const ID = 1; // defining occasion id
    const SEAT = 50;  // defining seat no
    const AMOUNT = ethers.utils.parseUnits("1", 'ether')
    let balanceBefore;

    beforeEach(async () => {
      balanceBefore = await ethers.provider.getBalance(deployer.address)  // fetching the deployer balance before withdrawing

      let transaction = await tokenMaster.connect(buyer).mint(ID, SEAT, {value: AMOUNT})  // make sure that buyer had purchased the ticket by mint function
      await transaction.wait()  // and then wait for this transaction untill other stuff 

      transaction = await tokenMaster.connect(deployer).withdraw()  // and then deployer can withdraw the his ticket amount
      await transaction.wait()
    })

    it("Updates the owner balance", async () => {  
      const balanceAfter = await ethers.provider.getBalance(deployer.address)  // fetching the owner balance after withdraw
      expect(balanceAfter).to.be.greaterThan(balanceBefore) // expecting that after balance should be greater than before balance
    })

    it("Updates the contract balance", async () => {
      const balance = await ethers.provider.getBalance(tokenMaster.address)  // after withdrawing fetching the contract balance
      expect(balance).to.equal(0) // and contract balance should be zero at this moment
    })
  })
})