# Model-Guided Biochar Fertiliser Formulation Dashboard

A deployable React/Vite dashboard for integrating molecular interaction energies, nutrient-release kinetics, formulation descriptors and cereal-crop response data.

## Repository structure
```text
.github/workflows/deploy.yml
docs/DATA_SCHEMA.md
docs/METHODS.md
docs/DATA_PROVENANCE_TEMPLATE.md
public/data/*.csv
scripts/validate-data.mjs
src/components/*
src/lib/data.js
src/App.jsx
```

## Add project data
Populate the four CSV files under `public/data/` without changing their required column names. Header-only files are included so the application can deploy before data are added. See `docs/DATA_SCHEMA.md`.

## Local use
```bash
npm install
npm run check:data
npm run dev
```
Production check:
```bash
npm run build
npm run preview
```

## GitHub Pages deployment
1. Create a public repository named `biochar-fertiliser-dashboard`.
2. Commit and push this entire folder to `main`.
3. Open **Settings > Pages** and select **GitHub Actions** as the source.
4. The included workflow validates file schemas, builds the site and deploys the `dist` artifact.
5. The expected address is `https://YOUR-USERNAME.github.io/biochar-fertiliser-dashboard/`.

If the repository name changes, update `base` in `vite.config.js`.

## Updating data
Replace or edit the CSV files in `public/data/`, then commit and push. The workflow will validate the required headers and redeploy automatically.

## Scientific documentation
Complete `docs/METHODS.md` and `docs/DATA_PROVENANCE_TEMPLATE.md` before public release. Ensure every displayed indicator has a documented method, unit, transformation and quality-control status.

## Licence
MIT for the software. Apply a separate, explicit licence to released research data where appropriate.
