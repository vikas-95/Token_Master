// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol"; // importing the erc721 token contract library from openzeppelin

contract TokenMaster is ERC721 {  // here we are inheriting the erc721 contract file functionality
    address public owner; // who deploys contract 
    uint256 public totalOccasions;  // how many occasions will be there
    uint256 public totalSupply; // how many nft's will be exist

    struct Occasion{  // user defined struct for each event
        uint256 id;
        string name;
        uint256 cost;
        uint256 tickets;
        uint256 maxTickets;
        string date;
        string time;
        string location;
    }

    mapping(uint256 => Occasion) occasions; 
    mapping(uint256 => mapping(address => bool)) public hasBought; // in a particular occasion id a address has bought ticket or not
    mapping(uint256 => mapping(uint256 => address)) public seatTaken;  // mapping for seats  // first uint256 for occasion id , second uint256 for seatID , and address is for which address belongs to that seat
    mapping(uint256 => uint256[]) seatsTaken;  // how many seats have been reserved in a occasion // first uint is for occasion id and second is for seats

    constructor(  // contract name and symbol will be passed for testing purpose
        string memory _name,
        string memory _symbol 
    ) ERC721(_name, _symbol){  // here we are specifying the erc721 constructor where we have to transfer the arguments
        owner = msg.sender;  // owner should be equal who calls the contract 
    }

    modifier onlyOwner {
        require(owner == msg.sender,"You are not a owner");
        _;
    }

    function list(  // event list 
        string memory _name,
        uint256 _cost,
        uint256 _maxTickets,
        string memory _date,
        string memory _time,
        string memory _location
    ) public onlyOwner{
        totalOccasions++;

        occasions[totalOccasions] = Occasion(
            totalOccasions,
            _name,
            _cost,
            _maxTickets,
            _maxTickets,
            _date,
            _time,
            _location
        );
    }

    function mint(uint256 _id, uint256 _seat) public payable{  // creating the nft from mint function  // _id is occasion id  // _seat is seat no.
        require(_id != 0);  // occasion id should not be equal to 0
        require(_id <= totalOccasions);  // occasion id should be equal or less than totaloccasions 
        require(msg.value >= occasions[_id].cost); // sending ether value should be equal or greater than occasion cost
        require(seatTaken[_id][_seat] == address(0));  // in that occasion seats should not be reserved
        require(_seat <= occasions[_id].maxTickets);  // in that occasion ticket no. should be valid , means user selected seat no. can be equal to max tickets
        occasions[_id].tickets -= 1;  // update ticket count

        hasBought[_id][msg.sender] = true; // update buying status
        seatTaken[_id][_seat] = msg.sender;  // assign the seat

        seatsTaken[_id].push(_seat); // update seats currently taken 

        totalSupply++;
        _safeMint(msg.sender, totalSupply);   // passing the owner address and token id to predefined function in openzeppelin
    }

    function getOccasion(uint256 _id) public view returns(Occasion memory){  // getting the occasion name from mapping id
        return occasions[_id];
    }

    function getSeatsTaken(uint256 _id) public view returns(uint256[] memory){  // getting the taken seats from occasion id
        return seatsTaken[_id];
    }

    function withdraw() public onlyOwner {  // use will withdraw the contract balance to his own account
        (bool success, ) = owner.call{value: address(this).balance}("");  // checking that contract balance by calling from owner and that should be transferred succesfully to owner by using metadata {} and sending with ("") empty msg
        require(success); // and if its transferred successfully then remaining functionality will run
        // transfer can be done by .transfer method
    }
}