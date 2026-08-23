"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ExperimentStatus = "Draft" | "Active" | "Done";
type Experiment = { id: string; title: string; area: string; observation: string; status: ExperimentStatus; createdAt: number };
type Draft = Pick<Experiment, "title" | "area" | "observation" | "status">;
const STATUSES: ExperimentStatus[] = ["Draft", "Active", "Done"];
const SEED: Experiment[] = [
  { id: "edge-runtime", title: "Edge runtime notes", area: "Next.js", observation: "Compare cold-start behavior before choosing a route boundary.", status: "Active", createdAt: 1710000000000 },
  { id: "mono-type", title: "Monochrome type study", area: "Typography", observation: "A narrow display face gives the archive more instrument-panel tension.", status: "Done", createdAt: 1709200000000 },
];

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState(initial); const [ready, setReady] = useState(false);
  useEffect(() => { try { const stored = window.localStorage.getItem(key); if (stored) setValue(JSON.parse(stored) as T); } catch { setValue(initial); } finally { setReady(true); } }, [key, initial]);
  useEffect(() => { if (ready) window.localStorage.setItem(key, JSON.stringify(value)); }, [key, ready, value]);
  return [value, setValue] as const;
}

export default function Home() {
  const [experiments, setExperiments] = useLocalStorage<Experiment[]>("lab-v2", SEED);
  const [query, setQuery] = useState(""); const [filter, setFilter] = useState<ExperimentStatus | "All">("All");
  const [draft, setDraft] = useState<Draft>({ title: "", area: "", observation: "", status: "Draft" }); const [notice, setNotice] = useState("Bench power is on.");
  const filtered = useMemo(() => { const needle = query.trim().toLowerCase(); return experiments.filter((item) => (filter === "All" || item.status === filter) && (!needle || `${item.title} ${item.area} ${item.observation} ${item.status}`.toLowerCase().includes(needle))); }, [experiments, filter, query]);
  const active = experiments.filter((item) => item.status === "Active").length; const done = experiments.filter((item) => item.status === "Done").length;
  function updateStatus(id: string, status: ExperimentStatus) { setExperiments((items) => items.map((item) => item.id === id ? { ...item, status } : item)); setNotice(`Specimen marked ${status.toLowerCase()}.`); }
  function addExperiment(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const title = draft.title.trim(); if (!title) return; setExperiments((items) => [{ id: crypto.randomUUID(), ...draft, title, area: draft.area.trim(), observation: draft.observation.trim(), createdAt: Date.now() }, ...items]); setDraft({ title: "", area: "", observation: "", status: "Draft" }); setNotice("New observation pinned to the bench."); }
  return (
    <main className="lab-page">
      <nav className="lab-nav" aria-label="Primary"><Link href="/" className="lab-mark">BOOK / R&amp;D</Link><span>BENCH 07 · LAB NOTEBOOK</span><span className="lab-nav-state"><i aria-hidden="true" /> LOCAL SAMPLE</span></nav>
      <section className="lab-hero" aria-labelledby="page-title"><div><p className="lab-kicker">OBSERVATION / INSTRUMENT LOG</p><h1 id="page-title">Observe. Log. Leave a trace.</h1><p className="lab-dek">A local notebook for experiments that deserve more than a passing thought. Record the question, the signal, and what your future self should know.</p><p className="lab-proof"><span>FIELD RULE</span> Sample data is authored for the portfolio demo. Nothing here is a claim of a running research program.</p></div><div className="lab-instrument" aria-hidden="true"><div className="lab-dial"><span>ACTIVE</span><b>{String(active).padStart(2, "0")}</b></div><div className="lab-needle" /><div className="lab-instrument-foot">BENCH POWER / ON</div></div></section>
      <section className="lab-readout" aria-label="Lab summary"><div><span>OBSERVATIONS</span><strong>{experiments.length}</strong></div><div><span>RUNNING</span><strong>{active}</strong></div><div><span>RESOLVED</span><strong>{done}</strong></div><p role="status">{notice}</p></section>
      <section className="lab-log" aria-labelledby="log-title"><div className="lab-section-head"><div><p className="lab-label">02 / THE NOTEBOOK</p><h2 id="log-title">Experiment log</h2></div><p>{filtered.length} / {experiments.length} observations in view</p></div><div className="lab-tools"><label><span>SEARCH THE BENCH</span><input aria-label="Search experiments" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Title, tool, observation" /></label><div className="lab-filters" role="group" aria-label="Filter experiments by state">{["All", ...STATUSES].map((option) => <button type="button" key={option} className={filter === option ? "is-active" : ""} onClick={() => setFilter(option as ExperimentStatus | "All")} aria-pressed={filter === option}>{option}</button>)}</div></div>{filtered.length ? <ol className="lab-list">{filtered.map((item, index) => <li key={item.id}><article className={`lab-entry lab-entry--${item.status.toLowerCase()}`}><div className="lab-entry-number">{String(index + 1).padStart(2, "0")}</div><div className="lab-entry-copy"><p className="lab-entry-code">{item.area || "UNASSIGNED"} / {item.status.toUpperCase()}</p><h3>{item.title}</h3><p><strong>Observation:</strong> {item.observation || "No observation logged yet."}</p><time dateTime={new Date(item.createdAt).toISOString()}>Logged {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</time></div><div className="lab-entry-actions"><label><span>STATE</span><select aria-label={`State for ${item.title}`} value={item.status} onChange={(event) => updateStatus(item.id, event.target.value as ExperimentStatus)}>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label><button type="button" onClick={() => { setExperiments((items) => items.filter((entry) => entry.id !== item.id)); setNotice("Observation removed from this browser."); }}>REMOVE</button></div></article></li>)}</ol> : <div className="lab-empty"><strong>No signal in this window.</strong><span>Clear the filter or log a fresh observation below.</span></div>}</section>
      <section className="lab-new" aria-labelledby="new-title"><div><p className="lab-label">03 / PIN A NOTE</p><h2 id="new-title">Log the next question.</h2><p>Good experiments leave a trail: what changed, where it happened, and what to try next.</p></div><form onSubmit={addExperiment}><label><span>EXPERIMENT *</span><input aria-label="Experiment title" required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="The question to investigate" /></label><label><span>AREA / TOOL</span><input aria-label="Experiment area" value={draft.area} onChange={(event) => setDraft({ ...draft, area: event.target.value })} placeholder="Runtime, type, process" /></label><label className="lab-wide"><span>OBSERVATION</span><textarea aria-label="Experiment observation" value={draft.observation} onChange={(event) => setDraft({ ...draft, observation: event.target.value })} placeholder="What did the bench tell you?" /></label><label><span>STATE</span><select aria-label="Experiment state" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as ExperimentStatus })}>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label><button type="submit" className="lab-submit">PIN TO NOTEBOOK <span aria-hidden="true">↗</span></button></form></section>
      <footer className="lab-footer"><strong>LAB / SAMPLE NOTEBOOK</strong><span>Bookchaowalit · localStorage only · {new Date().getFullYear()}</span></footer>
    </main>
  );
}
