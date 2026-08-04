# OTS Wallet

**OTS Wallet** is a lightweight, modern web-based cryptocurrency wallet for the **OTS Blockchain**, built with **Vite**, **React 19**, and **`ots-lib`**. It enables users to securely manage wallets, transfer OTS tokens, deploy and execute smart contracts, and stake tokens directly from their browser.

---

## 🚀 Features

- 🔑 **Wallet Management**:
  - Client-side key pair generation (secp256k1).
  - Private key import and key renaming/deletion.
  - Multi-wallet storage in local browser storage.
  - Shareable address & QR code preview.

- 💸 **Transactions & Real-Time P2P Network**:
  - Send and receive OTS tokens with optional transaction comments.
  - Direct WebSocket connection to OTS user P2P nodes (`P2PNetwork`).
  - Real-time balance and transaction status notifications.

- 📜 **Smart Contracts Engine**:
  - Integrated smart contract compiler powered by `ots-lib`.
  - Upfront execution cost calculation & opcode fee estimation.
  - One-click contract deployment to the OTS Blockchain.
  - Execute smart contract functions with dynamic JSON parameters and gas limit control.

- 🥩 **Validator Staking**:
  - Fast staking interface for participating in consensus validation.

- 🌐 **UI & UX**:
  - Fully responsive mobile & desktop design.
  - Touch swipe gestures for tab navigation (`Home`, `Contracts`, `Settings`).
  - Native-feeling Bottom Sheet dialogs.
  - Multi-language support (**Russian** and **English**).

---

## 🛠 Tech Stack & Architecture

- **UI Framework**: React 19 + Vite
- **Icons**: Lucide React
- **Blockchain Protocol & Crypto**: [`ots-lib`](https://www.npmjs.com/package/ots-lib) (Handles secp256k1 key generation, SHA-256 serialization, contract compilation, P2P WebSocket networking, and transaction signing)

---

## 📦 Installation & Setup

### Prerequisites

- **Node.js** (v18+ recommended)
- **pnpm** (or `npm` / `yarn`)

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Grovvik/ots-wallet.git
   cd ots-wallet
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```
   > *Note: `ots-lib` will be installed automatically as a dependency.*

3. **Start the local development server**:
   ```bash
   pnpm dev
   ```
   The application will run at [http://localhost:5173](http://localhost:5173).

4. **Build for production**:
   ```bash
   pnpm build
   ```

---

## 🔒 Security Notes

- **Client-Side Security**: Private keys are generated and processed **strictly inside the client browser**. Private keys are never transmitted over the network or sent to remote servers.
- **Data Protection**: Always back up your private keys in a secure location. Clearing browser data will erase non-backed-up wallets stored in `localStorage`.

---

## 📄 License

This project is open-source and released under the [MIT License](LICENSE).
