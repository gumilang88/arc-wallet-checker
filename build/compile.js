// Compile kontrak minimal ERC-20 & ERC-721 → tulis bytecode+ABI ke artifacts.json
const solc = require("solc");
const fs = require("fs");
const path = require("path");

const ERC20 = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
contract SimpleToken {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    constructor(string memory _name, string memory _symbol, uint256 _supply) {
        name = _name; symbol = _symbol;
        totalSupply = _supply * 10 ** uint256(decimals);
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    function transfer(address to, uint256 value) external returns (bool) {
        require(balanceOf[msg.sender] >= value, "balance");
        balanceOf[msg.sender] -= value; balanceOf[to] += value;
        emit Transfer(msg.sender, to, value); return true;
    }
    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value); return true;
    }
    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        require(balanceOf[from] >= value, "balance");
        require(allowance[from][msg.sender] >= value, "allowance");
        allowance[from][msg.sender] -= value;
        balanceOf[from] -= value; balanceOf[to] += value;
        emit Transfer(from, to, value); return true;
    }
}
`;

const ERC721 = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
contract SimpleNFT {
    string public name;
    string public symbol;
    uint256 public totalSupply;
    string private _uri;
    mapping(uint256 => address) private _ownerOf;
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => address) public getApproved;
    mapping(address => mapping(address => bool)) public isApprovedForAll;
    event Transfer(address indexed from, address indexed to, uint256 indexed id);
    event Approval(address indexed owner, address indexed approved, uint256 indexed id);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    constructor(string memory _name, string memory _symbol, string memory uri_) {
        name = _name; symbol = _symbol; _uri = uri_;
        _mint(msg.sender);
    }
    function mint() external returns (uint256) { return _mint(msg.sender); }
    function _mint(address to) internal returns (uint256 id) {
        id = ++totalSupply;
        _ownerOf[id] = to; balanceOf[to] += 1;
        emit Transfer(address(0), to, id);
    }
    function ownerOf(uint256 id) public view returns (address o) {
        o = _ownerOf[id]; require(o != address(0), "none");
    }
    function tokenURI(uint256) external view returns (string memory) { return _uri; }
    function supportsInterface(bytes4 iid) external pure returns (bool) {
        return iid == 0x80ac58cd || iid == 0x5b5e139f || iid == 0x01ffc9a7;
    }
    function approve(address to, uint256 id) external {
        address o = ownerOf(id);
        require(msg.sender == o || isApprovedForAll[o][msg.sender], "auth");
        getApproved[id] = to; emit Approval(o, to, id);
    }
    function setApprovalForAll(address op, bool ok) external {
        isApprovedForAll[msg.sender][op] = ok; emit ApprovalForAll(msg.sender, op, ok);
    }
    function transferFrom(address from, address to, uint256 id) public {
        require(ownerOf(id) == from, "owner");
        require(msg.sender == from || getApproved[id] == msg.sender || isApprovedForAll[from][msg.sender], "auth");
        _ownerOf[id] = to; balanceOf[from] -= 1; balanceOf[to] += 1;
        delete getApproved[id];
        emit Transfer(from, to, id);
    }
    function safeTransferFrom(address from, address to, uint256 id) external { transferFrom(from, to, id); }
    function safeTransferFrom(address from, address to, uint256 id, bytes calldata) external { transferFrom(from, to, id); }
}
`;

const input = {
  language: "Solidity",
  sources: { "ERC20.sol": { content: ERC20 }, "ERC721.sol": { content: ERC721 } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
  },
};

const out = JSON.parse(solc.compile(JSON.stringify(input)));
if (out.errors) {
  const fatal = out.errors.filter((e) => e.severity === "error");
  out.errors.forEach((e) => console.log(e.formattedMessage));
  if (fatal.length) process.exit(1);
}

const tok = out.contracts["ERC20.sol"].SimpleToken;
const nft = out.contracts["ERC721.sol"].SimpleNFT;
const artifacts = {
  token: { abi: tok.abi, bytecode: "0x" + tok.evm.bytecode.object },
  nft: { abi: nft.abi, bytecode: "0x" + nft.evm.bytecode.object },
};
fs.writeFileSync(path.join(__dirname, "artifacts.json"), JSON.stringify(artifacts, null, 2));
console.log("OK. token bytecode:", artifacts.token.bytecode.length, "chars | nft bytecode:", artifacts.nft.bytecode.length, "chars");
