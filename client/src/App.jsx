import { useState, useEffect, useRef, useCallback } from 'react';
import { useBootstrap } from './hooks/useBootstrap';
import { useApi } from './hooks/useApi';
import { useTheme } from './hooks/useTheme';
import { apiFetch } from './services/api';
import { Toast } from './components/ui/Toast';
import { InputPanel } from './components/panels/InputPanel';
import { OutputPanel } from './components/panels/OutputPanel';
import { ConfigPanel } from './components/panels/ConfigPanel';
import './App.css';

function App() {
  const [config, setConfig] = useState(null);
  const [message, setMessage] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const {
    config: bootstrapConfig,
    inputFiles,
    outputFiles,
    trashFiles,
    customFonts,
    loading: bootstrapLoading,
    error: bootstrapError,
    refetch: refetchBootstrap,
  } = useBootstrap();

  const { data: history, refetch: refetchHistory } = useApi('/conf/history');
  const { data: templates } = useApi('/conf/templates');
  const { data: projects, refetch: refetchProjects } = useApi('/conf/projects');

  const displayConfig = config ?? bootstrapConfig;

  useEffect(() => {
    if (bootstrapConfig && !config) setConfig(bootstrapConfig);
  }, [bootstrapConfig, config]);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), message.type === 'success' ? 3000 : 5000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const isFirstConfig = useRef(true);
  useEffect(() => {
    if (!config) return;
    if (isFirstConfig.current) {
      isFirstConfig.current = false;
      return;
    }
    setSaveStatus('saving');
    const timer = setTimeout(async () => {
      try {
        await apiFetch('/conf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config),
        });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 2000);
      } catch (e) {
        setSaveStatus('error');
        setMessage({ type: 'error', text: e.message });
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [config]);

  const refetchInput = useCallback(async () => {
    const data = await refetchBootstrap();
    return data?.inputFiles;
  }, [refetchBootstrap]);

  const refetchOutput = useCallback(async () => {
    const data = await refetchBootstrap();
    return data?.outputFiles;
  }, [refetchBootstrap]);

  const refetchTrash = useCallback(async () => {
    const data = await refetchBootstrap();
    return data?.trashFiles;
  }, [refetchBootstrap]);

  const refetchFonts = useCallback(async () => {
    const data = await refetchBootstrap();
    return data?.fonts;
  }, [refetchBootstrap]);

  const refetchConf = useCallback(async () => {
    const data = await refetchBootstrap();
    if (data?.config) setConfig(data.config);
    return data?.config;
  }, [refetchBootstrap]);

  const onMessage = useCallback((msg) => setMessage(msg), []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (config) {
          apiFetch('/conf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config),
          }).then(() => {
            setSaveStatus('saved');
            onMessage({ type: 'success', text: 'Configuration sauvegardée' });
          }).catch((err) => onMessage({ type: 'error', text: err.message }));
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [config, onMessage]);

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">Aller au contenu</a>
      <header className="app-header">
        <div className="app-header-brand">
          <img src="/qwebty-logo.svg" alt="Qwebty" className="qwebty-logo" />
          <div>
            <h1>Charte Graphique Generator</h1>
            <p>data/input → data/output • data/trash • data/conf</p>
          </div>
        </div>
        <div className="app-header-actions">
          <button
            type="button"
            className="btn btn-secondary btn-icon-only theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {theme === 'dark' ? (
              <svg className="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg className="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          <a href="http://www.qwebty.com" target="_blank" rel="noreferrer" className="qwebty-link">
            www.qwebty.com
          </a>
        </div>
      </header>

      <Toast message={message} />

      <main id="main-content" className="page-all">
        <div className="folders-grid">
          <InputPanel
            inputFiles={inputFiles}
            refetchInput={refetchInput}
            onMessage={onMessage}
          />
          <OutputPanel
            outputFiles={outputFiles}
            trashFiles={trashFiles}
            refetchOutput={refetchOutput}
            refetchTrash={refetchTrash}
            onMessage={onMessage}
          />
        </div>

        <ConfigPanel
          displayConfig={displayConfig}
          setConfig={setConfig}
          confLoading={bootstrapLoading}
          confError={bootstrapError}
          refetchConf={refetchConf}
          customFonts={customFonts}
          refetchFonts={refetchFonts}
          inputFiles={inputFiles}
          refetchInput={refetchInput}
          history={history}
          refetchHistory={refetchHistory}
          templates={templates}
          projects={projects}
          refetchProjects={refetchProjects}
          saveStatus={saveStatus}
          onMessage={onMessage}
          showConfirmReset={showConfirmReset}
          setShowConfirmReset={setShowConfirmReset}
        />
      </main>

      <footer className="app-footer">
        <img src="/qwebty-logo.svg" alt="Qwebty" className="qwebty-logo-footer" />
        <span className="app-footer-brand">Qwebty</span>
        <a href="http://www.qwebty.com" target="_blank" rel="noreferrer">www.qwebty.com</a>
        <span className="app-footer-tagline">Document généré par Qwebty</span>
      </footer>
    </div>
  );
}

export default App;
