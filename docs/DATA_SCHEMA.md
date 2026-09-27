# Data schema

Place project CSV files in `public/data/`. Column names are case-sensitive. Do not change filenames unless `src/lib/data.js` is updated.

## formulations.csv
Required: `formulation_id`, `formulation_name`, `short_name`, `adsorption_score`, `release_score`, `stability_score`, `strength_score`, `soil_fit_score`, `crop_response_score`, `screening_score`. Descriptor scores should be on a consistent 0-10 scale and the screening score on a 0-100 scale. Document normalisation and weighting in `METHODS.md`.

## interaction_energies.csv
Required: `formulation_id`, `interaction_type`, `interaction_energy`. Recommended: `calculation_id`, `replicate`, `unit`, `method_id`. One row represents one calculation or replicate.

## release_kinetics.csv
Required: `formulation_id`, `day`, `cumulative_release`. Recommended: `replicate`, `unit`, `method_id`. One row represents one observation.

## crop_response.csv
Required: `crop`, `treatment`, `response_index`. Recommended: `replicate`, `dry_biomass`, `tissue_n`, unit fields and `method_id`. Use treatment identifiers that correspond to `formulation_id`, plus any control labels required by the experiment.

## Data-quality rules
- Use stable formulation and sample identifiers.
- Keep units explicit and consistent within each measurement type.
- Retain replicate-level observations rather than only means.
- Record exclusions and corrections in a version-controlled change log.
- Do not publish confidential, personal or commercially restricted data.
