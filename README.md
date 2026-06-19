# 🩺 Arc Wallet Health Checker

A non-custodial wallet dashboard that **scores and visualizes any wallet's health** on
[Circle's Arc network](https://www.arc.network/) (testnet) — balance, activity, tokens, and
NFTs in one glance — plus one-click on-chain actions powered by a persistent **ArcFactory**.

🔗 **Live demo:** https://gumilang88.github.io/arc-wallet-checker/

---

## What it does

Paste a `0x` address or connect your wallet to get an instant report on Arc testnet (where
**USDC is the native gas token**):

- 🩺 **Health Score (0–100)** — weighted, transparent factors (native balance, tx history,
  ERC-20 holdings, NFTs) rendered as an animated gauge with a plain-language verdict.
- 📊 **Live network bar** — RPC status, chain ID, latest block, gas-price sparkline.
- 🪙 **Token holdings** (ERC-20) with USD valuations.
- 🖼️ **NFT gallery** (ERC-721 / ERC-1155) with image rendering (IPFS-aware).
- 🧾 **Recent transactions** feed with direction, method, and status.
- 🏆 **Top-10 USDC holders** leaderboard.
- ⚡ **On-chain actions** from a connected wallet — deploy a token, mint an NFT, or send a
  test transaction, routed through the on-chain **ArcFactory**.
- 🔌 **Wallet connect** via EIP-6963 + EIP-1193, with automatic Arc network add/switch.
- 🔒 **Non-custodial & read-only** — never asks for a private key.

UI: glassmorphism panels over an animated aurora background, per-section color accents,
count-up number animations, dark/light themes, fully responsive.

## Deployed contracts (Arc Testnet · chainId 5042002)

| Role | Address | Explorer |
|------|---------|----------|
| Deployer | `TBD` | [Arcscan](https://testnet.arcscan.app/) |
| **ArcFactory** | `TBD` | [Arcscan](https://testnet.arcscan.app/) |
| Sample Token (via factory) | `TBD` | [Arcscan](https://testnet.arcscan.app/) |
| Sample NFT (via factory) | `TBD` | [Arcscan](https://testnet.arcscan.app/) |

> Addresses are also recorded in [`deployments.json`](./deployments.json). Replace `TBD` once
> the factory is deployed (see below).

### ArcFactory

A single persistent factory that creates ERC-20 tokens and ERC-721 collections on behalf of the
caller and emits events with the new contract addresses:

```solidity
function createToken(string n, string s, uint256 supply) external returns (address);
function createNFT(string n, string s, string uri)       external returns (address);
event TokenCreated(address indexed creator, address indexed token, string name, string symbol, uint256 supply);
event NFTCreated(address indexed creator, address indexed collection, string name, string symbol);
```

The child `SimpleToken` / `SimpleNFT` constructors take an explicit recipient so the supply /
first NFT goes to the **creator** (`msg.sender` of the factory call), not the factory itself.

## How it works

1. The frontend talks to the Arc RPC (`rpc.testnet.arc.network`) via **ethers.js v6** and pulls
   token / NFT / transaction data from the **Arcscan (Blockscout)** API.
2. On-chain actions go through `ArcFactory` at `FACTORY_ADDRESS` (in `index.html`). The new
   token / collection address is read from the factory's event logs.
3. If `FACTORY_ADDRESS` is empty, the app falls back to deploying contracts directly from the
   connected wallet.

## Run locally

```bash
# any static server works
python3 -m http.server 8011
# open http://localhost:8011
```

To recompile the contracts (regenerates `contracts.js` + `build/artifacts.json`):

```bash
npm install        # installs solc + ethers
node build/compile.js
```

## Deploy the factory (one-time)

1. Open the app, connect a wallet funded with Arc testnet USDC
   (get gas at [faucet.circle.com](https://faucet.circle.com) → Arc Testnet).
2. In **On-chain Actions**, click **🏭 Deploy Factory (one-time)** and confirm.
3. Copy the deployed address into `FACTORY_ADDRESS` in `index.html` and into
   `deployments.json`, then redeploy the site.

## Tech stack

Vanilla JS + HTML/CSS (zero build step) · ethers.js v6 · solc-compiled
ERC-20 / ERC-721 / ArcFactory · Arc Testnet RPC · Arcscan / Blockscout API.

## Security

Read-only by default — your private key is never requested. Connecting a wallet only reads your
address and switches the network. On-chain actions are signed in your own wallet.
