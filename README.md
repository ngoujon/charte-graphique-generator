# Charte Graphique Generator

Application React + Docker pour générer des documents PDF de charge graphique.

## Fonctionnement

1. **Input** : Déposez vos fichiers (logos, images) dans `data/input/`
2. **Configuration** : Personnalisez la charte (couleurs, typo, projet) dans l’interface ou via `data/conf/`
3. **Output** : Générez le PDF → il est créé dans `data/output/`

## Développement avec Docker (hot reload)

```bash
npm run docker:dev
```

Ouvrez **http://localhost:5173** — les modifications sont reflétées en temps réel.

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

Frontend : http://localhost:5173 (proxy API vers 3002)

## Import / Export de configuration

- **Exporter** : sauvegarde la config actuelle en JSON (seed réutilisable)
- **Importer** : charge une config précédemment exportée

Cela permet de réutiliser une charte graphique sur un autre projet en important le fichier de configuration.

## Structure des dossiers

```
data/
├── input/   # Fichiers sources (images, logos)
├── output/  # PDFs générés
└── conf/    # Configuration (charte.json, charte-seed.json)
```
