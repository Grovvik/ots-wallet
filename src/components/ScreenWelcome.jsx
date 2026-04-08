export default function ScreenWelcome({ onImport, onGenerate, t }) {
    return (
      <div className="content" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100vh', gap: '15px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ marginBottom: '10px' }}>{t('welcome')}</h1>
          <p className="subtitle">{t('welcomeSub')}</p>
        </div>
        
        <button className="btn-primary" onClick={onGenerate}>
          {t('createWallet')}
        </button>
        <button className="btn-primary" style={{ background: 'var(--backgroundTertiary)', color: 'var(--foregroundPrimary)' }} onClick={onImport}>
          {t('importWallet')}
        </button>
      </div>
    );
  };