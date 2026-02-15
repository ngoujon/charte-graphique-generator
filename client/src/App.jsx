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
  const [config, setConfig] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState(null);

  const { data: inputFiles, refetch: refetchInput } = useApi('/input/files');
  const { data: outputFiles, refetch: refetchOutput } = useApi('/output/files');
  const { data: trashFiles, refetch: refetchTrash } = useApi('/output/trash/files');
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

  const deleteOutputFile = async (name) => {
    try {
      await fetch(`${API}/output/files/${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });
      refetchOutput();
      refetchTrash();
      setMessage({ type: 'success', text: 'PDF déplacé dans la corbeille' });
      setTimeout(() => setMessage(null), 2000);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  const restoreTrashFile = async (name) => {
    try {
      await fetch(`${API}/output/trash/files/${encodeURIComponent(name)}/restore`, {
        method: 'POST',
      });
      refetchOutput();
      refetchTrash();
      setMessage({ type: 'success', text: 'PDF restauré' });
      setTimeout(() => setMessage(null), 2000);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  const permanentlyDeleteTrashFile = async (name) => {
    try {
      await fetch(`${API}/output/trash/files/${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });
      refetchTrash();
      setMessage({ type: 'success', text: 'PDF supprimé définitivement' });
      setTimeout(() => setMessage(null), 2000);
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
        <p>data/input → data/output • data/trash • data/conf</p>
      </header>

      {message && (
        <div className={`toast toast-${message.type}`}>{message.text}</div>
      )}

      <main className="page-all">
        <section className="panel">
            <h2>Dossier Entrée</h2>
            <p className="hint">
              Logos : clair, sombre, primaire, secondaire (dans le nom du fichier)
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

        <section className="panel">
            <h2>Configuration (conf)</h2>
            <p className="hint">
              Importez/exportez pour réutiliser une config.
            </p>
            <div className="config-actions">
              <label className="btn btn-secondary btn-icon-only" title="Importer config">
                <input type="file" accept=".json" onChange={importConfig} hidden />
                <svg className="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </label>
              <button className="btn btn-secondary btn-icon-only" onClick={exportConfig} title="Exporter config">
                <svg className="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            </div>
            {config && (
              <div className="config-form">
                <div className="config-fields-grid">
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
                  <label>
                    Date
                    <div className="input-wrap">
                      <input
                        type="date"
                        value={config.projet?.date || ''}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            projet: { ...config.projet, date: e.target.value },
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
                        rows={1}
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
                  <legend>Typographie</legend>
                  <label>
                    Police titre
                    <div className="input-wrap">
                      <select
                        value={config.typographie?.titre || 'Helvetica-Bold'}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            typographie: { ...config.typographie, titre: e.target.value },
                          })
                        }
                      >
                        <option value="Helvetica-Bold">Helvetica-Bold</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Times-Bold">Times-Bold</option>
                        <option value="Times-Roman">Times-Roman</option>
                        <option value="Courier-Bold">Courier-Bold</option>
                        <option value="Courier">Courier</option>
                      </select>
                    </div>
                  </label>
                  <label>
                    Police corps
                    <div className="input-wrap">
                      <select
                        value={config.typographie?.corps || 'Helvetica'}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            typographie: { ...config.typographie, corps: e.target.value },
                          })
                        }
                      >
                        <option value="Helvetica">Helvetica</option>
                        <option value="Helvetica-Bold">Helvetica-Bold</option>
                        <option value="Times-Roman">Times-Roman</option>
                        <option value="Times-Bold">Times-Bold</option>
                        <option value="Courier">Courier</option>
                        <option value="Courier-Bold">Courier-Bold</option>
                      </select>
                    </div>
                  </label>
                  <label>
                    Taille titre (pt)
                    <div className="input-wrap">
                      <input
                        type="number"
                        min={8}
                        max={72}
                        value={config.typographie?.tailleTitre ?? 24}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            typographie: { ...config.typographie, tailleTitre: parseInt(e.target.value, 10) || 24 },
                          })
                        }
                      />
                    </div>
                  </label>
                  <label>
                    Taille sous-titre (pt)
                    <div className="input-wrap">
                      <input
                        type="number"
                        min={8}
                        max={48}
                        value={config.typographie?.tailleSousTitre ?? 18}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            typographie: { ...config.typographie, tailleSousTitre: parseInt(e.target.value, 10) || 18 },
                          })
                        }
                      />
                    </div>
                  </label>
                  <label>
                    Taille corps (pt)
                    <div className="input-wrap">
                      <input
                        type="number"
                        min={8}
                        max={24}
                        value={config.typographie?.tailleCorps ?? 12}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            typographie: { ...config.typographie, tailleCorps: parseInt(e.target.value, 10) || 12 },
                          })
                        }
                      />
                    </div>
                  </label>
                  <label>
                    Exemple titre
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
                    Exemple sous-titre
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
                    Exemple description
                    <div className="input-wrap">
                      <textarea
                        rows={2}
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
                  <div className="palette-grid palette-grid-5">
                    {[
                      { key: 'clair', label: 'Clair (fond)', default: '#f5f5dc', fallback: ['fond', 'blanc'] },
                      { key: 'sombre', label: 'Sombre (texte)', default: '#1a1a1a', fallback: ['texte', 'noir'] },
                      { key: 'primaire', label: 'Principale', default: '#2563eb', fallback: [] },
                      { key: 'secondaire', label: 'Secondaire', default: '#64748b', fallback: [] },
                      { key: 'accent', label: 'Tertiaire', default: '#f59e0b', fallback: [] },
                    ].map(({ key, label, default: def, fallback }) => {
                      const value = config.couleurs?.[key] ?? fallback.map((f) => config.couleurs?.[f]).find(Boolean) ?? def;
                      return (
                      <div key={key} className="palette-item">
                        <label className="palette-swatch-wrap">
                          <span
                            className={`palette-preview ${key === 'clair' ? 'palette-preview-light' : ''}`}
                            style={{ backgroundColor: value }}
                          />
                          <input
                            type="color"
                            value={value}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                couleurs: { ...config.couleurs, [key]: e.target.value },
                              })
                            }
                            className="palette-swatch-input"
                          />
                        </label>
                        <span className="palette-label">{label}</span>
                        <input
                          type="text"
                          value={config.couleurs?.[key] ?? (fallback.map((f) => config.couleurs?.[f]).find(Boolean) ?? '')}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              couleurs: { ...config.couleurs, [key]: e.target.value },
                            })
                          }
                          className="color-hex"
                          placeholder={def}
                        />
                      </div>
                    );
                    })}
                  </div>
                </fieldset>
                </div>
                <div className="config-form-footer">
                  <button className="btn btn-primary" onClick={saveConfig}>
                    Enregistrer la configuration
                  </button>
                </div>
              </div>
            )}
        </section>

        <section className="panel">
            <h2>Dossier Sortie</h2>
            <p className="hint">PDFs générés à partir de l'entrée et de la configuration.</p>
            <div className="output-actions">
              <button
                className="btn btn-primary btn-large"
                onClick={generatePdf}
                disabled={generating}
                title="Générer le PDF"
              >
                <svg className="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                {generating ? 'Génération…' : 'Générer le PDF'}
              </button>
              <button
                className="btn btn-secondary btn-icon-only"
                onClick={() => refetchOutput()}
                title="Rafraîchir la liste"
              >
                <svg className="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              </button>
            </div>
            <ul className="file-list">
              {(outputFiles || []).map((f) => (
                <li key={f.name}>
                  <a href={`${API}/output/files/${encodeURIComponent(f.name)}`} target="_blank" rel="noreferrer">
                    {f.name}
                  </a>
                  <span className="size">{formatSize(f.size)}</span>
                  <button
                    className="btn-icon"
                    onClick={() => deleteOutputFile(f.name)}
                    title="Supprimer (déplacer dans la corbeille)"
                  >
                    🗑
                  </button>
                </li>
              ))}
            </ul>
            {(!outputFiles || outputFiles.length === 0) && (
              <p className="empty">Aucun PDF. Cliquez sur "Générer le PDF" pour en créer un.</p>
            )}
        </section>

        <section className="panel panel-trash">
            <h2>Corbeille</h2>
            <p className="hint">PDFs supprimés. Restaurez ou supprimez définitivement.</p>
            <div className="output-actions">
              <button
                className="btn btn-secondary btn-icon-only"
                onClick={() => refetchTrash()}
                title="Rafraîchir la liste"
              >
                <svg className="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              </button>
            </div>
            <ul className="file-list">
              {(trashFiles || []).map((f) => (
                <li key={f.name}>
                  <a href={`${API}/output/trash/files/${encodeURIComponent(f.name)}`} target="_blank" rel="noreferrer">
                    {f.name}
                  </a>
                  <span className="size">{formatSize(f.size)}</span>
                  <button
                    className="btn-icon btn-icon-restore"
                    onClick={() => restoreTrashFile(f.name)}
                    title="Restaurer"
                  >
                    ↩
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => permanentlyDeleteTrashFile(f.name)}
                    title="Supprimer définitivement"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            {(!trashFiles || trashFiles.length === 0) && (
              <p className="empty">Corbeille vide.</p>
            )}
        </section>
      </main>
    </div>
  );
}

export default App;
