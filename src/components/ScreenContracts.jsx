import { FileCode2, Settings } from 'lucide-react';

export default function ScreenContracts({ openSheet, t }) {
    return (
      <div className="content">
        <h1>{t('contracts')}</h1>
        
        <div className="card" onClick={() => openSheet('deploy')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--backgroundTertiary)', padding: '12px', borderRadius: '12px' }}>
              <FileCode2 color="var(--accentBlue)" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px' }}>{t('deploy')}</h3>
              <p className="subtitle">{t('deploySub')}</p>
            </div>
          </div>
        </div>
  
        <div className="card" onClick={() => openSheet('call')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--backgroundTertiary)', padding: '12px', borderRadius: '12px' }}>
              <Settings color="var(--accentPurple)" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px' }}>{t('call')}</h3>
              <p className="subtitle">{t('callSub')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };