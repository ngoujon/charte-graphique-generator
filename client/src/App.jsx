import { useState, useEffect, useRef, useCallback } from 'react';
import { useBootstrap } from './hooks/useBootstrap';
import { useApi } from './hooks/useApi';
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
        <a href="http://www.qwebty.com" target="_blank" rel="noreferrer" className="qwebty-link">
          www.qwebty.com
        </a>
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
