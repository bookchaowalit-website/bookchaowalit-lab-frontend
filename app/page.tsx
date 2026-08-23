"use client";

import {
  useRef,
  useState,
  useSyncExternalStore,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type ExperimentStatus = "Draft" | "Active" | "Done";
type Experiment = {
  id: string;
  title: string;
  area: string;
  observation: string;
  status: ExperimentStatus;
  createdAt: number;
};
type Draft = Pick<Experiment, "title" | "area" | "observation" | "status">;
type Filter = "All" | ExperimentStatus;

const STATUS_OPTIONS: ExperimentStatus[] = ["Draft", "Active", "Done"];
const FILTERS: Filter[] = ["All", ...STATUS_OPTIONS];

function LabFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <main aria-labelledby="page-title">{children}</main>
        <footer className="mt-16 flex flex-wrap justify-between gap-3 border-t border-zinc-200 pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500 dark:border-zinc-800">
          <span>Lab / experiment log</span>
          <span>Local-only · saved in this browser</span>
        </footer>
      </div>
    </div>
  );
}

function SubmitButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className="inline-flex min-h-11 items-center justify-center rounded-md bg-zinc-950 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300 dark:focus-visible:ring-zinc-100 dark:focus-visible:ring-offset-zinc-950"
    >
      {children}
    </button>
  );
}

const lineInputClass =
  "min-h-11 w-full border-0 border-b border-zinc-300 bg-transparent px-0 py-2 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-700";

function readStorage<T>(key: string, initial: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw == null ? initial : (JSON.parse(raw) as T);
  } catch {
    return initial;
  }
}

function normalizeExperiments(items: Experiment[]): Experiment[] {
  return items.map((item) => ({
    ...item,
    area: item.area || "General",
    observation: item.observation || "No observation recorded yet.",
    status: item.status === "Done" || item.status === "Active" ? item.status : "Draft",
  }));
}

function useLocalStorage<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const cache = useRef<{ raw: string | null | undefined; value: T }>({ raw: undefined, value: initial });
  const getSnapshot = () => {
    const raw = window.localStorage.getItem(key);
    if (raw === cache.current.raw) return cache.current.value;
    const stored = readStorage(key, initial);
    cache.current = {
      raw,
      value: Array.isArray(stored) ? (normalizeExperiments(stored as Experiment[]) as T) : stored,
    };
    return cache.current.value;
  };
  const getServerSnapshot = () => initial;
  const subscribe = (onStoreChange: () => void) => {
    const eventName = `lab-storage:${key}`;
    window.addEventListener("storage", onStoreChange);
    window.addEventListener(eventName, onStoreChange);
    return () => {
      window.removeEventListener("storage", onStoreChange);
      window.removeEventListener(eventName, onStoreChange);
    };
  };
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setValue: Dispatch<SetStateAction<T>> = (nextValue) => {
    const current = getSnapshot();
    const resolvedValue = typeof nextValue === "function"
      ? (nextValue as (previous: T) => T)(current)
      : nextValue;
    window.localStorage.setItem(key, JSON.stringify(resolvedValue));
    window.dispatchEvent(new Event(`lab-storage:${key}`));
  };
  return [value, setValue];
}

function uid() {
  return crypto.randomUUID();
}

const SEED_ENTRIES: Array<Omit<Experiment, "id" | "createdAt">> = [
  { title: "Edge caching", area: "Web performance", observation: "TTFB improved 20%", status: "Done" },
  { title: "Three.js Demo", area: "Three.js", observation: "3D graphics experiment", status: "Active" },
  { title: "WebGL Shaders", area: "WebGL", observation: "Shader effects", status: "Draft" },
];

const SEED: Experiment[] = SEED_ENTRIES.map((entry, index) => ({
  ...entry,
  id: String(index + 1),
  createdAt: Date.now() - index * 86400000,
}));

function emptyDraft(): Draft {
  return { title: "", area: "", observation: "", status: "Draft" };
}

function rowStyle(status: ExperimentStatus) {
  return status === "Active"
    ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950"
    : "border-zinc-300 text-zinc-950 dark:border-zinc-700 dark:text-zinc-100";
}

function secondaryStyle(status: ExperimentStatus) {
  return status === "Active" ? "text-zinc-300 dark:text-zinc-700" : "text-zinc-600 dark:text-zinc-400";
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ExperimentRow({
  item,
  index,
  onDelete,
  onStatusChange,
}: {
  item: Experiment;
  index: number;
  onDelete: () => void;
  onStatusChange: (status: ExperimentStatus) => void;
}) {
  const active = item.status === "Active";
  return (
    <article className={`grid gap-5 border-y px-4 py-5 transition-colors sm:grid-cols-[4rem_minmax(0,1fr)_12rem] sm:items-start sm:gap-7 ${rowStyle(item.status)}`}>
      <div className="font-mono text-xs font-semibold uppercase tracking-[0.16em] opacity-60">
        {String(index + 1).padStart(2, "0")}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h3 className="text-2xl font-semibold tracking-[-0.04em]">{item.title}</h3>
          <span className={`font-mono text-[10px] font-semibold uppercase tracking-[0.14em] ${secondaryStyle(item.status)}`}>{item.area}</span>
        </div>
        <p className={`mt-3 max-w-[62ch] text-sm leading-6 ${secondaryStyle(item.status)}`}>
          <span className="font-semibold">Observation:</span> {item.observation}
        </p>
        <time className={`mt-4 block font-mono text-[10px] uppercase tracking-[0.14em] ${secondaryStyle(item.status)}`} dateTime={new Date(item.createdAt).toISOString()}>
          Logged {formatDate(item.createdAt)}
        </time>
      </div>
      <div className="flex items-center gap-3 sm:justify-end">
        <label className="min-w-0 flex-1 sm:flex-none">
          <span className="sr-only">Set state for {item.title}</span>
          <select
            aria-label={`Set state for ${item.title}`}
            value={item.status}
            onChange={(event) => onStatusChange(event.target.value as ExperimentStatus)}
            className={`min-h-11 w-full border-b border-current bg-transparent px-0 py-2 text-xs font-semibold uppercase tracking-[0.12em] outline-none focus:ring-2 focus:ring-current sm:w-28 ${active ? "text-white dark:text-zinc-950" : "text-zinc-700 dark:text-zinc-300"}`}
          >
            {STATUS_OPTIONS.map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${item.title}`}
          className="min-h-11 rounded-md px-3 text-xs font-semibold opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default function Home() {
  const [items, setItems] = useLocalStorage<Experiment[]>("lab-v1", SEED);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = items.filter((item) => {
    const matchesQuery = `${item.title} ${item.area} ${item.observation} ${item.status}`.toLowerCase().includes(normalizedQuery);
    const matchesFilter = filter === "All" || item.status === filter;
    return matchesQuery && matchesFilter;
  });
  const activeCount = items.filter((item) => item.status === "Active").length;
  const doneCount = items.filter((item) => item.status === "Done").length;
  const hasFilters = Boolean(normalizedQuery) || filter !== "All";

  const add = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = draft.title.trim();
    if (!title) return;
    setItems((previous) => [
      { ...draft, id: uid(), title, area: draft.area.trim() || "General", observation: draft.observation.trim() || "No observation recorded yet.", createdAt: Date.now() },
      ...previous,
    ]);
    setDraft(emptyDraft());
  };

  const clearFilters = () => {
    setQuery("");
    setFilter("All");
  };

  return (
    <LabFrame>
      <header className="grid gap-10 border-b border-zinc-200 pb-10 dark:border-zinc-800 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-end">
        <div>
          <h1 id="page-title" className="text-6xl font-semibold tracking-[-0.07em] sm:text-8xl">Lab</h1>
          <p className="mt-6 max-w-[52ch] text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            A working log for ideas tested, signals observed, and results worth keeping.
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-4 border-t border-zinc-300 pt-4 font-mono text-xs uppercase tracking-[0.14em] dark:border-zinc-700 lg:border-l lg:border-t-0 lg:pl-6">
          <div><dt className="text-zinc-500">Entries</dt><dd className="mt-2 text-2xl font-semibold tracking-normal text-zinc-950 dark:text-zinc-100">{items.length}</dd></div>
          <div><dt className="text-zinc-500">Active</dt><dd className="mt-2 text-2xl font-semibold tracking-normal text-zinc-950 dark:text-zinc-100">{activeCount}</dd></div>
          <div><dt className="text-zinc-500">Done</dt><dd className="mt-2 text-2xl font-semibold tracking-normal text-zinc-950 dark:text-zinc-100">{doneCount}</dd></div>
        </dl>
      </header>

      <section aria-labelledby="log-heading" className="mt-12">
        <div className="flex flex-col gap-5 border-b border-zinc-200 pb-5 dark:border-zinc-800 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="log-heading" className="text-2xl font-semibold tracking-[-0.04em]">Experiment log</h2>
            <p className="mt-2 text-sm text-zinc-500">{filtered.length} of {items.length} observations in view</p>
          </div>
          <label className="w-full lg:max-w-sm">
            <span className="sr-only">Search experiment log</span>
            <input
              className={lineInputClass}
              aria-label="Search experiment log"
              placeholder="Search observations"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2" role="toolbar" aria-label="Filter experiment log">
          {FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={filter === option}
              onClick={() => setFilter(option)}
              className={`min-h-11 rounded-md border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:focus-visible:ring-zinc-100 dark:focus-visible:ring-offset-zinc-950 ${filter === option ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950" : "border-zinc-300 bg-transparent text-zinc-600 hover:border-zinc-950 hover:text-zinc-950 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-100 dark:hover:text-zinc-100"}`}
            >
              {option}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-8 border-y border-zinc-300 py-16 dark:border-zinc-700">
            <h3 className="text-3xl font-semibold tracking-[-0.05em]">No observations found.</h3>
            <p className="mt-3 max-w-[44ch] text-sm leading-6 text-zinc-500">Try a different term or clear the current state filter before logging a new experiment.</p>
            {hasFilters && <div className="mt-6"><button type="button" onClick={clearFilters} className="min-h-11 rounded-md bg-zinc-950 px-5 py-2 text-sm font-semibold text-white hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-950 dark:focus-visible:ring-zinc-100">Clear filters</button></div>}
          </div>
        ) : (
          <ol className="mt-8 space-y-3">
            {filtered.map((item, index) => (
              <li key={item.id}>
                <ExperimentRow
                  item={item}
                  index={index}
                  onDelete={() => setItems((previous) => previous.filter((entry) => entry.id !== item.id))}
                  onStatusChange={(status) => setItems((previous) => previous.map((entry) => entry.id === item.id ? { ...entry, status } : entry))}
                />
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="new-entry-heading" className="mt-16 grid gap-10 border-t border-zinc-200 pt-10 dark:border-zinc-800 lg:grid-cols-[minmax(15rem,0.7fr)_minmax(0,1.3fr)]">
        <div>
          <h2 id="new-entry-heading" className="text-2xl font-semibold tracking-[-0.04em]">Log an experiment</h2>
          <p className="mt-3 max-w-[30ch] text-sm leading-6 text-zinc-500">Name the question, record the signal, and leave a useful trace for your future self.</p>
        </div>
        <form onSubmit={add} className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-semibold">Experiment <span aria-hidden="true">*</span></span>
            <input className={lineInputClass} required value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold">Area / tool</span>
            <input className={lineInputClass} value={draft.area} onChange={(event) => setDraft((current) => ({ ...current, area: event.target.value }))} />
          </label>
          <label className="block space-y-2 sm:col-span-2">
            <span className="text-sm font-semibold">Observation</span>
            <textarea className={`${lineInputClass} min-h-20 resize-y`} value={draft.observation} onChange={(event) => setDraft((current) => ({ ...current, observation: event.target.value }))} />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold">State</span>
            <select className={lineInputClass} value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as ExperimentStatus }))}>
              {STATUS_OPTIONS.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
          <div className="flex items-end sm:justify-end"><SubmitButton>Log experiment</SubmitButton></div>
        </form>
      </section>
    </LabFrame>
  );
}
