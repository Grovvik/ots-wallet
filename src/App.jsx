import { useState, useEffect } from 'react';

import Address from './otslib/address.js';
import { ec } from 'elliptic';

import BalanceBar from './components/Bars/BalanceBar.jsx';
import ActionBar from './components/Bars/ActionBar.jsx';
import History from './components/History.jsx';
import "./App.css";
import SendModal from './components/Modals/SendModal.jsx';

const EC = new ec('secp256k1');

const privateKey = '8c264bacc0e0e6f3bde35f940f6538f33245b14d17dcaa9efcdf18071a30ef56'; // TODO: Local storage
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
