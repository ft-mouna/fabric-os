"use client";

import React, { useMemo, useState } from "react";
import Modal, { ModalConfig } from "@/components/Modal";

const cn = (...arr: Array<string | false | undefined>) => arr.filter(Boolean).join(" ");

const defaultConfig: ModalConfig = {
  open: false,
  closeOnBackdrop: true,
  size: "md",
  title: "Example Modal",
  subtitle: "This is a configurable modal",
  body: "<p>You can place <strong>HTML</strong> content here.</p>",
  actions: [
    { text: "OK", linkTarget: "_self" },
    { text: "Cancel", linkTarget: "_self" }
  ],
  fetchData: {
    apiConfig: {
      url: "",
      method: "GET",
      responseMapping: {}
    },
    responseStructure: { dataPath: "", patch: {} },
    mapping: {
      title: "title",
      subtitle: "subtitle",
      body: "body",
      primaryText: "=OK",
      secondaryText: "=Cancel"
    },
    mergeMode: "append"
  }
};

function TextInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block text-xs">
      <span className="block mb-1 text-black/70">{label}</span>
      <input className="w-full rounded-md border px-2 py-1 text-sm" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}
function AreaInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block text-xs">
      <span className="block mb-1 text-black/70">{label}</span>
      <textarea className="w-full rounded-md border px-2 py-1 text-sm min-h-[80px]" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}
function SelectInput({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="block text-xs">
      <span className="block mb-1 text-black/70">{label}</span>
      <select className="w-full rounded-md border px-2 py-1 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

export default function ModalConfigurator() {
  const [config, setConfig] = useState<ModalConfig>(defaultConfig);
  const [jsonText, setJsonText] = useState<string>(JSON.stringify(defaultConfig, null, 2));

  const applyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setConfig(parsed);
    } catch (e) {
      alert("Invalid JSON");
    }
  };

  React.useEffect(() => {
    setJsonText(JSON.stringify(config, null, 2));
  }, [config]);

  // Updaters
  const update = (patch: Partial<ModalConfig>) => setConfig((c) => ({ ...c, ...patch }));
  const updateFetchApi = (patch: any) => setConfig((c) => ({ ...c, fetchData: { ...(c.fetchData || {}), apiConfig: { ...(c.fetchData?.apiConfig || {}), ...patch } } }));
  const updateFetchResponseStructure = (patch: any) => setConfig((c) => ({ ...c, fetchData: { ...(c.fetchData || {}), responseStructure: { ...(c.fetchData?.responseStructure || {}), ...patch } } }));
  const updateFetchMapping = (patch: any) => setConfig((c) => ({ ...c, fetchData: { ...(c.fetchData || {}), mapping: { ...(c.fetchData?.mapping || {}), ...patch } } }));
  const updateFetchMergeMode = (mode: 'append'|'prepend'|'replace') => setConfig((c) => ({ ...c, fetchData: { ...(c.fetchData || {}), mergeMode: mode } }));

  const addAction = () => update({ actions: [ ...(config.actions || []), { text: "Action", linkTarget: "_self" } ] });
  const updateAction = (idx: number, patch: any) => update({ actions: (config.actions || []).map((a, i) => i === idx ? { ...a, ...patch } : a) });
  const removeAction = (idx: number) => update({ actions: (config.actions || []).filter((_, i) => i !== idx) });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-4">
        <div className="rounded-lg border border-black/10 bg-white p-4">
          <div className="text-sm font-semibold">Modal</div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
            <SelectInput label="Open" value={config.open ? 'true' : 'false'} onChange={(v) => update({ open: v === 'true' })} options={[{ value: 'true', label: 'true' }, { value: 'false', label: 'false' }]} />
            <SelectInput label="Close on Backdrop" value={config.closeOnBackdrop ? 'true' : 'false'} onChange={(v) => update({ closeOnBackdrop: v === 'true' })} options={[{ value: 'true', label: 'true' }, { value: 'false', label: 'false' }]} />
            <SelectInput label="Size" value={config.size || 'md'} onChange={(v) => update({ size: v as any })} options={[
              { value: 'sm', label: 'sm' }, { value: 'md', label: 'md' }, { value: 'lg', label: 'lg' }, { value: 'xl', label: 'xl' }
            ]} />
          </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
            <TextInput label="Title" value={config.title || ''} onChange={(v) => update({ title: v })} />
            <TextInput label="Subtitle" value={config.subtitle || ''} onChange={(v) => update({ subtitle: v })} />
            <AreaInput label="Body (HTML allowed)" value={config.body || ''} onChange={(v) => update({ body: v })} />
          </div>
        </div>

        <div className="rounded-lg border border-black/10 bg-white p-4">
          <div className="text-sm font-semibold">Actions</div>
          <div className="mt-2 space-y-3">
            {(config.actions || []).map((a, i) => (
              <div key={i} className="rounded-md border p-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <TextInput label="Text" value={a.text || ''} onChange={(v) => updateAction(i, { text: v })} />
                  <TextInput label="Href" value={a.href || ''} onChange={(v) => updateAction(i, { href: v })} />
                  <SelectInput label="Target" value={a.linkTarget || '_self'} onChange={(v) => updateAction(i, { linkTarget: v as any })} options={[
                    { value: '_self', label: '_self' }, { value: '_blank', label: '_blank' }
                  ]} />
                  <TextInput label="Class" value={a.className || ''} onChange={(v) => updateAction(i, { className: v })} />
                </div>
                <div className="mt-2 flex justify-end">
                  <button className="px-2 py-1 text-xs rounded-md bg-red-600 text-white" onClick={() => removeAction(i)}>Remove</button>
                </div>
              </div>
            ))}
            <button className="px-2 py-1 text-xs rounded-md bg-blue-600 text-white" onClick={addAction}>Add Action</button>
          </div>
        </div>

        <div className="rounded-lg border border-black/10 bg-white p-4">
          <div className="text-sm font-semibold">Fetch Data</div>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
            <TextInput label="URL" value={config.fetchData?.apiConfig?.url || ''} onChange={(v) => updateFetchApi({ url: v })} />
            <TextInput label="Method" value={config.fetchData?.apiConfig?.method || 'GET'} onChange={(v) => updateFetchApi({ method: v })} />
            <TextInput label="Query Params (k=v&...)" value={Object.entries(config.fetchData?.apiConfig?.queryParams || {}).map(([k, val]) => `${k}=${val}`).join("&")} onChange={(v) => {
              const qp = Object.fromEntries(v.split('&').filter(Boolean).map((p) => p.split('=')).map(([k, val]) => [k, val]));
              updateFetchApi({ queryParams: qp });
            }} />
            <SelectInput label="Merge mode (actions)" value={(config.fetchData?.mergeMode as string) || 'append'} onChange={(v) => updateFetchMergeMode(v as any)} options={[
              { value: 'append', label: 'append' }, { value: 'prepend', label: 'prepend' }, { value: 'replace', label: 'replace' }
            ]} />
          </div>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
            <TextInput label="Response dataPath" value={config.fetchData?.responseStructure?.dataPath || ''} onChange={(v) => updateFetchResponseStructure({ dataPath: v })} />
            <TextInput label="Patch (k=dot.path&...)" value={Object.entries(config.fetchData?.responseStructure?.patch || {}).map(([k, val]) => `${k}=${val}`).join("&")} onChange={(v) => {
              const patch = Object.fromEntries(v.split('&').filter(Boolean).map((p) => p.split('=')).map(([k, val]) => [k, val]));
              updateFetchResponseStructure({ patch });
            }} />
          </div>
          <div className="mt-2 text-xs font-semibold text-black/70">Mapping</div>
          <div className="mt-1 grid grid-cols-1 md:grid-cols-3 gap-2">
            <TextInput label="title" value={config.fetchData?.mapping?.title || ''} onChange={(v) => updateFetchMapping({ title: v })} />
            <TextInput label="subtitle" value={config.fetchData?.mapping?.subtitle || ''} onChange={(v) => updateFetchMapping({ subtitle: v })} />
            <TextInput label="body" value={config.fetchData?.mapping?.body || ''} onChange={(v) => updateFetchMapping({ body: v })} />
            <TextInput label="primaryText" value={(config.fetchData?.mapping as any)?.primaryText || ''} onChange={(v) => updateFetchMapping({ primaryText: v })} />
            <TextInput label="primaryHref" value={(config.fetchData?.mapping as any)?.primaryHref || ''} onChange={(v) => updateFetchMapping({ primaryHref: v })} />
            <TextInput label="primaryLinkTarget" value={(config.fetchData?.mapping as any)?.primaryLinkTarget || ''} onChange={(v) => updateFetchMapping({ primaryLinkTarget: v })} />
            <TextInput label="secondaryText" value={(config.fetchData?.mapping as any)?.secondaryText || ''} onChange={(v) => updateFetchMapping({ secondaryText: v })} />
            <TextInput label="secondaryHref" value={(config.fetchData?.mapping as any)?.secondaryHref || ''} onChange={(v) => updateFetchMapping({ secondaryHref: v })} />
            <TextInput label="secondaryLinkTarget" value={(config.fetchData?.mapping as any)?.secondaryLinkTarget || ''} onChange={(v) => updateFetchMapping({ secondaryLinkTarget: v })} />
          </div>
        </div>

        <div className="rounded-lg border border-black/10 bg-white p-4">
          <div className="text-sm font-semibold">Config JSON</div>
          <div className="mt-2">
            <textarea className="w-full rounded-md border px-2 py-1 text-xs min-h-[240px] font-mono" value={jsonText} onChange={(e) => setJsonText(e.target.value)} />
          </div>
          <div className="mt-2 flex gap-2">
            <button className="px-2 py-1 text-xs rounded-md bg-blue-600 text-white" onClick={applyJson}>Apply</button>
            <button className="px-2 py-1 text-xs rounded-md bg-green-600 text-white" onClick={() => update({ open: true })}>Open Modal</button>
            <button className="px-2 py-1 text-xs rounded-md bg-gray-600 text-white" onClick={() => update({ open: false })}>Close Modal</button>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="sticky top-2 rounded-lg border border-black/10 bg-white p-4 min-h-[200px]">
          <div className="text-sm font-semibold">Preview</div>
          <div className="mt-2">
            <Modal config={config} />
          </div>
        </div>
      </div>
    </div>
  );
}
