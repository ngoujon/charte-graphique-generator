# Charte Graphique Generator

Application React + Docker pour générer des documents PDF de charge graphique (charte graphique).

## Fonctionnement

1. **Entrée** : Déposez vos fichiers (logos, images) dans le dossier entrée
2. **Configuration** : Personnalisez la charte (couleurs, typographie, projet, marque) dans l’interface
3. **Sortie** : Générez le PDF → il est créé dans le dossier sortie

L’interface affiche tout sur une seule page (entrée, configuration, sortie) pour un contrôle sans navigation.

## Contenu du PDF généré

- Couverture avec nom du projet
- Présentation de la marque (slogan, mission, valeurs, personnalité)
- **Logo — 4 déclinaisons** : clair, sombre, sur couleur principale, sur couleur secondaire
- Palette de couleurs (blanc, noir, principale, secondaire, tertiaire + déclinaisons)
- Typographie (exemple d’article, alphabets, chiffres 0–9)
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
- **Palette** : blanc, noir, couleur principale, secondaire, tertiaire
- **Typographie** : polices (titre, corps), tailles, exemples de texte

## Import / Export

- **Exporter** : sauvegarde la config actuelle en JSON (réutilisable)
- **Importer** : charge une config précédemment exportée

## Développement avec Docker (hot reload)

```bash
npm run docker:dev
```

Ouvrez **http://localhost:3002** — les modifications sont reflétées en temps réel.

## Production Docker (port 3002)

```bash
docker compose up -d
```

Puis ouvrez http://localhost:3002

## Développement sans Docker

```bash
npm install && cd server && npm install && cd ../client && npm install && cd ..
npm run dev
```

Frontend : http://localhost:3002 (API sur 3003 en dev)

## Structure des dossiers

```
data/
├── input/   # Fichiers sources (images, logos)
├── output/  # PDFs générés
└── conf/    # Configuration (charte.json)
```

## Stack technique

- **Frontend** : React (Vite)
- **Backend** : Express
- **PDF** : @react-pdf/renderer
- **Conteneur** : Docker
