import React, { useState, useEffect, useRef } from 'react';
import { Wallet, FileCode2, Settings, Check } from 'lucide-react';
import WalletWrapper from 'ots-lib/wallet';
import CryptoUtils from 'ots-lib/crypto';
import P2PNetwork from 'ots-lib/userNetwork';
import { Buffer } from 'buffer';
window.Buffer = Buffer;
import { toOts, toNanoOts, saveWallets, loadWallets, fetchApi, sha256, countInstructions, WS_API } from './utils';
import { compile } from 'ots-lib/compiler';
import { Transaction } from 'ots-lib/models';
import { consts, costs } from 'ots-lib/config';
import { translations } from './translate';
import showToast from './components/Toast';
import BottomSheet from './components/BottomSheet';
import ScreenWelcome from './components/ScreenWelcome';
import ScreenHome from './components/ScreenHome';
import ScreenContracts from './components/ScreenContracts';
import ScreenSettings from './components/ScreenSettings';

export default function App() {
  const [lang, setLang] = useState('ru'); 

  const t = (key, ...args) => {
    let str = translations[lang][key] || translations['en'][key] || key;
    args.forEach((arg, i) => { str = str.replace(`{${i}}`, arg); });
    return str;
  };

  const [activeTab, setActiveTab] = useState('home');
  const [sheet, setSheet] = useState(null); 
  
  const savedWallets = loadWallets();
  const [wallets, setWallets] = useState(savedWallets || []);
  const [activeWallet, setActiveWallet] = useState(wallets.length > 0 ? wallets[0] : null);

  const [accountData, setAccountData] = useState({ balance: 0n, stake: 0n, nonce: 0, history: [] });
  const networkRef = useRef(null);
  const [deployedAddress, setDeployedAddress] = useState(null);
  
  const [sendState, setSendState] = useState('idle');
  const [deployState, setDeployState] = useState('idle');
  const [deployCost, setDeployCost] = useState(0n);

  const tabs = ['home', 'contracts', 'settings'];
  const [touchStart, setTouchStart] = useState({x: null, y: null});

  const handleTouchStart = (e) => {
    setTouchStart({x: e.touches[0].clientX, y: e.touches[0].clientY});
  };

  const handleTouchEnd = (e) => {
    if (touchStart === null) return;
    const deltaX = touchStart.x - e.changedTouches[0].clientX;
    const deltaY = touchStart.y - e.changedTouches[0].clientY;

    if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < Math.abs(deltaX) / 2) {
      const currentIndex = tabs.indexOf(activeTab);
      if (deltaX > 0 && currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1]);
      } 
      else if (deltaX < 0 && currentIndex > 0) {
        setActiveTab(tabs[currentIndex - 1]);
      }
    }
    setTouchStart(null);
  };

  const walletInstance = activeWallet ? WalletWrapper.fromData(activeWallet) : null;
  const currentAddress = walletInstance ? walletInstance.address : '';
  const currentPublicKey = walletInstance ? walletInstance.publicKey : '';
  useEffect(() => {
    if (activeWallet) {
      const handleIncomingTx = (data) => {
        if (!data || !data.tx) return;
        try {
          const tx = CryptoUtils.deserializeWithBigInt(data.tx);
          if (tx.from === currentPublicKey || tx.to === currentPublicKey) {
            setAccountData(prev => {
              if (prev.history.some(h => h.hash === data.hash)) return prev;
              if (!data.success) {
                showToast(t('txError', data.data ? `: ${data.data}` : ''), false);
              }
              let newBalance = prev.balance;
              const fee = data.fee ? BigInt(data.fee) : 0n;
              
              if (tx.from === currentPublicKey) newBalance = prev.balance - (data.success ? tx.amount : 0n) - fee;
              else if (tx.to === currentPublicKey) newBalance = prev.balance + (data.success ? tx.amount : 0n);

              const newTx = {
                hash: tx.hash || tx.signature || data.hash, type: tx.type, from: tx.from, to: tx.to,
                amount: tx.amount, fee, timestamp: tx.timestamp || Date.now(), valid: data.success
              };

              return { 
                ...prev, 
                balance: newBalance,
                nonce: tx.from === currentPublicKey ? prev.nonce + 1 : prev.nonce,
                history: [newTx, ...prev.history] 
              };
            });
          }
        } catch (e) {
          console.error("Parse Error:", e);
        }
      };

      const net = new P2PNetwork(activeWallet.priv, handleIncomingTx);
      net.connectToPeer(WS_API);
      networkRef.current = net;

      return () => {
        if (net.closeConnection) net.closeConnection(() => {}, false);
      };
    }
  }, [activeWallet, currentAddress]);

  const fetchAccountData = async () => {
    if (!currentAddress) return;
    try {
      const res = await fetchApi(`/api/address/${currentPublicKey}`);
      if (res.ok) {
        const data = await res.json();
        setAccountData({
          balance: BigInt(data.balance) || 0n,
          stake: BigInt(data.stake) || 0n,
          nonce: data.nonce || 0,
          history: data.history || []
        });
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => { fetchAccountData(); }, [currentAddress]);

  const generateWallet = () => {
    const newWalletWrap = WalletWrapper.generate(`Wallet ${wallets.length + 1}`);
    const newWallet = newWalletWrap.toData();
    const updated = [...wallets, newWallet];
    setWallets(updated); saveWallets(updated); setActiveWallet(newWallet);
    prompt(t('saveMnemonic') || 'Please save this mnemonic phrase in a secure location:', newWalletWrap.mnemonic);
  };

  const importWallet = () => {
    const input = prompt(t('enterPriv') || 'Enter 12-word mnemonic phrase (or private key):');
    if (input) {
      try {
        let newWalletWrap;
        if (input.trim().includes(' ')) {
            newWalletWrap = WalletWrapper.fromMnemonic(`Wallet ${wallets.length + 1}`, input.trim());
        } else {
            newWalletWrap = WalletWrapper.fromData({ name: `Wallet ${wallets.length + 1}`, priv: input.trim() });
        }
        const newWallet = newWalletWrap.toData();
        const updated = [...wallets, newWallet];
        setWallets(updated); saveWallets(updated); setActiveWallet(newWallet);
      } catch (e) {
        showToast('Invalid mnemonic or key', false);
      }
    }
  };

  const removeWallet = (priv) => {
    const updated = wallets.filter(w => w.priv !== priv);
    setWallets(updated); saveWallets(updated);
    if (activeWallet && activeWallet.priv === priv) {
      setActiveWallet(updated.length > 0 ? updated[0] : null);
    }
  };

  const renameWallet = (priv) => {
    const newName = prompt(t('newName'));
    if (newName) {
      const updated = wallets.map(w => w.priv === priv ? {...w, name: newName} : w);
      setWallets(updated); saveWallets(updated);
      if (activeWallet && activeWallet.priv === priv) setActiveWallet({...activeWallet, name: newName});
    }
  };

  const [txForm, setTxForm] = useState({ to: '', amount: '', comment: '' });
  const [contractForm, setContractForm] = useState({ address: '', code: '', args: '{}', amount: '', gasLimit: '' });

  const handleSend = async () => { 
    if (!networkRef.current) return showToast(t('netError'), false);
    const amountBI = toNanoOts(txForm.amount);
    if (amountBI > BigInt(accountData.balance) + costs.BASE_FEE) return showToast(t('noFunds', toOts(amountBI), toOts(BigInt(accountData.balance) + costs.BASE_FEE)), false);
    setSendState('sending');

    try {
      const tx = walletInstance.createTransfer(txForm.to.trim(), txForm.amount, txForm.comment, accountData.nonce);
      await networkRef.current.sendTransaction(tx);
      setSendState('success');
      setTxForm({ to: '', amount: '', comment: '' });
    } catch (e) {
      showToast(t('sendError') + e.message, false);
      setSendState('idle');
    }
  };

  const handleEstimateDeploy = () => {
    try {
      const compiled = compile(contractForm.code);
      
      const codeAmountBI = BigInt(countInstructions(compiled)) * BigInt(consts.OPCODE_PRICE);
      const totalCost = codeAmountBI + BigInt(costs.BASE_FEE);

      if (BigInt(accountData.balance) < totalCost) {
        return showToast(t('noFunds', toOts(totalCost), toOts(accountData.balance)));
      }

      setDeployCost(totalCost);
      setDeployState('confirm');

    } catch (e) {
      showToast(e.message, false);
    }
  };

  const handleConfirmDeploy = async () => {
    if (!networkRef.current) return;
    setDeployState('sending');

    const futureAddress = await sha256(currentPublicKey + accountData.nonce);
    try {
      const code = compile(contractForm.code);
      const tx = walletInstance.createDeploy(code, deployCost, accountData.nonce);
      
      await networkRef.current.sendTransaction(tx);
      
      setDeployedAddress(futureAddress);
      setDeployState('success');
    } catch (e) { 
      showToast(e.message, false); 
      setDeployState('idle'); 
    }
  };

  const handleCall = async () => { 
    if (!networkRef.current) return;
    const amountBI = toNanoOts(contractForm.amount || '0');
    const gamLimitBI = toNanoOts(contractForm.gasLimit || '0');
    if (amountBI > BigInt(accountData.balance)) return showToast(t('noFunds', toOts(amountBI), toOts(accountData.balance)), false);
    if (gamLimitBI > BigInt(accountData.balance)) return showToast(t('noFunds', toOts(gamLimitBI), toOts(accountData.balance)), false);
    try {
      const tx = walletInstance.createCall(contractForm.address.trim(), contractForm.amount || '0', contractForm.args, accountData.nonce);
      await networkRef.current.sendTransaction(tx);
      showToast(t('callSuccess'));
      setSheet(null);
    } catch (e) { showToast(e.message, false); }
  };

  const handleStake = async () => {
    if (!networkRef.current) return;
    const amountBI = toNanoOts(txForm.amount);
    if (amountBI > BigInt(accountData.balance) + costs.BASE_FEE) return showToast(t('noFunds', toOts(amountBI), toOts(BigInt(accountData.balance) + costs.BASE_FEE)), false);
    try {
      const tx = walletInstance.createStake(txForm.amount, accountData.nonce);
      await networkRef.current.sendTransaction(tx);
      showToast(t('stakeSuccess'));
      setSheet(null);
    } catch (e) { showToast(e.message, false); }
  }

  if (wallets.length === 0 || !activeWallet) {
    return (
      <div className="app">
        <ScreenWelcome onImport={importWallet} onGenerate={generateWallet} t={t} />
      </div>
    );
  }

  
  return (
    <div className="app">
      <div 
        className="screens-viewport"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="screens-track"
          style={{ transform: `translateX(-${tabs.indexOf(activeTab) * 100}%)` }}
        >
          <div className="screen-wrapper">
            <ScreenHome activeWallet={activeWallet} currentAddress={currentAddress} accountData={accountData} openSheet={setSheet} t={t} />
          </div>
          <div className="screen-wrapper">
            <ScreenContracts openSheet={setSheet} t={t} />
          </div>
          <div className="screen-wrapper">
            <ScreenSettings 
              wallets={wallets} activeWallet={activeWallet} setActiveWallet={setActiveWallet}
              onImport={importWallet} onGenerate={generateWallet} onRename={renameWallet} onDelete={removeWallet}
              lang={lang} setLang={setLang} t={t}
            />
          </div>
        </div>
      </div>

      <div className="bottom-nav">
        <div 
          className="nav-indicator"
          style={{ transform: `translateX(${tabs.indexOf(activeTab) * 100}%)` }}
        >
          <div className="indicator-line" />
        </div>

        <button className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          <Wallet size={24} /><span>{t('wallet')}</span>
        </button>
        <button className={`nav-item ${activeTab === 'contracts' ? 'active' : ''}`} onClick={() => setActiveTab('contracts')}>
          <FileCode2 size={24} /><span>{t('contracts')}</span>
        </button>
        <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
          <Settings size={24} /><span>{t('settings')}</span>
        </button>
      </div>

      <BottomSheet isOpen={sheet === 'send'} onClose={() => { setSheet(null); setSendState('idle'); }} title={t('sendOts')}>
        <input placeholder={t('addrPlaceholder')} value={txForm.to} onChange={e => setTxForm({...txForm, to: e.target.value.trim()})} disabled={sendState !== 'idle'} />
        <input type="number" placeholder={t('sumPlaceholder')} value={txForm.amount} onChange={e => setTxForm({...txForm, amount: e.target.value})} disabled={sendState !== 'idle'} />
        <input placeholder={t('commentPlaceholder')} value={txForm.comment} onChange={e => setTxForm({...txForm, comment: e.target.value.slice(0, 1024)})} disabled={sendState !== 'idle'} />
        {sendState === 'idle' && <button className="btn-primary" onClick={handleSend}>{t('send')}</button>}
        {sendState === 'sending' && <button className="btn-primary" disabled style={{ opacity: 0.7 }}>{t('sending')}</button>}
        {sendState === 'success' && <button className="btn-primary" disabled style={{ background: 'var(--accentGreen)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Check size={18} />{t('sent')}</button>}
      </BottomSheet>

      <BottomSheet isOpen={sheet === 'receive'} onClose={() => setSheet(null)} title={t('yourAddr')}>
        <div style={{ background: 'var(--constantWhite)', padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '150px', height: '150px', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
            QR Placeholder
          </div>
        </div>
        <input readOnly value={currentAddress} style={{ fontFamily: 'monospace', fontSize: '12px' }} />
        <button className="btn-primary" onClick={() => navigator.clipboard.writeText(currentAddress)}>{t('copyAddr')}</button>
      </BottomSheet>

      <BottomSheet isOpen={sheet === 'stake'} onClose={() => setSheet(null)} title={t('staking')}>
        <p className="subtitle">{t('stakeMinInfo', toOts(consts.MINIMAL_STAKE))}</p>
        <input type="number" placeholder={t('stakeSum')} value={txForm.amount} onChange={e => setTxForm({...txForm, amount: e.target.value})} />
        <button className="btn-primary" style={{ background: 'var(--accentGreen)' }} onClick={handleStake}>{t('doStake')}</button>
      </BottomSheet>


      <BottomSheet isOpen={sheet === 'deploy'} onClose={() => { setSheet(null); setDeployState('idle'); setDeployedAddress(null); }} title={t('deploy')}>
        
        {!deployedAddress && deployState === 'idle' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '300px', gap: '12px' }}>
            <textarea placeholder="// ECMAScript..." style={{ 
              fontFamily: 'monospace', 
              flex: 1,
              resize: 'none',
              width: '100%',
              padding: '8px',
              fontSize: '14px'
            }} value={contractForm.code} onChange={e => setContractForm({...contractForm, code: e.target.value})} />
            <button className="btn-primary" onClick={handleEstimateDeploy}>{t('doDeploy')}</button>
          </div>
        )}

        {!deployedAddress && deployState === 'confirm' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card" style={{ background: 'var(--backgroundTertiary)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'center' }}>
              <div className="subtitle" style={{ fontSize: '13px' }}>{t('estimatedCost')}</div>
              <div style={{ color: 'var(--foregroundPrimary)', fontWeight: '600', fontSize: '20px' }}>
                {toOts(deployCost)} OTS
              </div>
            </div>
            <button className="btn-primary" onClick={handleConfirmDeploy}>{t('send')}</button>
            <button className="btn-primary" style={{ background: 'transparent', color: 'var(--foregroundSecondary)' }} onClick={() => setDeployState('idle')}>{t('close')}</button>
          </div>
        )}

        {!deployedAddress && deployState === 'sending' && (
          <button className="btn-primary" disabled style={{ opacity: 0.7 }}>{t('sending')}</button>
        )}

        {deployedAddress && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '10px 0', textAlign: 'center' }}>
            <div style={{ color: 'var(--accentGreen)', fontWeight: '500' }}>{t('txSent')}</div>
            <p className="subtitle" style={{ fontSize: '13px' }}>{t('contractAddr')}</p>
            <div className="card" style={{ background: 'var(--backgroundTertiary)', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '12px', width: '100%' }}>{deployedAddress}</div>
            
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => {navigator.clipboard.writeText(deployedAddress); showToast(t('copied'))}}>{t('copyAddr')}</button>
            <button className="btn-primary" style={{ background: 'transparent', color: 'var(--foregroundSecondary)', width: '100%' }} onClick={() => { setSheet(null); setDeployState('idle'); setDeployedAddress(null); }}>{t('close')}</button>
          </div>
        )}
      </BottomSheet>

      <BottomSheet isOpen={sheet === 'call'} onClose={() => setSheet(null)} title={t('call')}>
        <input placeholder={t('callAddr')} value={contractForm.address} onChange={e => setContractForm({...contractForm, address: e.target.value.trim()})} />
        <input type="number" placeholder={t('callSum')} value={contractForm.amount} onChange={e => setContractForm({...contractForm, amount: e.target.value})} />
        <input type="number" placeholder={t('callGasLim')} value={contractForm.gasLimit} onChange={e => setContractForm({...contractForm, gasLimit: e.target.value})} />
        <textarea rows="4" placeholder={t('callArgs')} style={{ fontFamily: 'monospace' }} value={contractForm.args} onChange={e => setContractForm({...contractForm, args: e.target.value})} />
        <button className="btn-primary" onClick={handleCall}>{t('doCall')}</button>
      </BottomSheet>
    </div>
  );
}