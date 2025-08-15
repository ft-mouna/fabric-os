"use client";

import React, { useEffect, useMemo, useState } from "react";
import Card, { CardConfig, CardItem } from "@/components/Card";

const cn = (...arr: Array<string | false | undefined>) => arr.filter(Boolean).join(" ");

const defaultConfig: CardConfig = {
  layout: "grid",
  columns: 3,
  draggable: true,
  items: [
    { title: "Investor Profile", subtitle: "Profiles available", count: 1, icon: "FiUser", linkText: "View Investors", linkTarget: "_self" },
    { title: "Foreign Applications", subtitle: "New submissions", count: 61, icon: "FiFileText", linkText: "Create New Application", linkTarget: "_self" },
    { title: "Pending Reviews", subtitle: "Awaiting approval", count: 7, icon: "FiClock", linkText: "Open Queue", linkTarget: "_self" },
  ],
  // Sample API wiring (disabled by default; set a URL to enable)
  fetchData: {
    apiConfig: {
      url: "https://restcountries.com/v3.1/all?fields=name,capital,currencies,lang",
      method: "GET",
      responseMapping: { /* array response; no dataKey needed */ },
    },
    responseStructure: {
      dataPath: "", // when set, takes precedence over responseMapping.dataKey
      patch: {}, // e.g., { title: "name.common" }
    },
    mapping: {
      title: "name", // note: Card will try name.common automatically if available
      subtitle: "region",
      count: "population",
    },
    mergeMode: 'append',
  },
  containerClassName: "",
  gridClassName: "",
  cardClassName: "bg-white",
  iconClassName: "text-[var(--primary)]",
  titleClassName: "",
  subtitleClassName: "text-black/60",
  countClassName: "",
  linkClassName: "btn-primary",
};

// Small Inputs
function TextInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <div className="text-xs text-black/70 mb-1">{label}</div>
      <input className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}
function NumberInput({ label, value, onChange, min = 1, max = 6 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <label className="block">
      <div className="text-xs text-black/70 mb-1">{label}</div>
      <input type="number" min={min} max={max} className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}
function SelectInput({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="block">
      <div className="text-xs text-black/70 mb-1">{label}</div>
      <select className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" className="h-4 w-4" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="text-xs text-black/70">{label}</span>
    </label>
  );
}

export default function CardConfigurator() {
  const [config, setConfig] = useState<CardConfig>(defaultConfig);
  const [jsonDraft, setJsonDraft] = useState<string>(JSON.stringify(defaultConfig, null, 2));
  const [jsonError, setJsonError] = useState<string>("");
  const [autoApply, setAutoApply] = useState<boolean>(true);

  const configJson = useMemo(() => JSON.stringify(config, null, 2), [config]);
  const previewConfig = useMemo(() => ({ ...config, containerized: true }), [config]);

  useEffect(() => {
    setJsonDraft(JSON.stringify(config, null, 2));
  }, [config]);

  const applyJson = () => {
    try {
      const parsed = JSON.parse(jsonDraft);
      setConfig(parsed);
      setJsonError("");
    } catch (e: any) {
      setJsonError(e?.message ?? "Invalid JSON");
    }
  };

  const addItem = () => setConfig((c) => ({ ...c, items: [...(c.items || []), { title: "New", subtitle: "", count: 0, icon: "FiCircle", linkText: "Open" }] }));
  const removeItem = (idx: number) => setConfig((c) => ({ ...c, items: c.items.filter((_, i) => i !== idx) }));
  const updateItem = (idx: number, patch: Partial<CardItem>) => setConfig((c) => ({ ...c, items: c.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)) }));
  const updateFetchApi = (patch: any) => setConfig((c) => ({ ...c, fetchData: { ...(c.fetchData || {}), apiConfig: { ...(c.fetchData?.apiConfig || {}), ...patch } } }));
  const updateFetchMapping = (patch: any) => setConfig((c) => ({ ...c, fetchData: { ...(c.fetchData || {}), mapping: { ...(c.fetchData?.mapping || {}), ...patch } } }));
  const updateFetchResponseStructure = (patch: any) => setConfig((c) => ({ ...c, fetchData: { ...(c.fetchData || {}), responseStructure: { ...(c.fetchData?.responseStructure || {}), ...patch } } }));
  const updateFetchMergeMode = (mode: 'append'|'prepend'|'replace') => setConfig((c) => ({ ...c, fetchData: { ...(c.fetchData || {}), mergeMode: mode } }));

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="text-sm uppercase tracking-wide text-blue-700">Configurator</div>
        <div className="mt-1 text-lg font-semibold text-blue-900">Cards</div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Left: Form */}
        <div className="space-y-4 min-h-0 overflow-auto pr-1">
          <div className="rounded-lg border border-black/10 bg-white p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <SelectInput
                label="Layout"
                value={config.layout ?? "grid"}
                onChange={(v) => setConfig((c) => ({ ...c, layout: v as CardConfig["layout"] }))}
                options={[{ value: "grid", label: "grid" }, { value: "list", label: "list" }]}
              />
              <NumberInput label="Columns" value={config.columns ?? 3} onChange={(v) => setConfig((c) => ({ ...c, columns: v }))} />
              <Toggle label="Enable drag & drop" checked={!!config.draggable} onChange={(v) => setConfig((c) => ({ ...c, draggable: v }))} />
            </div>
          </div>

          <div className="rounded-lg border border-black/10 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-black/80">Items</div>
              <button className="px-2 py-1 text-xs rounded-md bg-blue-600 text-white" onClick={addItem}>+ Add Item</button>
            </div>
            <div className="mt-3 space-y-3">
              {(config.items || []).map((it, i) => (
                <div key={i} className="rounded-md border p-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <TextInput label="Title" value={it.title ?? ""} onChange={(v) => updateItem(i, { title: v })} />
                    <TextInput label="Subtitle" value={it.subtitle ?? ""} onChange={(v) => updateItem(i, { subtitle: v })} />
                    <TextInput label="Icon (react-icons)" value={typeof it.icon === "string" ? it.icon : ""} onChange={(v) => updateItem(i, { icon: v })} />
                    <TextInput label="Count" value={String(it.count ?? "")} onChange={(v) => updateItem(i, { count: v })} />
                    <TextInput label="Link Text" value={it.linkText ?? ""} onChange={(v) => updateItem(i, { linkText: v })} />
                    <TextInput label="Href" value={it.href ?? ""} onChange={(v) => updateItem(i, { href: v })} />
                    <SelectInput label="Link Target" value={(it as any).linkTarget || '_self'} onChange={(v) => updateItem(i, { linkTarget: v as any })} options={[
                      { value: '_self', label: '_self (same tab)' },
                      { value: '_blank', label: '_blank (new tab)' },
                    ]} />
                    <TextInput label="Class (card)" value={it.className ?? ""} onChange={(v) => updateItem(i, { className: v })} />
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button className="px-2 py-1 text-xs rounded-md bg-red-600 text-white" onClick={() => removeItem(i)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fetch Data (API) */}
          <div className="rounded-lg border border-black/10 bg-white p-4">
            <div className="text-sm font-semibold text-black/80 mb-2">Fetch Data (optional)</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <TextInput label="API URL" value={config.fetchData?.apiConfig?.url || ""} onChange={(v) => updateFetchApi({ url: v })} placeholder="https://restcountries.com/v3.1/all" />
              <TextInput label="Method" value={config.fetchData?.apiConfig?.method || "GET"} onChange={(v) => updateFetchApi({ method: v })} placeholder="GET" />
              <TextInput label="Response dataKey (if object)" value={config.fetchData?.apiConfig?.responseMapping?.dataKey || ""} onChange={(v) => updateFetchApi({ responseMapping: { ...(config.fetchData?.apiConfig?.responseMapping || {}), dataKey: v } })} placeholder="results" />
              <TextInput label="Query param: key=value&..." value={Object.entries(config.fetchData?.apiConfig?.queryParams || {}).map(([k, val]) => `${k}=${val}`).join("&")} onChange={(v) => {
                const qp = Object.fromEntries(v.split("&").filter(Boolean).map((p) => p.split("=")).map(([k, val]) => [k, val]));
                updateFetchApi({ queryParams: qp });
              }} placeholder="limit=10&region=asia" />
              <SelectInput label="Merge mode" value={(config.fetchData?.mergeMode as string) || 'append'} onChange={(v) => updateFetchMergeMode(v as any)} options={[
                { value: 'append', label: 'append (static then fetched)' },
                { value: 'prepend', label: 'prepend (fetched then static)' },
                { value: 'replace', label: 'replace (only fetched)' },
              ]} />
              <TextInput label="Response dataPath (takes precedence)" value={config.fetchData?.responseStructure?.dataPath || ""} onChange={(v) => updateFetchResponseStructure({ dataPath: v })} placeholder="results.items" />
              <TextInput label="Patch: key=dot.path&..." value={Object.entries(config.fetchData?.responseStructure?.patch || {}).map(([k, val]) => `${k}=${val}`).join("&")} onChange={(v) => {
                const patch = Object.fromEntries(v.split("&").filter(Boolean).map((p) => p.split("=")).map(([k, val]) => [k, val]));
                updateFetchResponseStructure({ patch });
              }} placeholder="title=name.common&subtitle=region" />
            </div>
            <div className="mt-3 text-xs font-semibold text-black/70">Mapping (API row → card item)</div>
            <div className="mt-1 grid grid-cols-1 md:grid-cols-3 gap-2">
              <TextInput label="title" value={config.fetchData?.mapping?.title || ""} onChange={(v) => updateFetchMapping({ title: v })} placeholder="name or name.common" />
              <TextInput label="subtitle" value={config.fetchData?.mapping?.subtitle || ""} onChange={(v) => updateFetchMapping({ subtitle: v })} placeholder="region" />
              <TextInput label="count" value={config.fetchData?.mapping?.count || ""} onChange={(v) => updateFetchMapping({ count: v })} placeholder="population" />
              <TextInput label="href" value={config.fetchData?.mapping?.href || ""} onChange={(v) => updateFetchMapping({ href: v })} />
              <TextInput label="linkText" value={config.fetchData?.mapping?.linkText || ""} onChange={(v) => updateFetchMapping({ linkText: v })} />
              <SelectInput label="linkTarget" value={(config.fetchData?.mapping as any)?.linkTarget || ''} onChange={(v) => updateFetchMapping({ linkTarget: v })} options={[
                { value: '', label: '(inherit default)' },
                { value: '_self', label: '_self (same tab)' },
                { value: '_blank', label: '_blank (new tab)' },
              ]} />
              <TextInput label="icon" value={config.fetchData?.mapping?.icon || ""} onChange={(v) => updateFetchMapping({ icon: v })} />
            </div>
            <div className="mt-2 text-xs text-black/60">Leave URL empty to use static items above. When URL is set, fetched data will replace items in preview.</div>
          </div>

          <div className="rounded-lg border border-black/10 bg-white p-4">
            <div className="text-sm font-semibold text-black/80 mb-2">Class overrides</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <TextInput label="containerClassName" value={config.containerClassName ?? ""} onChange={(v) => setConfig((c) => ({ ...c, containerClassName: v }))} />
              <TextInput label="gridClassName" value={config.gridClassName ?? ""} onChange={(v) => setConfig((c) => ({ ...c, gridClassName: v }))} />
              <TextInput label="cardClassName" value={config.cardClassName ?? ""} onChange={(v) => setConfig((c) => ({ ...c, cardClassName: v }))} />
              <TextInput label="iconClassName" value={config.iconClassName ?? ""} onChange={(v) => setConfig((c) => ({ ...c, iconClassName: v }))} />
              <TextInput label="titleClassName" value={config.titleClassName ?? ""} onChange={(v) => setConfig((c) => ({ ...c, titleClassName: v }))} />
              <TextInput label="subtitleClassName" value={config.subtitleClassName ?? ""} onChange={(v) => setConfig((c) => ({ ...c, subtitleClassName: v }))} />
              <TextInput label="countClassName" value={config.countClassName ?? ""} onChange={(v) => setConfig((c) => ({ ...c, countClassName: v }))} />
              <TextInput label="linkClassName" value={config.linkClassName ?? ""} onChange={(v) => setConfig((c) => ({ ...c, linkClassName: v }))} />
            </div>
          </div>
        </div>

        {/* Right: JSON + Preview */}
        <div className="space-y-4 min-h-0 overflow-auto">
          <div className="rounded-lg border border-black/10 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-black/80">JSON</div>
              <button className="px-2 py-1 text-xs rounded-md bg-blue-600 text-white" onClick={applyJson}>Apply</button>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <input id="autoApply" type="checkbox" className="h-3 w-3" checked={autoApply} onChange={(e) => setAutoApply(e.target.checked)} />
              <label htmlFor="autoApply" className="text-black/70">Auto apply JSON changes</label>
            </div>
            <textarea
              className="mt-2 h-56 w-full rounded-md border border-gray-300 bg-white p-2 font-mono text-xs"
              value={jsonDraft}
              onChange={(e) => {
                const v = e.target.value;
                setJsonDraft(v);
                if (autoApply) {
                  try {
                    const parsed = JSON.parse(v);
                    setConfig(parsed);
                    setJsonError("");
                  } catch (err: any) {
                    setJsonError(err?.message ?? "Invalid JSON");
                  }
                }
              }}
            />
            {jsonError && <div className="mt-2 text-xs text-red-600">{jsonError}</div>}
            <div className="mt-2">
              <div className="text-xs text-black/60">Current</div>
              <pre className="mt-1 max-h-40 overflow-auto rounded bg-gray-50 p-2 text-xs text-black/80">{configJson}</pre>
            </div>
          </div>

          <div className="rounded-lg border border-black/10 bg-white p-4">
            <div className="text-sm font-semibold text-black/80">Live Preview</div>
            <div className="mt-3 border rounded-md overflow-hidden relative min-h-[280px] p-4">
              <Card config={previewConfig} onReorder={(items) => setConfig((c) => ({ ...c, items }))} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
