import { useRef } from 'react';
import { FontSelect } from '../../FontSelect';
import { LogoDropZone } from '../logos/LogoDropZone';
import { Modal } from '../ui/Modal';
import { useModalKeyboard } from '../../hooks/useModalKeyboard';
import { apiFetch } from '../../services/api';
import { parseColorInput } from '@shared/parseColorInput.js';
import { normalizeFontName } from '@shared/normalizeFontName.js';

const SECTION_LABELS = {
  marque: 'Présentation de la marque',
  logo: 'Logos',
  couleurs: 'Palette de couleurs',
  typographie: 'Typographie',
  kitUi: 'Kit UI',
  elementsGraphiques: 'Éléments graphiques',
  aboutQwebty: 'À propos de Qwebty',
};

export function ConfigPanel({
  displayConfig,
  setConfig,
  confLoading,
  confError,
  refetchConf,
  customFonts,
  refetchFonts,
  inputFiles,
  refetchInput,
  history,
  refetchHistory,
  templates,
  projects,
  refetchProjects,
  saveStatus,
  onMessage,
  showConfirmReset,
  setShowConfirmReset,
}) {
  const fontInputRef = useRef(null);
  const newProjectRef = useRef(null);

  const resetConfig = async () => {
    setShowConfirmReset(false);
    try {
      await apiFetch('/conf/reset', { method: 'POST' });
      await refetchConf();
      await refetchInput();
      onMessage({ type: 'success', text: 'Configuration, logos et dossier entrée réinitialisés' });
    } catch (e) {
      onMessage({ type: 'error', text: e.message });
    }
  };

  useModalKeyboard(showConfirmReset, {
    onClose: () => setShowConfirmReset(false),
    onConfirm: resetConfig,
  });

  const importConfig = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const isZip = file.name.toLowerCase().endsWith('.zip');
      if (isZip) {
        const formData = new FormData();
        formData.append('file', file);
        await apiFetch('/conf/import/full', { method: 'POST', body: formData });
        await refetchConf();
        await refetchInput();
        await refetchFonts();
        onMessage({ type: 'success', text: 'Configuration complète importée (config, images, polices)' });
      } else {
        const text = await file.text();
        const parsed = JSON.parse(text);
        await apiFetch('/conf/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ config: parsed }),
        });
        await refetchConf();
        onMessage({ type: 'success', text: 'Configuration importée (texte uniquement)' });
      }
    } catch (err) {
      onMessage({ type: 'error', text: err.message || 'Import échoué' });
    }
    e.target.value = '';
  };

  const exportConfig = async () => {
    try {
      const res = await apiFetch('/conf/export/full');
      const disposition = res.headers.get('Content-Disposition');
      const filename = disposition?.match(/filename="?([^";]+)"?/)?.[1] || 'conf-charte-graphique-sans-ref.zip';
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      onMessage({ type: 'success', text: 'Configuration complète exportée (config, images, polices)' });
    } catch (e) {
      onMessage({ type: 'error', text: e.message });
    }
  };

  const exportFigmaTokens = async () => {
    try {
      const res = await apiFetch('/conf/export/figma-tokens');
      const disposition = res.headers.get('Content-Disposition');
      const filename = disposition?.match(/filename="?([^";]+)"?/)?.[1] || 'figma-tokens.json';
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      onMessage({ type: 'success', text: 'Tokens Figma exportés' });
    } catch (e) {
      onMessage({ type: 'error', text: e.message });
    }
  };

  const getLogoByType = (type) => {
    return (inputFiles || []).find((f) => f.name.startsWith(`logo-${type}-`));
  };

  const uploadLogo = async (type, file) => {
    const form = new FormData();
    form.append('file', file);
    await apiFetch(`/input/upload/logo/${type}`, { method: 'POST', body: form });
    await refetchInput();
    onMessage({ type: 'success', text: `Logo ${type} ajouté` });
  };

  const deleteInputFile = async (name) => {
    await apiFetch(`/input/files/${encodeURIComponent(name)}`, { method: 'DELETE' });
    await refetchInput();
  };

  const handleHexChange = (key, inputValue) => {
    const hex = parseColorInput(inputValue);
    if (!displayConfig) return;
    setConfig({
      ...displayConfig,
      couleurs: { ...displayConfig.couleurs, [key]: hex || inputValue },
    });
  };

  const uploadFont = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const baseName = file.name.replace(/\.[^.]+$/, '');
    const incomingNorm = normalizeFontName(baseName);
    const existing = (customFonts || []).some(
      (f) => normalizeFontName(f.label || f.id) === incomingNorm
    );
    if (existing) {
      onMessage({ type: 'error', text: 'Une police avec ce nom existe déjà' });
      return;
    }
    const form = new FormData();
    form.append('font', file);
    try {
      await apiFetch('/fonts/upload', { method: 'POST', body: form });
      await refetchFonts();
      onMessage({ type: 'success', text: 'Police ajoutée' });
    } catch (err) {
      onMessage({ type: 'error', text: err.message });
    }
  };

  const deleteFont = async (filename) => {
    try {
      await apiFetch(`/fonts/${encodeURIComponent(filename)}`, { method: 'DELETE' });
      await refetchFonts();
      onMessage({ type: 'success', text: 'Police supprimée' });
    } catch (err) {
      onMessage({ type: 'error', text: err.message });
    }
  };

  const applyTemplate = async (id) => {
    try {
      const conf = await apiFetch(`/conf/templates/${id}/apply`, { method: 'POST' });
      setConfig(conf);
      await refetchConf();
      onMessage({ type: 'success', text: 'Template appliqué' });
    } catch (e) {
      onMessage({ type: 'error', text: e.message });
    }
  };

  const restoreHistory = async (id) => {
    try {
      const conf = await apiFetch(`/conf/history/${id}/restore`, { method: 'POST' });
      setConfig(conf);
      await refetchConf();
      await refetchHistory();
      onMessage({ type: 'success', text: 'Version restaurée' });
    } catch (e) {
      onMessage({ type: 'error', text: e.message });
    }
  };

  const createProject = async () => {
    const ref = newProjectRef.current?.value?.trim();
    if (!ref) return;
    try {
      await apiFetch('/conf/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref, duplicateFrom: projects?.find((p) => p.active)?.ref }),
      });
      await refetchProjects();
      if (newProjectRef.current) newProjectRef.current.value = '';
      onMessage({ type: 'success', text: `Projet « ${ref} » créé` });
    } catch (e) {
      onMessage({ type: 'error', text: e.message });
    }
  };

  const switchProject = async (ref) => {
    try {
      const conf = await apiFetch(`/conf/projects/${encodeURIComponent(ref)}/activate`, { method: 'POST' });
      setConfig(conf);
      await refetchConf();
      await refetchProjects();
      onMessage({ type: 'success', text: `Projet « ${ref} » activé` });
    } catch (e) {
      onMessage({ type: 'error', text: e.message });
    }
  };

  const toggleSection = (key) => {
    if (!displayConfig) return;
    const currentlyEnabled = displayConfig.sections?.[key] !== false;
    setConfig({
      ...displayConfig,
      sections: {
        ...displayConfig.sections,
        [key]: !currentlyEnabled,
      },
    });
  };

  const updateField = (section, field, value) => {
    if (!displayConfig) return;
    setConfig({
      ...displayConfig,
      [section]: { ...displayConfig[section], [field]: value },
    });
  };

  return (
    <>
      <section className="panel">
        <div className="config-header-row">
          <h2>Configuration (conf)</h2>
          {saveStatus && (
            <span className={`save-status save-status-${saveStatus}`} aria-live="polite">
              {saveStatus === 'saving' && 'Enregistrement…'}
              {saveStatus === 'saved' && 'Enregistré'}
              {saveStatus === 'error' && 'Erreur de sauvegarde'}
            </span>
          )}
        </div>
        <p className="hint">
          Les modifications sont appliquées en temps réel. Exportez tout (config + images + polices) ou importez un .zip ou .json.
        </p>
        <div className="config-actions">
          <label className="btn btn-secondary btn-icon-only" title="Importer config (.zip ou .json)">
            <input type="file" accept=".zip,.json" onChange={importConfig} hidden />
            <svg className="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </label>
          <button type="button" className="btn btn-secondary btn-icon-only" onClick={exportConfig} title="Exporter tout (config, images, polices)" aria-label="Exporter tout">
            <svg className="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
          <button type="button" className="btn btn-secondary" onClick={exportFigmaTokens} title="Exporter tokens Figma">
            Tokens Figma
          </button>
          <button type="button" className="btn btn-secondary btn-icon-only" onClick={() => setShowConfirmReset(true)} title="Réinitialiser la configuration" aria-label="Réinitialiser">
            <svg className="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
        </div>

        {templates?.length > 0 && (
          <div className="templates-row">
            <span className="templates-label">Templates :</span>
            {templates.map((t) => (
              <button key={t.id} type="button" className="btn btn-secondary btn-sm" onClick={() => applyTemplate(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        {projects?.length > 0 && (
          <div className="projects-row">
            <label>
              Projet actif
              <select
                value={projects.find((p) => p.active)?.ref || 'default'}
                onChange={(e) => switchProject(e.target.value)}
                className="project-select"
              >
                {projects.map((p) => (
                  <option key={p.ref} value={p.ref}>{p.projetNom} ({p.ref})</option>
                ))}
              </select>
            </label>
            <div className="project-create">
              <input type="text" ref={newProjectRef} placeholder="Nouveau projet (réf.)" className="project-input" />
              <button type="button" className="btn btn-secondary btn-sm" onClick={createProject}>Créer</button>
            </div>
          </div>
        )}

        {confLoading && !displayConfig && (
          <p className="empty">Chargement de la configuration…</p>
        )}
        {confError && !displayConfig && (
          <p className="empty error-text">
            Erreur : {confError}. <button type="button" className="btn btn-secondary" onClick={() => refetchConf()}>Réessayer</button>
          </p>
        )}
        {displayConfig && (
          <div className="config-form">
            <div className="config-fields-grid">
              <fieldset>
                <legend>Projet</legend>
                <label>
                  Nom du projet
                  <div className="input-wrap">
                    <input type="text" placeholder="Ex: Mon entreprise" value={displayConfig.projet?.nom || ''} onChange={(e) => updateField('projet', 'nom', e.target.value)} />
                  </div>
                </label>
                <label>
                  Présentation
                  <div className="input-wrap">
                    <input type="text" placeholder="Ex: Charte graphique 2025" value={displayConfig.projet?.description || ''} onChange={(e) => updateField('projet', 'description', e.target.value)} />
                  </div>
                </label>
                <label>
                  Auteur
                  <div className="input-wrap">
                    <input type="text" placeholder="Ex: Jean Dupont" value={displayConfig.projet?.auteur || ''} onChange={(e) => updateField('projet', 'auteur', e.target.value)} />
                  </div>
                </label>
                <label>
                  Référence unique
                  <div className="input-wrap">
                    <input type="text" placeholder="Ex: CHG-2025-001" value={displayConfig.projet?.reference || ''} onChange={(e) => updateField('projet', 'reference', e.target.value)} />
                  </div>
                </label>
                <label>
                  Date
                  <div className="input-wrap">
                    <input type="date" value={displayConfig.projet?.date || ''} onChange={(e) => updateField('projet', 'date', e.target.value)} />
                  </div>
                </label>
              </fieldset>

              <fieldset>
                <legend>Présentation de la marque</legend>
                {['slogan', 'valeurs', 'personnalite'].map((field) => (
                  <label key={field}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                    <div className="input-wrap">
                      <input type="text" value={displayConfig.marque?.[field] || ''} onChange={(e) => updateField('marque', field, e.target.value)} />
                    </div>
                  </label>
                ))}
                <label>
                  Mission
                  <div className="input-wrap">
                    <textarea rows={1} value={displayConfig.marque?.mission || ''} onChange={(e) => updateField('marque', 'mission', e.target.value)} className="config-textarea" />
                  </div>
                </label>
                <label>
                  Recherche
                  <div className="input-wrap">
                    <textarea rows={3} placeholder="Présentez vos recherches..." value={displayConfig.marque?.recherche || ''} onChange={(e) => updateField('marque', 'recherche', e.target.value)} className="config-textarea" />
                  </div>
                </label>
              </fieldset>

              <fieldset>
                <legend>Typographie</legend>
                <p className="hint field-hint">Police principale, secondaire et tertiaire.</p>
                {[
                  { key: 'principale', label: 'Police principale', def: 'Helvetica' },
                  { key: 'secondaire', label: 'Police secondaire', def: 'Times-Roman' },
                  { key: 'tertiaire', label: 'Police tertiaire', def: 'Courier' },
                ].map(({ key, label, def }) => (
                  <label key={key}>
                    {label}
                    <div className="input-wrap">
                      <FontSelect
                        value={displayConfig.typographie?.[key] || def}
                        onChange={(v) => updateField('typographie', key, v)}
                        customFonts={customFonts}
                      />
                    </div>
                  </label>
                ))}
                <label>
                  Ajouter une police
                  <div className="input-wrap">
                    <input ref={fontInputRef} type="file" accept=".ttf,.otf,.woff" onChange={uploadFont} className="font-upload-input-hidden" />
                    <button type="button" className="btn btn-secondary" onClick={() => fontInputRef.current?.click()}>
                      Parcourir (.ttf, .otf, .woff)
                    </button>
                  </div>
                </label>
                {(customFonts?.length ?? 0) > 0 && (
                  <ul className="font-list">
                    {customFonts.map((f) => (
                      <li key={f.id}>
                        <span>{f.label}</span>
                        <button type="button" className="btn-icon" onClick={() => deleteFont(f.filename)} aria-label={`Supprimer ${f.label}`}>✕</button>
                      </li>
                    ))}
                  </ul>
                )}
              </fieldset>

              <fieldset>
                <legend>Palette de couleurs</legend>
                <p className="hint field-hint">Sélecteur RGB ou saisie hex / RGB</p>
                <div className="palette-grid palette-grid-4">
                  {[
                    { key: 'clair', label: 'Clair (fond)', default: '#ffffff', fallback: ['fond', 'blanc'] },
                    { key: 'sombre', label: 'Sombre (texte)', default: '#1a1a1a', fallback: ['texte', 'noir'] },
                    { key: 'primaire', label: 'Principale', default: '#2563eb', fallback: [] },
                    { key: 'secondaire', label: 'Secondaire', default: '#64748b', fallback: [] },
                  ].map(({ key, label, default: def, fallback }) => {
                    const rawValue = displayConfig.couleurs?.[key] ?? fallback.map((f) => displayConfig.couleurs?.[f]).find(Boolean) ?? '';
                    const displayValue = rawValue || def;
                    const isValidHex = /^#[0-9a-fA-F]{6}$|^#[0-9a-fA-F]{3}$/.test(displayValue);
                    const pickerValue = isValidHex ? displayValue : def;
                    return (
                      <div key={key} className="palette-item">
                        <label className="palette-swatch-wrap">
                          <span className={`palette-preview ${key === 'clair' ? 'palette-preview-light' : ''}`} style={{ backgroundColor: isValidHex ? displayValue : def }} />
                          <input type="color" value={pickerValue} onChange={(e) => updateField('couleurs', key, e.target.value)} className="palette-swatch-input" title="Sélecteur de couleur" />
                        </label>
                        <span className="palette-label">{label}</span>
                        <input type="text" value={rawValue} onChange={(e) => handleHexChange(key, e.target.value)} className="color-hex" placeholder={def} />
                      </div>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset>
                <legend>Logos</legend>
                <p className="hint field-hint">Glissez-déposez ou cliquez pour ajouter un logo sur chaque fond.</p>
                <div className="logo-zones-grid">
                  <LogoDropZone type="clair" label="Logo sur fond clair" bgColor={displayConfig.couleurs?.clair || '#ffffff'} logo={getLogoByType('clair')} onUpload={uploadLogo} onDelete={deleteInputFile} />
                  <LogoDropZone type="sombre" label="Logo sur fond sombre" bgColor={displayConfig.couleurs?.sombre || '#1a1a1a'} isDark logo={getLogoByType('sombre')} onUpload={uploadLogo} onDelete={deleteInputFile} />
                  <LogoDropZone type="primaire" label="Logo sur couleur principale" bgColor={displayConfig.couleurs?.primaire || '#2563eb'} logo={getLogoByType('primaire')} onUpload={uploadLogo} onDelete={deleteInputFile} />
                  <LogoDropZone type="secondaire" label="Logo sur couleur secondaire" bgColor={displayConfig.couleurs?.secondaire || '#64748b'} logo={getLogoByType('secondaire')} onUpload={uploadLogo} onDelete={deleteInputFile} />
                </div>
              </fieldset>

              <fieldset>
                <legend>Sections du PDF</legend>
                <p className="hint field-hint">Activez ou désactivez les pages incluses dans le PDF généré.</p>
                <div className="sections-toggles">
                  {Object.entries(SECTION_LABELS).map(([key, label]) => (
                    <label key={key} className="section-toggle">
                      <input
                        type="checkbox"
                        checked={displayConfig.sections?.[key] !== false}
                        onChange={() => toggleSection(key)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>

              {history?.length > 0 && (
                <fieldset>
                  <legend>Historique des versions</legend>
                  <ul className="history-list">
                    {history.slice(0, 5).map((h) => (
                      <li key={h.id}>
                        <span>{h.projetNom || h.id}</span>
                        <span className="size">{new Date(h.modified).toLocaleString('fr-FR')}</span>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => restoreHistory(h.id)}>Restaurer</button>
                      </li>
                    ))}
                  </ul>
                </fieldset>
              )}
            </div>
          </div>
        )}
      </section>

      <Modal
        isOpen={showConfirmReset}
        title="Réinitialiser la configuration ?"
        onClose={() => setShowConfirmReset(false)}
        actions={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmReset(false)}>Annuler</button>
            <button type="button" className="btn btn-primary btn-danger" onClick={resetConfig}>Réinitialiser</button>
          </>
        }
      >
        <p>
          Tous les paramètres seront remis aux valeurs par défaut. Le dossier entrée sera vidé. Les polices ne sont pas modifiées.
        </p>
      </Modal>
    </>
  );
}
