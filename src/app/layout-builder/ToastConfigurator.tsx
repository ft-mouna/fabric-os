"use client";

import React, { useState } from "react";
import Toast, { ToastConfig } from "@/components/Toast";
import { ToastProvider } from "@/sample/common/ToastContext";
import Toaster from "@/sample/common/Toaster";

const defaultConfig: ToastConfig = {
  message: "Saved successfully!",
  type: "info",
  duration: 3000,
  position: "top-right",
  triggerOnMount: false,
  fetchData: {
    apiConfig: { url: "", method: "GET", responseMapping: {} },
    responseStructure: { dataPath: "", patch: {} },
    mapping: { message: "message", type: "type", duration: "duration", position: "position" }
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

export default function ToastConfigurator() {
  const [config, setConfig] = useState<ToastConfig>(defaultConfig);
  const [jsonText, setJsonText] = useState<string>(JSON.stringify(defaultConfig, null, 2));

  const applyJson = () => {
    try { setConfig(JSON.parse(jsonText)); } catch { alert("Invalid JSON"); }
  };
  React.useEffect(() => { setJsonText(JSON.stringify(config, null, 2)); }, [config]);

  const update = (patch: Partial<ToastConfig>) => setConfig((c) => ({ ...c, ...patch }));
  const updateFetchApi = (patch: any) => setConfig((c) => ({ ...c, fetchData: { ...(c.fetchData||{}), apiConfig: { ...(c.fetchData?.apiConfig||{}), ...patch } } }));
  const updateFetchRS = (patch: any) => setConfig((c) => ({ ...c, fetchData: { ...(c.fetchData||{}), responseStructure: { ...(c.fetchData?.responseStructure||{}), ...patch } } }));
  const updateFetchMap = (patch: any) => setConfig((c) => ({ ...c, fetchData: { ...(c.fetchData||{}), mapping: { ...(c.fetchData?.mapping||{}), ...patch } } }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-4">
        <div className="rounded-lg border border-black/10 bg-white p-4">
          <div className="text-sm font-semibold">Toast</div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
            <TextInput label="Message" value={config.message || ''} onChange={(v) => update({ message: v })} />
            <SelectInput label="Type" value={config.type || 'info'} onChange={(v) => update({ type: v as any })} options={[
              { value: 'info', label: 'info' }, { value: 'success', label: 'success' }, { value: 'warning', label: 'warning' }, { value: 'error', label: 'error' }
            ]} />
            <SelectInput label="Position" value={config.position || 'top-right'} onChange={(v) => update({ position: v as any })} options={[
              { value: 'top-right', label: 'top-right' }, { value: 'top-left', label: 'top-left' }, { value: 'bottom-right', label: 'bottom-right' }, { value: 'bottom-left', label: 'bottom-left' }, { value: 'top-center', label: 'top-center' }, { value: 'bottom-center', label: 'bottom-center' }
            ]} />
            <TextInput label="Duration (ms)" value={String(config.duration || 3000)} onChange={(v) => update({ duration: Number(v) })} />
            <SelectInput label="Trigger on Mount" value={config.triggerOnMount ? 'true' : 'false'} onChange={(v) => update({ triggerOnMount: v === 'true' })} options={[{ value: 'true', label: 'true' }, { value: 'false', label: 'false' }]} />
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
          </div>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
            <TextInput label="Response dataPath" value={config.fetchData?.responseStructure?.dataPath || ''} onChange={(v) => updateFetchRS({ dataPath: v })} />
            <TextInput label="Patch (k=dot.path&...)" value={Object.entries(config.fetchData?.responseStructure?.patch || {}).map(([k, val]) => `${k}=${val}`).join("&")} onChange={(v) => {
              const patch = Object.fromEntries(v.split('&').filter(Boolean).map((p) => p.split('=')).map(([k, val]) => [k, val]));
              updateFetchRS({ patch });
            }} />
          </div>
          <div className="mt-2 text-xs font-semibold text-black/70">Mapping</div>
          <div className="mt-1 grid grid-cols-1 md:grid-cols-3 gap-2">
            <TextInput label="message" value={config.fetchData?.mapping?.message || ''} onChange={(v) => updateFetchMap({ message: v })} />
            <TextInput label="type" value={config.fetchData?.mapping?.type || ''} onChange={(v) => updateFetchMap({ type: v })} />
            <TextInput label="duration" value={config.fetchData?.mapping?.duration || ''} onChange={(v) => updateFetchMap({ duration: v })} />
            <TextInput label="position" value={config.fetchData?.mapping?.position || ''} onChange={(v) => updateFetchMap({ position: v })} />
          </div>
        </div>

        <div className="rounded-lg border border-black/10 bg-white p-4">
          <div className="text-sm font-semibold">Config JSON</div>
          <div className="mt-2">
            <textarea className="w-full rounded-md border px-2 py-1 text-xs min-h-[240px] font-mono" value={jsonText} onChange={(e) => setJsonText(e.target.value)} />
          </div>
          <div className="mt-2 flex gap-2">
            <button className="px-2 py-1 text-xs rounded-md bg-blue-600 text-white" onClick={applyJson}>Apply</button>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="sticky top-2 rounded-lg border border-black/10 bg-white p-4 min-h-[200px]">
          <div className="text-sm font-semibold">Preview</div>
          <div className="mt-2">
            <ToastProvider>
              <Toaster />
              <Toast config={config} />
            </ToastProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
