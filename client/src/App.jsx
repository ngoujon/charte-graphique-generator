import { useState, useEffect, useCallback } from 'react';
import './App.css';

const API = '/api';

function useApi(path, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}${path}`, options);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json().catch(() => ({}));
      setData(json);
      return json;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [path, JSON.stringify(options)]);

  useEffect(() => {
    if (!options?.method || options.method === 'GET') fetchData();
  }, [path]);

  return { data, loading, error, refetch: fetchData };
}

function App() {
  const [activeTab, setActiveTab] = useState('input');
  const [config, setConfig] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState(null);

  const { data: inputFiles, refetch: refetchInput } = useApi('/input/files');
  const { data: outputFiles, refetch: refetchOutput } = useApi('/output/files');
  const { data: confData, refetch: refetchConf } = useApi('/conf');

  useEffect(() => {
    if (confData) setConfig(confData);
  }, [confData]);

  const saveConfig = async () => {
    if (!config) return;
    try {
      await fetch(`${API}/conf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      setMessage({ type: 'success', text: 'Configuration enregistrée' });
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  const importConfig = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      await fetch(`${API}/conf/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: parsed }),
      });
      refetchConf();
      setMessage({ type: 'success', text: 'Configuration importée' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Fichier JSON invalide' });
    }
    e.target.value = '';
  };

  const exportConfig = async () => {
    try {
      const res = await fetch(`${API}/conf/export`);
      const config = await res.json();
      const blob = new Blob([JSON.stringify(config, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'charte-config.json';
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Configuration exportée' });
      setTimeout(() => setMessage(null), 2000);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  const generatePdf = async () => {
    setGenerating(true);
    setMessage(null);
    try {
      const res = await fetch(`${API}/generate`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur');
      refetchOutput();
      setMessage({ type: 'success', text: `PDF généré : ${json.filename}` });
      setTimeout(() => setMessage(null), 4000);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setGenerating(false);
    }
  };

  const uploadFiles = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    const form = new FormData();
    for (const f of files) form.append('files', f);
    try {
      await fetch(`${API}/input/upload`, { method: 'POST', body: form });
      refetchInput();
      setMessage({ type: 'success', text: `${files.length} fichier(s) ajouté(s)` });
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
    e.target.value = '';
  };

  const deleteInputFile = async (name) => {
    try {
      await fetch(`${API}/input/files/${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });
      refetchInput();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  const formatSize = (bytes) =>
    bytes < 1024 ? `${bytes} o` : `${(bytes / 1024).toFixed(1)} Ko`;

  return (
    <div className="app">
      <header>
        <h1>Charte Graphique Generator</h1>
        <p>Générez des documents PDF de charge graphique à partir du dossier entrée</p>
      </header>

      {message && (
        <div className={`toast toast-${message.type}`}>{message.text}</div>
      )}

      <nav>
        {['input', 'config', 'output'].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'input' && '📁 Entrée'}
            {tab === 'config' && '⚙️ Configuration'}
            {tab === 'output' && '📄 Sortie'}
          </button>
        ))}
      </nav>

      <main>
        {activeTab === 'input' && (
          <section className="panel">
            <h2>Dossier Entrée</h2>
            <p className="hint">
              Déposez vos fichiers (logos, images) dans ce dossier. Pour les logos : nommez « logo-clair » ou « clair » (fond clair) et « logo-sombre » ou « sombre » (fond sombre).
            </p>
            <div className="upload-zone">
              <label>
                <input type="file" multiple accept="image/*" onChange={uploadFiles} hidden />
                <span>Cliquez pour parcourir</span> ou glissez-déposez vos images
              </label>
            </div>
            <label className="btn btn-primary">
              <input type="file" multiple accept="image/*" onChange={uploadFiles} hidden />
              Ajouter des fichiers
            </label>
            <ul className="file-list">
              {(inputFiles || []).map((f) => (
                <li key={f.name}>
                  <span>{f.name}</span>
                  <span className="size">{formatSize(f.size)}</span>
                  <button
                    className="btn-icon"
                    onClick={() => deleteInputFile(f.name)}
                    title="Supprimer"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            {(!inputFiles || inputFiles.length === 0) && (
              <p className="empty">Aucun fichier. Ajoutez des images pour la charte.</p>
            )}
          </section>
        )}

        {activeTab === 'config' && (
          <section className="panel">
            <h2>Configuration (conf)</h2>
            <p className="hint">
              Personnalisez la charte. Exportez/importez pour réutiliser une config plus tard.
            </p>
            <div className="config-actions">
              <label className="btn btn-secondary">
                <input type="file" accept=".json" onChange={importConfig} hidden />
                Importer config
              </label>
              <button className="btn btn-secondary" onClick={exportConfig}>
                Exporter config
              </button>
            </div>
            {config && (
              <div className="config-form">
                <fieldset>
                  <legend>Projet</legend>
                  <label>
                    Nom du projet
                    <div className="input-wrap">
                      <input
                        type="text"
                        placeholder="Ex: Mon entreprise"
                        value={config.projet?.nom || ''}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            projet: { ...config.projet, nom: e.target.value },
                          })
                        }
                      />
                    </div>
                  </label>
                  <label>
                    Description
                    <div className="input-wrap">
                      <input
                        type="text"
                        placeholder="Ex: Charte graphique 2025"
                        value={config.projet?.description || ''}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            projet: { ...config.projet, description: e.target.value },
                          })
                        }
                      />
                    </div>
                  </label>
                </fieldset>
                <fieldset>
                  <legend>Présentation de la marque</legend>
                  <label>
                    Slogan
                    <div className="input-wrap">
                      <input
                        type="text"
                        placeholder="Ex: Votre slogan ici"
                        value={config.marque?.slogan || ''}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            marque: { ...config.marque, slogan: e.target.value },
                          })
                        }
                      />
                    </div>
                  </label>
                  <label>
                    Mission
                    <div className="input-wrap">
                      <textarea
                        rows={2}
                        placeholder="Ex: Notre mission est de..."
                        value={config.marque?.mission || ''}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            marque: { ...config.marque, mission: e.target.value },
                          })
                        }
                        className="config-textarea"
                      />
                    </div>
                  </label>
                  <label>
                    Valeurs
                    <div className="input-wrap">
                      <input
                        type="text"
                        placeholder="Ex: Innovation, Qualité, Proximité"
                        value={config.marque?.valeurs || ''}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            marque: { ...config.marque, valeurs: e.target.value },
                          })
                        }
                      />
                    </div>
                  </label>
                  <label>
                    Personnalité
                    <div className="input-wrap">
                      <input
                        type="text"
                        placeholder="Ex: Moderne, fiable, accessible"
                        value={config.marque?.personnalite || ''}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            marque: { ...config.marque, personnalite: e.target.value },
                          })
                        }
                      />
                    </div>
                  </label>
                </fieldset>
                <fieldset>
                  <legend>Exemples de texte (typographie)</legend>
                  <label>
                    Titre
                    <div className="input-wrap">
                      <input
                        type="text"
                        placeholder="Ex: Titre de l'exemple"
                        value={config.typographie?.exempleTitre || ''}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            typographie: {
                              ...config.typographie,
                              exempleTitre: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </label>
                  <label>
                    Sous-titre
                    <div className="input-wrap">
                      <input
                        type="text"
                        placeholder="Ex: Sous-titre de l'exemple"
                        value={config.typographie?.exempleSousTitre || ''}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            typographie: {
                              ...config.typographie,
                              exempleSousTitre: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </label>
                  <label>
                    Description
                    <div className="input-wrap">
                      <textarea
                        rows={3}
                        placeholder="Ex: Corps de texte..."
                        value={config.typographie?.exempleDescription || ''}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            typographie: {
                              ...config.typographie,
                              exempleDescription: e.target.value,
                            },
                          })
                        }
                        className="config-textarea"
                      />
                    </div>
                  </label>
                </fieldset>
                <fieldset>
                  <legend>Palette de couleurs</legend>
                  {['primaire', 'secondaire', 'accent', 'fond', 'texte'].map((key) => (
                    <div key={key} className="color-row">
                      <label>
                        <input
                          type="color"
                          value={config.couleurs?.[key] || '#000'}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              couleurs: { ...config.couleurs, [key]: e.target.value },
                            })
                          }
                        />
                        <span style={{ minWidth: 90, textTransform: 'capitalize' }}>{key}</span>
                        <input
                          type="text"
                          value={config.couleurs?.[key] || ''}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              couleurs: { ...config.couleurs, [key]: e.target.value },
                            })
                          }
                          className="color-hex"
                          placeholder="#000000"
                        />
                      </label>
                    </div>
                  ))}
                </fieldset>
                <button className="btn btn-primary" onClick={saveConfig}>
                  Enregistrer la configuration
                </button>
              </div>
            )}
          </section>
        )}

        {activeTab === 'output' && (
          <section className="panel">
            <h2>Dossier Sortie</h2>
            <p className="hint">PDFs générés à partir de l'entrée et de la configuration.</p>
            <button
              className="btn btn-primary btn-large"
              onClick={generatePdf}
              disabled={generating}
            >
              {generating ? 'Génération…' : 'Générer le PDF'}
            </button>
            <ul className="file-list">
              {(outputFiles || []).map((f) => (
                <li key={f.name}>
                  <a href={`${API}/output/files/${encodeURIComponent(f.name)}`} target="_blank" rel="noreferrer">
                    {f.name}
                  </a>
                  <span className="size">{formatSize(f.size)}</span>
                </li>
              ))}
            </ul>
            {(!outputFiles || outputFiles.length === 0) && (
              <p className="empty">Aucun PDF. Cliquez sur "Générer le PDF" pour en créer un.</p>
            )}
          </section>
        )}
      </main>

      <footer>
        <p>
          <code>data/input</code> → fichiers sources • <code>data/output</code> → PDF générés •{' '}
          <code>data/conf</code> → configuration (import/export)
        </p>
      </footer>
    </div>
  );
}

export default App;
