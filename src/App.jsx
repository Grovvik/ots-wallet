import { useState, useEffect } from 'react';

import Address from './otslib/address.js';
import { ec } from 'elliptic';

import BalanceBar from './components/BalanceBar.jsx';
import ActionBar from './components/ActionBar.jsx';
import History from './components/History.jsx';
import "./App.css";
import SendModal from './components/Modals/SendModal.jsx';

const EC = new ec('secp256k1');

const privateKey = ''; // TODO: Local storage
const address = Address.fromKey(EC.keyFromPrivate(privateKey).getPublic('hex'));

const balance = 0;

function App() {
  const state = useState(false);
  return (
    <main>
      <BalanceBar amount={balance} currency="OTS" address={address}/>
      <ActionBar modal={state[1]}/>
      <History />
      <SendModal state={state}/>
    </main>
  );
}

export default App;
