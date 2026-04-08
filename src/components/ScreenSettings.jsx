import { Plus, Globe } from 'lucide-react';
import ContextMenu from './ContextMenu';
import CryptoUtils from '../otslib/crypto';

export default function ScreenSettings({ wallets, activeWallet, setActiveWallet, onImport, onGenerate, onRename, onDelete, lang, setLang, t }) {
    return (
      <div className="content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h1>{t('settings')}</h1>
        
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe size={20} color="var(--accentBlue)" />
            <span style={{ fontWeight: '500' }}>{t('language')}</span>
          </div>
          <select 
            value={lang} 
            onChange={e => setLang(e.target.value)} 
            style={{ width: 'auto', background: 'transparent', padding: '4px', textAlign: 'right', border: 'none' }}
          >
            <option value="ru">Русский</option>
            <option value="en">English</option>
          </select>
        </div>
  
        <h2>{t('myWallets')}</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {wallets.map((w, index) => {
            const addr = CryptoUtils.getPublicKey(w.priv);
            return (
              <div 
                key={index} 
                className="card" 
                style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderColor: activeWallet.priv === w.priv ? 'var(--accentBlue)' : 'var(--separatorCommon)',
                  cursor: 'pointer'
                }}
                onClick={() => setActiveWallet(w)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontWeight: '600' }}>{w.name}</span>
                  <span className="subtitle" style={{ fontFamily: 'monospace', fontSize: '11px', opacity: 0.7 }}>
                    {addr.slice(0, 8)}...{addr.slice(-8)}
                  </span>
                </div>
                
                <div onClick={(e) => e.stopPropagation()}>
                  <ContextMenu options={[
                    { label: t('copyAddr'), action: () => navigator.clipboard.writeText(addr) },
                    { label: t('rename'), action: () => onRename(w.priv) },
                    { label: t('deleteKey'), action: () => onDelete(w.priv), danger: true },
                  ]} />
                </div>
              </div>
            );
          })}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button className="btn-primary" style={{gap: '4px'}} onClick={onGenerate}>
            <Plus />
            <span>{t('newWalletParams')}</span>
          </button>
          <button className="btn-primary" 
            style={{ background: 'var(--backgroundTertiary)', color: 'var(--foregroundPrimary)', gap: '4px' }}
            onClick={onImport}
          >
            <Plus />
            <span>{t('importParams')}</span>
          </button>
        </div>
      </div>
    );
  };