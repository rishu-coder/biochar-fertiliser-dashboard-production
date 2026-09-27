import Papa from "papaparse";

const definitions = {
  formulations: { file: "formulations.csv", required: ["formulation_id","formulation_name","short_name","adsorption_score","release_score","stability_score","strength_score","soil_fit_score","crop_response_score","screening_score"] },
  energies: { file: "interaction_energies.csv", required: ["formulation_id","interaction_type","interaction_energy"] },
  release: { file: "release_kinetics.csv", required: ["formulation_id","day","cumulative_release"] },
  crops: { file: "crop_response.csv", required: ["crop","treatment","response_index"] },
};

const numericFields = new Set(["adsorption_score","release_score","stability_score","strength_score","soil_fit_score","crop_response_score","screening_score","interaction_energy","replicate","day","cumulative_release","response_index","dry_biomass","tissue_n"]);

async function loadOne(key, config) {
  const url = `${import.meta.env.BASE_URL}data/${config.file}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`${config.file} could not be loaded`);
  const text = await response.text();
  if (!text.trim()) throw new Error(`${config.file} is empty`);
  const parsed = Papa.parse(text, { header:true, skipEmptyLines:true, transformHeader:h=>h.trim() });
  if (parsed.errors.length) throw new Error(`${config.file}: ${parsed.errors[0].message}`);
  const missing = config.required.filter(field => !parsed.meta.fields?.includes(field));
  if (missing.length) throw new Error(`${config.file} is missing: ${missing.join(", ")}`);
  const rows = parsed.data.map(row => Object.fromEntries(Object.entries(row).map(([k,v]) => [k, numericFields.has(k) && v !== "" ? Number(v) : v])));
  return [key, rows];
}

export async function loadDatasets() {
  const results = await Promise.allSettled(Object.entries(definitions).map(([key,cfg])=>loadOne(key,cfg)));
  const data = {}; const errors = [];
  results.forEach(result => result.status === "fulfilled" ? data[result.value[0]] = result.value[1] : errors.push(result.reason.message));
  return { data, errors };
}
