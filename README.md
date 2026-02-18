# Charte Graphique Generator

Application React + Express pour générer des documents PDF de charte graphique. Interface tout-en-un pour configurer et produire des chartes graphiques professionnelles.

## Prérequis

- **Node.js** 18+
- **Docker** (optionnel, pour l'exécution en conteneur)

## Fonctionnement

1. **Entrée** : Déposez vos fichiers (logos, images) dans le dossier `data/input`
2. **Configuration** : Personnalisez la charte (couleurs, typographie, projet, marque) dans l'interface
3. **Sortie** : Générez le PDF → il est créé dans le dossier `data/output`

L'interface affiche tout sur une seule page (entrée, configuration, sortie) pour un contrôle sans navigation.

## Contenu du PDF généré

- Couverture avec nom du projet
- Présentation de la marque (slogan, mission, valeurs, personnalité)
- **Logo — 4 déclinaisons** : clair, sombre, sur couleur principale, sur couleur secondaire
- Palette de couleurs (blanc, noir, principale, secondaire + déclinaisons)
- Typographie (exemple d'article, alphabets, chiffres 0–9)
- Kit UI (boutons, champs, badges, cartes)

Le document applique les 13 principes du design graphique (alignement, contraste, équilibre, hiérarchie, etc.).

## Logos — Nommage des fichiers

Pour que vos logos soient reconnus automatiquement, nommez vos fichiers ainsi :

| Déclinaison | Exemples de noms |
|-------------|------------------|
| Fond clair | `logo-clair`, `clair`, `light`, `claire` |
| Fond sombre | `logo-sombre`, `sombre`, `dark`, `noir` |
| Sur couleur principale | `logo-primaire`, `primaire`, `primary`, `principale` |
| Sur couleur secondaire | `logo-secondaire`, `secondaire`, `secondary` |

Si vous ne fournissez que clair et sombre, les versions primaire et secondaire utiliseront le logo sombre par défaut.

## Configuration

- **Projet** : nom, description, auteur, date
- **Marque** : slogan, mission, valeurs, personnalité
- **Palette** : blanc, noir, couleur principale, secondaire
- **Typographie** : polices (titre, corps), tailles, exemples de texte

## Import / Export

- **Exporter** : sauvegarde la config actuelle en JSON (réutilisable)
- **Importer** : charge une config précédemment exportée

## Démarrage

### Option 1 : Sans Docker (recommandé pour le développement)

```bash
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
npm run dev
```

Ouvrez **http://localhost:3002** — le client (Vite) tourne sur le port 3002, le serveur API sur le port 3003. Les modifications sont visibles immédiatement (hot reload).

### Option 2 : Avec Docker (mode développement)

```bash
npm run docker:dev
```

Ou `docker compose up` — le fichier `docker-compose.override.yml` active le mode dev par défaut. Les dossiers `client/` et `server/` sont montés en volume, **aucun rebuild nécessaire** pour voir vos modifications. L'application est accessible sur **http://localhost:3002**.

### Option 3 : Production Docker

```bash
npm run docker:prod
```

Ou `docker compose -f docker-compose.yml up -d` — sans l'override pour le build de production. L'application est accessible sur **http://localhost:3002**.

## Structure du projet

```
charte-graphique-generator/
├── client/           # Frontend React (Vite)
├── server/           # Backend Express + génération PDF
├── data/
│   ├── input/        # Fichiers sources (images, logos)
│   ├── output/       # PDFs générés
│   └── conf/         # Configuration (charte.json)
├── docker-compose.yml
├── docker-compose.override.yml   # Mode dev par défaut
└── Dockerfile.dev
```

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance client (3002) + serveur (3003) en mode développement |
| `npm run build` | Build client + copie dans server/public + prépare la production |
| `npm start` | Lance le serveur en mode production (après build) |
| `npm run docker:dev` | Lance l'app en Docker avec hot reload |
| `npm run docker:prod` | Lance l'app en Docker (build de production) |

## Stack technique

- **Frontend** : React 18, Vite 6
- **Backend** : Express
- **PDF** : @react-pdf/renderer
- **Conteneur** : Docker
