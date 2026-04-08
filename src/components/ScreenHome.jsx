import { Download, Upload, Pickaxe } from 'lucide-react';
import { toOts, EXPLORER } from '../utils';

export default function ScreenHome({ activeWallet, currentAddress, accountData, openSheet, t }) {
    return (
      <div className="content">
        <h1>{t('wallet')}</h1>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p className="subtitle">{t('balance')}</p>
          <h1 style={{ fontSize: '42px', lineHeight: '1' }}>{toOts(accountData.balance)}</h1>
          <p className="subtitle" style={{ fontSize: '13px' }}>{t('stake', toOts(accountData.stake))}</p>
        </div>
  
        <div className="action-buttons">
          <button className="action-btn" onClick={() => openSheet('receive')}>
            <div className="icon-bg"><Download size={24} /></div>
            <span>{t('receive')}</span>
          </button>
          <button className="action-btn" onClick={() => openSheet('send')}>
            <div className="icon-bg"><Upload size={24} /></div>
            <span>{t('send')}</span>
          </button>
          <button className="action-btn" onClick={() => openSheet('stake')}>
            <div className="icon-bg"><Pickaxe size={24} /></div>
            <span>{t('staking')}</span>
          </button>
        </div>
  
        <div className="card">
          <h3>{t('recentTx')}</h3>
          {accountData.history.length === 0 ? (
            <p className="subtitle" style={{ textAlign: 'center', padding: '20px 0' }}>{t('emptyHistory')}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
              {accountData.history.map((tx, i) => {
                const isIncoming = tx.to === currentAddress;
                const txLink = `${EXPLORER}/tx/${tx.signature || tx.hash}`;
                let color = isIncoming ? 'var(--accentGreen)' : 'var(--foregroundPrimary)';
                if (tx.valid === false) {
                  color = 'var(--accentRed)';
                }
                return (
                  <a href={txLink} target="_blank" rel="noopener noreferrer" key={i} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--separatorCommon)', paddingBottom: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                          {isIncoming ? (tx.type === 'stake' ? t('depositTx') : t('inTx')) : t('outTx')}
                        </span>
                        <span className="subtitle" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                          {tx.hash ? `${tx.hash.slice(0, 8)}...` : new Date(tx.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ fontWeight: '600', color}}>
                        {isIncoming ? '+' : '-'}{toOts(BigInt(tx.amount) + (isIncoming ? 0n : BigInt(tx.fee)))} OTS
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };