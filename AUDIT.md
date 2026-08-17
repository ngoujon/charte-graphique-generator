# Audit technique — Charte Graphique Generator

Date : 2026-08-17
Périmètre : `client/` (React + Vite), `server/` (Express), `shared/` (Zod + utils), Docker.

Stack : React 18 + Vite, Express 4, Zod, @react-pdf/renderer, multer, JSZip, Vitest, ESLint 9.

## 1. Sécurité (priorité haute)

- **Traversée de chemin (path traversal) sur les téléchargements de fichiers.** Dans `server/src/routes/output.js`, les endpoints `GET /files/:name` et `GET /trash/files/:name` construisent le chemin avec `path.join(outputDir(), req.params.name)` **sans passer par `assertSafeFilename`** (contrairement aux endpoints `DELETE` du même fichier et à `input.js`). Un nom du type `..%2f..%2f..%2fetc%2fpasswd` permettrait de lire un fichier arbitraire sur le serveur via `res.sendFile`. À corriger en priorité en réutilisant `assertSafeFilename` partout où un nom de fichier vient de l'URL.
- **Aucune authentification ni autorisation.** Toutes les routes (upload, suppression, réinitialisation qui vide `data/input`, génération PDF) sont accessibles sans identification. Acceptable en usage strictement local, mais bloquant si l'outil est un jour exposé sur un réseau partagé ou Internet.
- **CORS totalement ouvert** (`app.use(cors())` sans configuration) : n'importe quelle origine peut appeler l'API. À restreindre à l'origine du client en production.
- **Pas de limite de débit (rate limiting)** ni de protection contre les abus (`express-rate-limit` absent), alors que certains endpoints sont coûteux (génération PDF, export ZIP).
- **Pas de `helmet`** pour les en-têtes de sécurité HTTP standard.
- **Upload générique sans validation** (`inputRouter.post('/upload', upload.array(...))`) : ni `fileFilter` (type MIME), ni limite de taille par fichier — seul `express.json({limit:'10mb'})` encadre le JSON. Un fichier volumineux ou d'un type inattendu peut être déposé dans `data/input`.
- **Dépendances avec vulnérabilités connues** (`npm audit` côté `server/`) : `path-to-regexp` (ReDoS, sévérité haute, via une version d'Express) et `qs` (DoS modéré). Correction simple via mise à jour d'Express / `npm audit fix`.
- **Conteneur Docker exécuté en `root`** : le `Dockerfile` ne définit pas d'utilisateur non privilégié (`USER node`). Bonne pratique de durcissement à ajouter.

## 2. Robustesse

- **`server/src/pdf/generator.js` fait 1756 lignes** dans un seul fichier, sans aucun test. C'est le cœur métier de l'application (mise en page PDF) et le plus gros risque de régression silencieuse.
- **Couverture de tests quasi nulle** : seulement 2 fichiers de test (`shared/config.test.js`, `shared/parseColorInput.test.js`, 9 tests au total). Aucun test sur les routes Express, la génération PDF, ni les composants React.
- **Génération PDF non protégée contre la concurrence** : rien n'empêche deux requêtes `POST /api/generate` simultanées (double-clic, deux onglets) de tourner en parallèle et de saturer le CPU/mémoire.
- **Filtrage d'images incluant le SVG** (`generate.js` : regex `\.(png|jpg|jpeg|svg|webp)$`) alors que le rendu PDF (`@react-pdf/renderer`) traite les images comme des raster — à vérifier que les SVG sont bien convertis, sinon ils peuvent produire une page vide ou une erreur silencieuse.
- **Gestion d'erreurs très permissive** : de nombreux blocs `catch (() => {})` / `catch { }` avalent silencieusement des erreurs (ex. suppression de fichiers, lecture d'historique), ce qui peut masquer des problèmes de disque plein ou de permissions en production.
- **Pas de sauvegarde/rotation de `data/`** : `data/output` et `data/trash` contiennent déjà des dizaines de PDF accumulés sans purge automatique (seul l'historique de config est limité à 20 entrées).

## 3. Performance

- **`ConfigPanel.jsx` (534 lignes) rend probablement tout le panneau de configuration comme un bloc monolithique** sans découpage en sous-composants mémoïsés (`React.memo`) — à vérifier/optimiser pour éviter des re-renders coûteux à chaque frappe clavier (au-delà du debounce de sauvegarde déjà en place, qui est une bonne pratique existante).
- **`generatePdf` lit et encode chaque image en base64 en mémoire** (`imageToBase64`) sans limite de taille ni redimensionnement préalable — une charte avec de nombreuses images haute résolution peut consommer beaucoup de RAM et ralentir fortement la génération.
- **Pas de mise en cache HTTP** sur les fichiers statiques servis dynamiquement (`res.sendFile` sans en-têtes `Cache-Control`), ni sur les polices custom.

## 4. Qualité de code / maintenabilité

- **Configuration ESLint incomplète pour React** : le plugin de détection d'usage JSX (`react/jsx-uses-vars` ou équivalent) n'est pas actif — `npm run lint` remonte 19 faux positifs `no-unused-vars` sur des composants pourtant utilisés dans le JSX (`App.jsx`, `ConfigPanel.jsx`, `OutputPanel.jsx`, etc.). Cela dilue le signal utile du linter et masque de vrais problèmes potentiels.
- **Fichier `generator.js` à décomposer** en modules plus petits (mise en page par section : couverture, palette, typographie, kit UI…) pour faciliter la maintenance et les tests unitaires.
- **Duplication de logique de "nom de fichier sûr"** entre `refToFilename` (conf.js), le slugify de `/projects`, et `safeFilename.js` — à mutualiser dans `shared/`.
- **`data/output` et `data/trash` contiennent des dizaines de PDF de test versionnés dans l'espace de travail** (déjà exclus du `.gitignore` d'après le dernier commit, à confirmer qu'ils ne polluent pas les sauvegardes/exports).

## 5. Expérience utilisateur / design

Points positifs déjà en place : lien d'évitement (`skip-link`), media queries responsives (768px/480px/1200px), respect de `prefers-reduced-motion`, raccourci `Ctrl/Cmd+S`, indicateur de sauvegarde, toasts de message.

Pistes d'amélioration :
- **Pas d'indicateur de progression pendant la génération PDF** (opération potentiellement longue avec beaucoup d'images) : seul un état succès/échec est visible côté route ; à vérifier côté `OutputPanel` si un simple spinner suffit ou si un retour de progression serait plus rassurant.
- **Confirmation de suppression** : `showConfirmReset` existe pour le reset, mais à vérifier que les suppressions de fichiers individuels et de la corbeille ont la même garde-fou de confirmation systématique.
- **Accessibilité clavier des modales** : `useModalKeyboard.js` existe (bon signe), à étendre pour garantir un focus trap complet sur toutes les modales (`Modal.jsx`, `PdfPreviewModal.jsx`).
- **Absence de mode sombre** pour l'interface elle-même (indépendamment des couleurs de la charte générée), alors que l'outil manipule déjà des palettes clair/sombre — cohérence produit à envisager.

## 6. Fonctionnalités à envisager

- **Aperçu PDF en direct / incrémental** avant génération finale (au-delà de `PdfPreviewModal` qui prévisualise probablement le résultat déjà généré).
- **File d'attente de génération** avec verrou pour éviter les générations concurrentes (lié au point robustesse ci-dessus).
- **Undo/redo** sur l'édition de configuration (au-delà de l'historique de snapshots, qui nécessite un aller-retour serveur).
- **Export multi-format** (PNG des pages, PDF/A pour archivage) en plus du PDF standard.
- **Validation d'accessibilité des couleurs** (contraste WCAG) directement dans le configurateur de palette, pour garantir que les chartes générées sont accessibles.
- **Purge automatique programmable** de `data/output` / `data/trash` (rétention configurable).

## Backlog priorisé

Voir la section « Nouvelles tâches » de la réponse associée pour la liste actionnable avec niveaux de priorité.
