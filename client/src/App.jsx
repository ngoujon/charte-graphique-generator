import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useBootstrap } from './hooks/useBootstrap';
import { useApi } from './hooks/useApi';
import { useTheme } from './hooks/useTheme';
import { useFontFaces } from './hooks/useFontFaces';
import { usePreview } from './hooks/usePreview';
import { apiFetch, postJson, downloadResponse, downloadUrl, API, filterGeneralInputFiles } from './services/api';
import { normalizeFontName } from '@shared/normalizeFontName.js';
import { Toast } from './components/ui/Toast';
import { Icon } from './components/ui/Icon';
import { Menu } from './components/ui/Menu';
import { PreviewPanel } from './components/PreviewPanel';
import { FilesModal } from './components/FilesModal';
import { NewProjectModal, HistoryModal, ConfirmModal } from './components/ProjectModals';
import { ProjectStep } from './components/steps/ProjectStep';
import { BrandStep } from './components/steps/BrandStep';
import { LogosStep } from './components/steps/LogosStep';
import { ColorsStep } from './components/steps/ColorsStep';
import { TypographyStep } from './components/steps/TypographyStep';
import { ImagesStep } from './components/steps/ImagesStep';
import { PagesStep } from './components/steps/PagesStep';
import './App.css';

const STEPS = [
  { id: 'projet', label: 'Projet', icon: 'project', page: 'cover' },
  { id: 'marque', label: 'Identité', icon: 'sparkle', page: 'marque' },
  { id: 'logos', label: 'Logo', icon: 'logo', page: 'logo' },
  { id: 'couleurs', label: 'Couleurs', icon: 'palette', page: 'couleurs' },
  { id: 'typo', label: 'Typographie', icon: 'type', page: 'typographie' },
  { id: 'images', label: 'Images', icon: 'image', page: 'elementsGraphiques' },
  { id: 'pages', label: 'Pages', icon: 'pages', page: 'toc' },
];

const LOGO_TYPES = ['clair', 'sombre', 'primaire', 'secondaire'];

function slugify(value) {
  return (
    String(value || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()
      .slice(0, 40) || 'charte'
  );
}

function App() {
  const [config, setConfig] = useState(null);
  const [message, setMessage] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [step, setStep] = useState(() => {
    try {
      return localStorage.getItem('charte-step') || 'projet';
    } catch {
      return 'projet';
    }
  });
  const [generating, setGenerating] = useState(false);
  const [modal, setModal] = useState(null); // files | history | new-project | reset
  const { theme, toggleTheme } = useTheme();
  const importRef = useRef(null);

  const boot = useBootstrap();
  const { inputFiles, outputFiles, trashFiles, customFonts, refetch: refetchBootstrap } = boot;
  const { data: history, refetch: refetchHistory } = useApi('/conf/history');
  const { data: templates } = useApi('/conf/templates');
  const { data: projects, refetch: refetchProjects } = useApi('/conf/projects');

  useFontFaces(customFonts);

  useEffect(() => {
    if (boot.config && !config) setConfig(boot.config);
  }, [boot.config, config]);

  useEffect(() => {
    document.querySelector('.step.is-active')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    try {
      localStorage.setItem('charte-step', step);
    } catch {
      /* préférence non mémorisée */
    }
  }, [step]);

  // Notifications
  useEffect(() => {
    if (!message) return undefined;
    const t = setTimeout(() => setMessage(null), message.type === 'error' ? 6000 : message.action ? 8000 : 3500);
    return () => clearTimeout(t);
  }, [message]);
  const notify = useCallback((msg) => setMessage(msg), []);

  // Sauvegarde automatique (anti-rebond)
  const skipNextSave = useRef(true);
  const saveConfig = useCallback(async (conf) => {
    setSaveStatus('saving');
    try {
      await postJson('/conf', conf);
      setSaveStatus('saved');
    } catch (e) {
      setSaveStatus('error');
      notify({ type: 'error', text: `Sauvegarde impossible : ${e.message}` });
      throw e;
    }
  }, [notify]);

  useEffect(() => {
    if (!config) return undefined;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return undefined;
    }
    setSaveStatus('pending');
    const timer = setTimeout(() => {
      saveConfig(config).catch(() => {});
    }, 700);
    return () => clearTimeout(timer);
  }, [config, saveConfig]);

  /** Force l'enregistrement immédiat (avant génération, Ctrl+S…). */
  const flushSave = useCallback(async () => {
    if (config) await saveConfig(config);
  }, [config, saveConfig]);

  /** Remplace la config sans déclencher de sauvegarde (elle vient du serveur). */
  const loadConfig = useCallback((conf) => {
    skipNextSave.current = true;
    setConfig(conf);
    setSaveStatus('saved');
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        flushSave().then(() => notify({ type: 'success', text: 'Charte enregistrée' })).catch(() => {});
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flushSave, notify]);

  // Mises à jour de la configuration
  const update = useCallback((section, field, value) => {
    setConfig((c) => (c ? { ...c, [section]: { ...c[section], [field]: value } } : c));
  }, []);
  const setSection = useCallback((key, on) => update('sections', key, on), [update]);

  // Fichiers d'entrée
  const logos = useMemo(() => {
    const map = {};
    for (const type of LOGO_TYPES) map[type] = (inputFiles || []).find((f) => f.name.startsWith(`logo-${type}-`)) || null;
    return map;
  }, [inputFiles]);
  const images = useMemo(() => filterGeneralInputFiles(inputFiles), [inputFiles]);
  const inputKey = useMemo(
    () => (inputFiles || []).map((f) => `${f.name}:${f.modified}`).join('|') + (customFonts || []).map((f) => f.id).join('|'),
    [inputFiles, customFonts]
  );

  const preview = usePreview(config, inputKey);
  const currentStep = STEPS.find((s) => s.id === step) || STEPS[0];
  const previewPage = preview.pageMap?.[currentStep.page] || (currentStep.page === 'cover' ? 1 : currentStep.page === 'toc' ? 2 : 1);

  const guard = (fn, success) => async (...args) => {
    try {
      const out = await fn(...args);
      if (success) notify({ type: 'success', text: typeof success === 'function' ? success(...args) : success });
      return out;
    } catch (e) {
      notify({ type: 'error', text: e.message });
      return undefined;
    }
  };

  const uploadLogo = guard(async (type, file) => {
    const form = new FormData();
    form.append('file', file);
    await apiFetch(`/input/upload/logo/${type}`, { method: 'POST', body: form });
    await refetchBootstrap();
  }, 'Logo ajouté');

  const deleteInput = guard(async (name) => {
    await apiFetch(`/input/files/${encodeURIComponent(name)}`, { method: 'DELETE' });
    await refetchBootstrap();
  });

  const uploadImages = guard(async (files) => {
    const form = new FormData();
    for (const f of files) form.append('files', f);
    await apiFetch('/input/upload', { method: 'POST', body: form });
    await refetchBootstrap();
  }, (files) => `${files.length} image${files.length > 1 ? 's' : ''} ajoutée${files.length > 1 ? 's' : ''}`);

  const uploadFont = guard(async (file) => {
    const norm = normalizeFontName(file.name.replace(/\.[^.]+$/, ''));
    if ((customFonts || []).some((f) => normalizeFontName(f.label || f.id) === norm)) {
      throw new Error('Une police avec ce nom existe déjà');
    }
    const form = new FormData();
    form.append('font', file);
    await apiFetch('/fonts/upload', { method: 'POST', body: form });
    await refetchBootstrap();
  }, 'Police ajoutée');

  const deleteFont = guard(async (font) => {
    await apiFetch(`/fonts/${encodeURIComponent(font.filename)}`, { method: 'DELETE' });
    await refetchBootstrap();
  }, 'Police supprimée');

  const applyTemplate = (tpl) => {
    setConfig((c) => ({ ...c, couleurs: { ...c.couleurs, ...tpl.couleurs }, typographie: { ...c.typographie, ...tpl.typographie } }));
    notify({ type: 'success', text: `Style « ${tpl.label} » appliqué` });
  };

  const generate = async () => {
    setGenerating(true);
    try {
      await flushSave();
      const { filename } = await apiFetch('/generate', { method: 'POST' });
      await refetchBootstrap();
      downloadUrl(`${API}/output/files/${encodeURIComponent(filename)}`, filename);
      notify({ type: 'success', text: 'PDF créé et téléchargé', action: { label: 'Mes PDF', onClick: () => setModal('files') } });
    } catch (e) {
      notify({ type: 'error', text: e.message });
    } finally {
      setGenerating(false);
    }
  };

  // Projets
  const activeProject = projects?.find((p) => p.active);
  const switchProject = guard(async (ref) => {
    await flushSave();
    const conf = await apiFetch(`/conf/projects/${encodeURIComponent(ref)}/activate`, { method: 'POST' });
    loadConfig(conf);
    await Promise.all([refetchProjects(), refetchBootstrap()]);
  }, 'Charte ouverte');

  const createProject = guard(async ({ nom, blank }) => {
    await flushSave();
    const existing = new Set((projects || []).map((p) => p.ref));
    const base = slugify(nom);
    let ref = base;
    for (let i = 2; existing.has(ref); i++) ref = `${base}-${i}`;
    await postJson('/conf/projects', { ref, nom, blank, duplicateFrom: blank ? undefined : activeProject?.ref });
    const conf = await apiFetch(`/conf/projects/${encodeURIComponent(ref)}/activate`, { method: 'POST' });
    loadConfig(conf);
    await Promise.all([refetchProjects(), refetchBootstrap()]);
    setStep('projet');
  }, ({ nom }) => `Charte « ${nom} » créée`);

  const restoreHistory = guard(async (id) => {
    const conf = await apiFetch(`/conf/history/${id}/restore`, { method: 'POST' });
    loadConfig(conf);
    await refetchHistory();
  }, 'Version restaurée');

  const resetAll = guard(async () => {
    const conf = await apiFetch('/conf/reset', { method: 'POST' });
    loadConfig(conf);
    await refetchBootstrap();
  }, 'Charte réinitialisée');

  const exportZip = guard(async () => downloadResponse(await apiFetch('/conf/export/full'), 'charte.zip'), 'Sauvegarde exportée');
  const exportFigma = guard(async () => downloadResponse(await apiFetch('/conf/export/figma-tokens'), 'figma-tokens.json'), 'Tokens Figma exportés');

  const importFile = guard(async (file) => {
    if (file.name.toLowerCase().endsWith('.zip')) {
      const form = new FormData();
      form.append('file', file);
      await apiFetch('/conf/import/full', { method: 'POST', body: form });
    } else {
      await postJson('/conf/import', { config: JSON.parse(await file.text()) });
    }
    const data = await refetchBootstrap();
    if (data?.config) loadConfig(data.config);
  }, 'Import terminé');

  // Indicateurs d'avancement
  const done = useMemo(() => {
    if (!config) return {};
    const m = config.marque || {};
    const logoCount = LOGO_TYPES.filter((t) => logos[t]).length;
    return {
      projet: !!config.projet?.nom?.trim(),
      marque: ['slogan', 'mission', 'valeurs'].some((k) => String(m[k] || '').trim()),
      logos: logoCount > 0 ? `${logoCount}/4` : false,
      couleurs: true,
      typo: true,
      images: images.length ? String(images.length) : false,
      pages: true,
    };
  }, [config, logos, images]);

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  if (!config) {
    return (
      <div className="boot">
        {boot.error ? (
          <>
            <p>Impossible de charger la charte : {boot.error}</p>
            <button type="button" className="btn btn-primary" onClick={() => refetchBootstrap()}>Réessayer</button>
          </>
        ) : (
          <>
            <div className="spinner" aria-hidden="true" />
            <p>Chargement…</p>
          </>
        )}
      </div>
    );
  }

  const stepProps = { config, update };

  return (
    <div className="app">
      <a href="#editor" className="skip-link">Aller à l’éditeur</a>
      <header className="topbar">
        <div className="brand">
          <img src="/qwebty-logo.png" alt="" className="brand-logo" />
          <div className="brand-text">
            <strong>Charte graphique</strong>
            <span>par Qwebty</span>
          </div>
        </div>

        <div className="project-switch">
          <label htmlFor="project-select" className="visually-hidden">Charte en cours</label>
          <select
            id="project-select"
            className="field-control"
            value={activeProject?.ref || ''}
            onChange={(e) => switchProject(e.target.value)}
          >
            {(projects || []).map((p) => (
              <option key={p.ref} value={p.ref}>{p.active ? config.projet?.nom?.trim() || p.projetNom : p.projetNom}</option>
            ))}
          </select>
          <button type="button" className="btn btn-ghost" onClick={() => setModal('new-project')} title="Nouvelle charte" aria-label="Nouvelle charte">
            <Icon name="plus" size={16} />
            <span className="hide-sm">Nouvelle</span>
          </button>
        </div>

        <div className="topbar-right">
          <span className={`save-pill save-${saveStatus}`} aria-live="polite">
            {saveStatus === 'saved' && <><Icon name="check" size={14} /> Enregistré</>}
            {(saveStatus === 'pending' || saveStatus === 'saving') && 'Enregistrement…'}
            {saveStatus === 'error' && <><Icon name="alert" size={14} /> Non enregistré</>}
          </span>
          <input
            ref={importRef}
            type="file"
            accept=".zip,.json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) importFile(file);
            }}
          />
          <Menu
            label="Plus"
            items={[
              { label: 'Versions précédentes', icon: 'history', onClick: () => { refetchHistory(); setModal('history'); } },
              '-',
              { label: 'Exporter la charte', hint: 'Fichier .zip avec images et polices', icon: 'download', onClick: exportZip },
              { label: 'Importer une charte', hint: '.zip ou .json', icon: 'upload', onClick: () => importRef.current?.click() },
              { label: 'Exporter pour Figma', hint: 'Tokens couleurs et polices', icon: 'figma', onClick: exportFigma },
              '-',
              { label: 'Réinitialiser', icon: 'restore', danger: true, onClick: () => setModal('reset') },
            ]}
          />
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>
        </div>
      </header>

      <main className="workspace">
        <section className="editor" id="editor" aria-label="Éditeur de la charte">
          <nav className="steps" aria-label="Étapes">
            <ol>
              {STEPS.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className={`step ${s.id === step ? 'is-active' : ''}`}
                    aria-current={s.id === step ? 'step' : undefined}
                    onClick={() => setStep(s.id)}
                  >
                    <span className="step-icon">
                      <Icon name={s.icon} size={16} />
                    </span>
                    <span className="step-label">
                      <span className="visually-hidden">Étape {i + 1} : </span>
                      {s.label}
                    </span>
                    {typeof done[s.id] === 'string' ? (
                      <span className="step-badge">{done[s.id]}</span>
                    ) : done[s.id] && s.id !== 'couleurs' && s.id !== 'typo' && s.id !== 'pages' ? (
                      <span className="step-check" aria-label="complété"><Icon name="check" size={12} strokeWidth={3} /></span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <div className="step-panel" key={step}>
            {step === 'projet' && <ProjectStep {...stepProps} />}
            {step === 'marque' && <BrandStep {...stepProps} />}
            {step === 'logos' && <LogosStep config={config} logos={logos} onUpload={uploadLogo} onDelete={deleteInput} />}
            {step === 'couleurs' && <ColorsStep {...stepProps} templates={templates} onApplyTemplate={applyTemplate} />}
            {step === 'typo' && (
              <TypographyStep {...stepProps} customFonts={customFonts} onUploadFont={uploadFont} onDeleteFont={deleteFont} />
            )}
            {step === 'images' && <ImagesStep images={images} onUpload={uploadImages} onDelete={deleteInput} />}
            {step === 'pages' && <PagesStep config={config} setSection={setSection} imagesCount={images.length} />}
          </div>

          <div className="step-nav">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={stepIndex === 0}
              onClick={() => setStep(STEPS[stepIndex - 1].id)}
            >
              <Icon name="arrowLeft" size={16} />
              Précédent
            </button>
            {stepIndex < STEPS.length - 1 ? (
              <button type="button" className="btn btn-primary" onClick={() => setStep(STEPS[stepIndex + 1].id)}>
                {STEPS[stepIndex + 1].label}
                <Icon name="arrowRight" size={16} />
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={generate} disabled={generating}>
                <Icon name="download" size={16} />
                {generating ? 'Génération…' : 'Télécharger le PDF'}
              </button>
            )}
          </div>
        </section>

        <PreviewPanel
          preview={preview}
          page={previewPage}
          onGenerate={generate}
          generating={generating}
          onOpenFiles={() => setModal('files')}
          filesCount={outputFiles?.length || 0}
        />
      </main>

      <Toast message={message} onClose={() => setMessage(null)} />

      <FilesModal
        isOpen={modal === 'files'}
        onClose={() => setModal(null)}
        outputFiles={outputFiles}
        trashFiles={trashFiles}
        refetch={refetchBootstrap}
        onMessage={notify}
      />
      <NewProjectModal isOpen={modal === 'new-project'} onClose={() => setModal(null)} onCreate={createProject} />
      <HistoryModal isOpen={modal === 'history'} onClose={() => setModal(null)} history={history} onRestore={restoreHistory} />
      <ConfirmModal
        isOpen={modal === 'reset'}
        onClose={() => setModal(null)}
        onConfirm={resetAll}
        title="Réinitialiser la charte ?"
        confirmLabel="Réinitialiser"
      >
        <p>Tous les réglages de cette charte reviennent aux valeurs par défaut et les logos et images sont supprimés. Les PDF déjà créés et vos polices sont conservés.</p>
      </ConfirmModal>
    </div>
  );
}

export default App;
