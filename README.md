# Charte Graphique Generator

Application React + Express pour générer des documents PDF de charte graphique. Interface tout-en-un pour configurer et produire des chartes graphiques professionnelles.

## Prérequis

- **Node.js** 18+
- **Docker** (optionnel, pour l'exécution en conteneur)

## Fonctionnement

1. **Entrée** : Déposez vos images (éléments graphiques) via glisser-déposer ou sélection de fichiers
2. **Logos** : Uploadez les 4 déclinaisons (clair, sombre, primaire, secondaire) dans la configuration
3. **Configuration** : Personnalisez la charte (couleurs, typographie, projet, marque, sections PDF)
4. **Sortie** : Générez le PDF → il est créé dans le dossier `data/output`

L'interface affiche tout sur une seule page (entrée, configuration, sortie) pour un contrôle sans navigation.

## Contenu du PDF généré

- Couverture avec nom du projet
- Présentation de la marque (slogan, mission, valeurs, personnalité)
- **Logo — 4 déclinaisons** : clair, sombre, sur couleur principale, sur couleur secondaire
- Palette de couleurs (clair, sombre, principale, secondaire + déclinaisons)
- Typographie (3 polices : principale, secondaire, tertiaire)
- Kit UI (boutons, champs, badges, cartes)
- Éléments graphiques (images du dossier entrée, hors logos)
- À propos de Qwebty

Les sections sont activables/désactivables dans l'interface. Le document applique les 13 principes du design graphique.

## Logos

Les logos s'uploadent via les zones dédiées dans la configuration. Les fichiers sont nommés automatiquement (`logo-clair-*`, `logo-sombre-*`, etc.).

Pour une détection automatique par nom de fichier dans le PDF, vous pouvez aussi utiliser :

| Déclinaison | Exemples de noms |
|-------------|------------------|
| Fond clair | `logo-clair`, `clair`, `light` |
| Fond sombre | `logo-sombre`, `sombre`, `dark` |
| Sur couleur principale | `logo-primaire`, `primaire`, `primary` |
| Sur couleur secondaire | `logo-secondaire`, `secondaire`, `secondary` |

## Configuration

- **Projet** : nom, description, auteur, référence, date
- **Marque** : slogan, mission, valeurs, personnalité, recherche
- **Palette** : clair, sombre, couleur principale, secondaire
- **Typographie** : 3 polices (principale, secondaire, tertiaire) + upload custom
- **Sections PDF** : toggles pour inclure/exclure des pages
- **Templates** : presets startup, institution, retail
- **Multi-projets** : créer et basculer entre plusieurs chartes
- **Historique** : snapshots automatiques avec restauration

## Import / Export

- **Exporter ZIP** : config + images + polices (bouton téléchargement)
- **Exporter tokens Figma** : JSON couleurs et typographie
- **Importer** : fichier `.zip` (complet) ou `.json` (config seule)

## Démarrage

### Option 1 : Sans Docker (recommandé pour le développement)

```bash
npm install
cd shared && npm install && cd ..
cd server && npm install && cd ..
cd client && npm install && cd ..
npm run dev
```

Ouvrez **http://localhost:3002** — le client (Vite) tourne sur le port 3002, le serveur API sur le port 3003.

### Option 2 : Avec Docker (mode développement)

```bash
npm run docker:dev
```

### Option 3 : Production Docker

```bash
npm run docker:prod
```

## Structure du projet

```
charte-graphique-generator/
├── client/           # Frontend React (Vite)
├── server/           # Backend Express + génération PDF
├── shared/           # Schéma config (Zod), utilitaires partagés
├── data/
│   ├── input/        # Fichiers sources (images, logos)
│   ├── output/       # PDFs générés
│   ├── trash/        # Corbeille PDF
│   └── conf/         # Configuration (charte.json, history/, projects/)
├── docker-compose.yml
└── Dockerfile.dev
```

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance client (3002) + serveur (3003) en mode développement |
| `npm run build` | Build client + copie dans server/public |
| `npm start` | Lance le serveur en mode production (après build) |
| `npm test` | Tests unitaires (Vitest) |
| `npm run lint` | Vérification ESLint |
| `npm run docker:dev` | Lance l'app en Docker avec hot reload |
| `npm run docker:prod` | Lance l'app en Docker (build de production) |

## Stack technique

- **Frontend** : React 18, Vite 6
- **Backend** : Express
- **PDF** : @react-pdf/renderer
- **Validation** : Zod (package `shared/`)
- **Tests** : Vitest
- **Conteneur** : Docker

## Raccourcis clavier

- **Ctrl+S** : sauvegarde explicite de la configuration
- **Échap** / **Entrée** : fermer / confirmer les modales de confirmation
