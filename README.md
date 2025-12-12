# OTS Wallet

OTS Wallet is a lightweight web-based cryptocurrency wallet for **OTS**, built with **Vite** and **React**. It allows users to securely manage their OTS by sending, receiving, and exchanging them.

This wallet is designed for simplicity, speed, and ease of integration with the OTS network.

## Features

- Generate and manage OTS wallet addresses
- Send OTS tokens to any address
- Receive OTS via shareable wallet address
- Exchange OTS tokens (integrated swap functionality)
- View transaction history and balance in real time
- Secure private key handling (client-side only)

## Technologies Used

- **Vite** – Fast build tool and dev server
- **React** – Frontend UI library
- **Local storage** – Secure client-side key storage (optional: hardware wallet support planned)

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/grovvik/ots-wallet.git
   cd ots-wallet
   ```

2. Install dependencies:
   ```bash
   npm i
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

---

## Security Notes

- Private keys are generated and stored **only on the client side**.
- Never transmit private keys over the network.
- Always back up your private key securely.

## Contributing

Contributions are welcome! Please read the contribution guidelines before submitting pull requests.

## License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.
