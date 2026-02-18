import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [showTrash, setShowTrash] = useState(false);
  const [showAllOutput, setShowAllOutput] = useState(false);

  const { data: inputFiles, refetch: refetchInput } = useApi('/input/files');
  const { data: outputFiles, refetch: refetchOutput } = useApi('/output/files');
  const { data: trashFiles, refetch: refetchTrash } = useApi('/output/trash/files');
  const { data: confData, refetch: refetchConf } = useApi('/conf');

  useEffect(() => {
    if (confData) setConfig(confData);
  }, [confData]);

  const isFirstConfig = useRef(true);
  useEffect(() => {
    if (!config) return;
    if (isFirstConfig.current) {
      isFirstConfig.current = false;
      return;
    }
    const timer = setTimeout(async () => {
      try {
        await fetch(`${API}/conf`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config),
        });
      } catch (e) {
        setMessage({ type: 'error', text: e.message });
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [config]);

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

  const getLogoByType = (type) => {
    const files = inputFiles || [];
    return files.find((f) => f.name.startsWith(`logo-${type}-`));
  };

  const uploadLogo = async (type, file) => {
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    try {
      await fetch(`${API}/input/upload/logo/${type}`, { method: 'POST', body: form });
      refetchInput();
      setMessage({ type: 'success', text: `Logo ${type} ajouté` });
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const LogoDropZone = ({ type, label, bgColor, isDark }) => {
    const [dragOver, setDragOver] = useState(false);
    const logo = getLogoByType(type);
    const fileInputRef = useRef(null);

    const handleDrop = (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer?.files?.[0];
      if (file?.type?.startsWith('image/')) uploadLogo(type, file);
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      setDragOver(true);
    };

    const handleDragLeave = () => setDragOver(false);

    const handleFileChange = (e) => {
      const file = e.target.files?.[0];
      if (file) uploadLogo(type, file);
      e.target.value = '';
    };

    return (
      <div
        className={`logo-drop-zone ${dragOver ? 'logo-drop-zone-active' : ''} ${isDark ? 'logo-drop-zone-dark' : ''}`}
        style={{ backgroundColor: bgColor }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="logo-drop-input"
        />
        {logo ? (
          <>
            <img
              src={`${API}/input/files/${encodeURIComponent(logo.name)}`}
              alt={label}
              className="logo-preview"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              className="logo-remove-btn"
              onClick={(e) => { e.stopPropagation(); deleteInputFile(logo.name); }}
              title="Supprimer"
            >
              ✕
            </button>
          </>
        ) : (
          <span className="logo-drop-placeholder">
            {dragOver ? 'Déposez ici' : 'Glissez ou cliquez'}
          </span>
        )}
        <span className="logo-drop-label">{label}</span>
      </div>
    );
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

  const parseColorInput = (str) => {
    const s = (str || '').trim();
    const hex6 = s.replace(/^#/, '').match(/^([0-9a-fA-F]{6})$/);
    if (hex6) return `#${hex6[1].toLowerCase()}`;
    const hex3 = s.replace(/^#/, '').match(/^([0-9a-fA-F]{3})$/);
    if (hex3) return `#${hex3[1].replace(/(.)/g, '$1$1').toLowerCase()}`;
    const rgbMatch = s.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (rgbMatch) {
      const r = Math.min(255, Math.max(0, parseInt(rgbMatch[1], 10)));
      const g = Math.min(255, Math.max(0, parseInt(rgbMatch[2], 10)));
      const b = Math.min(255, Math.max(0, parseInt(rgbMatch[3], 10)));
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    return null;
  };

  const handleHexChange = (key, inputValue) => {
    const hex = parseColorInput(inputValue);
    setConfig({
      ...config,
      couleurs: { ...config.couleurs, [key]: hex || inputValue },
    });
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-brand">
          <img src="/qwebty-logo.png" alt="Qwebty" className="qwebty-logo" />
          <div>
            <h1>Charte Graphique Generator</h1>
            <p>data/input → data/output • data/trash • data/conf</p>
          </div>
        </div>
        <a href="http://www.qwebty.com" target="_blank" rel="noreferrer" className="qwebty-link">
          www.qwebty.com
        </a>
      </header>

      {message && (
        <div className={`toast toast-${message.type}`}>{message.text}</div>
      )}

      <main className="page-all">
        <div className="folders-grid">
        <section className="panel">
            <h2>Dossier Entrée</h2>
            <p className="hint">
              Autres images pour la charte (éléments graphiques, etc.)
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
              <button
                className={`btn btn-secondary btn-icon-only ${showTrash ? 'btn-active' : ''}`}
                onClick={() => setShowTrash((v) => !v)}
                title={showTrash ? 'Masquer la corbeille' : 'Afficher la corbeille'}
              >
                <svg className="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
            </div>
            <ul className="file-list file-list-output">
              {((outputFiles || []).slice(0, showAllOutput ? undefined : 3)).map((f) => (
                <li key={f.name}>
                  <button
                    className="btn-icon btn-icon-preview"
                    onClick={() => window.open(`${API}/output/files/${encodeURIComponent(f.name)}`, '_blank', 'noopener,noreferrer')}
                    title="Aperçu (ouvrir le PDF)"
                  >
                    <svg className="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  <span className="file-name">{f.name}</span>
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
            {(outputFiles?.length ?? 0) > 3 && (
              <button
                className="btn btn-secondary btn-show-more"
                onClick={() => setShowAllOutput((v) => !v)}
              >
                {showAllOutput ? 'Voir moins' : `Voir plus (${outputFiles.length - 3} autre${outputFiles.length - 3 > 1 ? 's' : ''})`}
              </button>
            )}
            {(!outputFiles || outputFiles.length === 0) && (
              <p className="empty">Aucun PDF. Cliquez sur "Générer le PDF" pour en créer un.</p>
            )}
        </section>
        </div>

        <section className="panel">
            <h2>Configuration (conf)</h2>
            <p className="hint">
              Les modifications sont appliquées en temps réel. Importez/exportez pour réutiliser une config.
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
                  <p className="hint" style={{ marginTop: '-0.5rem', marginBottom: '0.75rem' }}>
                    Sélecteur RGB ou saisie hex (#ff0000) / RGB (rgb(255,0,0))
                  </p>
                  <div className="palette-grid palette-grid-4">
                    {[
                      { key: 'clair', label: 'Clair (fond)', default: '#ffffff', fallback: ['fond', 'blanc'] },
                      { key: 'sombre', label: 'Sombre (texte)', default: '#1a1a1a', fallback: ['texte', 'noir'] },
                      { key: 'primaire', label: 'Principale', default: '#2563eb', fallback: [] },
                      { key: 'secondaire', label: 'Secondaire', default: '#64748b', fallback: [] },
                    ].map(({ key, label, default: def, fallback }) => {
                      const rawValue = config.couleurs?.[key] ?? fallback.map((f) => config.couleurs?.[f]).find(Boolean) ?? '';
                      const displayValue = rawValue || def;
                      const isValidHex = /^#[0-9a-fA-F]{6}$|^#[0-9a-fA-F]{3}$/.test(displayValue);
                      const pickerValue = isValidHex ? displayValue : def;
                      return (
                      <div key={key} className="palette-item">
                        <label className="palette-swatch-wrap">
                          <span
                            className={`palette-preview ${key === 'clair' ? 'palette-preview-light' : ''}`}
                            style={{ backgroundColor: isValidHex ? displayValue : def }}
                          />
                          <input
                            type="color"
                            value={pickerValue}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                couleurs: { ...config.couleurs, [key]: e.target.value },
                              })
                            }
                            className="palette-swatch-input"
                            title="Sélecteur de couleur"
                          />
                        </label>
                        <span className="palette-label">{label}</span>
                        <input
                          type="text"
                          value={rawValue}
                          onChange={(e) => handleHexChange(key, e.target.value)}
                          className="color-hex"
                          placeholder={def}
                          title="Code hexadécimal (ex: #ff0000 ou ff0000)"
                        />
                      </div>
                    );
                    })}
                  </div>
                </fieldset>
                <fieldset>
                  <legend>Logos</legend>
                  <p className="hint" style={{ marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
                    Glissez-déposez ou cliquez pour ajouter un logo sur chaque fond.
                  </p>
                  <div className="logo-zones-grid">
                    <LogoDropZone
                      type="clair"
                      label="Logo sur fond clair"
                      bgColor={config?.couleurs?.clair || config?.couleurs?.fond || '#ffffff'}
                    />
                    <LogoDropZone
                      type="sombre"
                      label="Logo sur fond sombre"
                      bgColor={config?.couleurs?.sombre || config?.couleurs?.texte || '#1a1a1a'}
                      isDark
                    />
                    <LogoDropZone
                      type="primaire"
                      label="Logo sur couleur principale"
                      bgColor={config?.couleurs?.primaire || '#2563eb'}
                    />
                    <LogoDropZone
                      type="secondaire"
                      label="Logo sur couleur secondaire"
                      bgColor={config?.couleurs?.secondaire || '#64748b'}
                    />
                  </div>
                </fieldset>
                </div>
              </div>
            )}
        </section>

        {showTrash && (
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
        )}
      </main>
      <footer className="app-footer">
        <img src="/qwebty-logo.png" alt="Qwebty" className="qwebty-logo-footer" />
        <span className="app-footer-brand">Qwebty</span>
        <a href="http://www.qwebty.com" target="_blank" rel="noreferrer">www.qwebty.com</a>
        <span className="app-footer-tagline">Document généré par Qwebty</span>
      </footer>
    </div>
  );
}

export default App;
