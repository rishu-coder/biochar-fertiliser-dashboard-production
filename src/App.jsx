import React, { useEffect, useMemo, useState } from "react";
import { Atom, Beaker, FlaskConical, Sprout, Wheat, AlertTriangle, RefreshCw } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ErrorBar } from "recharts";
import { loadDatasets } from "./lib/data";
import Panel from "./components/Panel";
import EmptyState from "./components/EmptyState";

const colours=["#0f766e","#d97706","#2563eb","#7c3aed","#dc2626","#0891b2"];
const mean=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:null;
const sd=a=>{if(a.length<2)return 0;const m=mean(a);return Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/(a.length-1));};
const group=(rows,keys,value)=>{const m=new Map();rows.forEach(r=>{const k=keys.map(x=>r[x]).join("||");if(!m.has(k))m.set(k,[]);m.get(k).push(r[value]);});return [...m].map(([k,v])=>{const parts=k.split("||");return Object.fromEntries([...keys.map((x,i)=>[x,parts[i]]),[value,mean(v)],[`${value}_sd`,sd(v)],["n",v.length]]);});};

export default function App(){
 const [state,setState]=useState({loading:true,data:{},errors:[]});
 const [selected,setSelected]=useState("");
 const reload=()=>{setState(s=>({...s,loading:true}));loadDatasets().then(({data,errors})=>{setState({loading:false,data,errors});if(data.formulations?.length)setSelected(x=>x||data.formulations[0].formulation_id);});};
 useEffect(reload,[]);
 const forms=state.data.formulations||[]; const active=forms.find(f=>f.formulation_id===selected)||forms[0];
 const energy=useMemo(()=>group((state.data.energies||[]).filter(r=>!selected||r.formulation_id===selected),["interaction_type"],"interaction_energy"),[state.data.energies,selected]);
 const release=useMemo(()=>{const rows=group(state.data.release||[],["formulation_id","day"],"cumulative_release");const days=[...new Set(rows.map(r=>Number(r.day)))].sort((a,b)=>a-b);return days.map(day=>{const o={day};rows.filter(r=>Number(r.day)===day).forEach(r=>o[r.formulation_id]=r.cumulative_release);return o;});},[state.data.release]);
 const crop=useMemo(()=>group(state.data.crops||[],["crop","treatment"],"response_index"),[state.data.crops]);
 const cropWide=useMemo(()=>{const names=[...new Set(crop.map(r=>r.crop))];return names.map(name=>{const o={crop:name};crop.filter(r=>r.crop===name).forEach(r=>o[r.treatment]=r.response_index);return o;});},[crop]);
 const radar=active?[['Adsorption','adsorption_score'],['Release','release_score'],['Stability','stability_score'],['Strength','strength_score'],['Soil fit','soil_fit_score'],['Crop response','crop_response_score']].map(([metric,k])=>({metric,value:active[k]})):[];
 const ids=forms.map(f=>f.formulation_id);
 return <main className="min-h-screen bg-slate-50">
  <header className="bg-slate-950 text-white"><div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20"><p className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-teal-300"><Wheat size={18}/>Model-guided formulation platform</p><h1 className="mt-4 max-w-5xl text-4xl font-black leading-tight md:text-6xl">Biochar fertiliser formulation dashboard</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">Integrating molecular interactions, nutrient-release behaviour, granule performance and cereal-crop response.</p></div></header>
  <section className="mx-auto max-w-7xl px-5 py-10 md:px-8">
   {state.errors.length>0&&<div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950"><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 shrink-0"/><div><p className="font-bold">Some datasets could not be loaded</p><ul className="mt-2 list-disc pl-5 text-sm">{state.errors.map(e=><li key={e}>{e}</li>)}</ul></div></div></div>}
   <div className="mb-10 grid gap-4 md:grid-cols-4">{[[Atom,'Molecular modelling'],[Beaker,'Chemistry validation'],[FlaskConical,'Granule engineering'],[Sprout,'Crop evaluation']].map(([I,t],i)=><div key={t} className="rounded-2xl border bg-white p-5 shadow-sm"><I className="text-teal-700"/><p className="mt-3 text-xs font-bold text-slate-400">0{i+1}</p><h2 className="font-bold">{t}</h2></div>)}</div>
   <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2">{forms.map((f,i)=><button key={f.formulation_id} onClick={()=>setSelected(f.formulation_id)} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${selected===f.formulation_id?'border-slate-900 bg-slate-900 text-white':'border-slate-200 bg-white'}`}>{f.short_name||f.formulation_id}</button>)}</div><button onClick={reload} className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-semibold"><RefreshCw size={16}/>Reload data</button></div>
   <div className="grid gap-6 lg:grid-cols-2">
    <Panel title="Interaction energies" subtitle="Mean values across available replicates; lower values indicate stronger calculated affinity under the stated method.">{energy.length?<div className="h-80"><ResponsiveContainer><BarChart data={energy}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="interaction_type"/><YAxis/><Tooltip/><Bar dataKey="interaction_energy" fill="#0f766e"/></BarChart></ResponsiveContainer></div>:<EmptyState text="Add valid rows to public/data/interaction_energies.csv."/>}</Panel>
    <Panel title="Formulation profile" subtitle="Normalised descriptors read from the formulation dataset.">{radar.length?<div className="h-80"><ResponsiveContainer><RadarChart data={radar}><PolarGrid/><PolarAngleAxis dataKey="metric"/><PolarRadiusAxis domain={[0,10]}/><Radar dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={.3}/><Tooltip/></RadarChart></ResponsiveContainer></div>:<EmptyState text="Add formulations to public/data/formulations.csv."/>}</Panel>
    <Panel title="Cumulative nutrient release" subtitle="Mean cumulative release by formulation and time point.">{release.length?<div className="h-80"><ResponsiveContainer><LineChart data={release}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="day"/><YAxis/><Tooltip/><Legend/>{ids.map((id,i)=><Line key={id} dataKey={id} stroke={colours[i%colours.length]} strokeWidth={3} dot={false}/>)}</LineChart></ResponsiveContainer></div>:<EmptyState text="Add release observations to public/data/release_kinetics.csv."/>}</Panel>
    <Panel title="Crop response" subtitle="Mean response index by crop and treatment.">{cropWide.length?<div className="h-80"><ResponsiveContainer><BarChart data={cropWide}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="crop"/><YAxis/><Tooltip/><Legend/>{[...new Set(crop.map(r=>r.treatment))].map((id,i)=><Bar key={id} dataKey={id} fill={colours[i%colours.length]}/>)}</BarChart></ResponsiveContainer></div>:<EmptyState text="Add crop observations to public/data/crop_response.csv."/>}</Panel>
   </div>
  </section>
  <footer className="mt-8 bg-slate-950 px-5 py-8 text-center text-sm text-slate-400">Model-guided biochar fertiliser formulation dashboard</footer>
 </main>;
}
