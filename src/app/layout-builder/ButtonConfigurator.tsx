"use client";

import React, { useMemo, useState } from "react";
import ButtonGroup from "../../components/ButtonGroup";

export type ButtonItem = {
  id?: string;
  label?: string;
  value?: string;
  variant?: "text" | "secondary" | "primary" | "outline" | "danger" | "success" | "warning";
  type?: "button" | "submit" | "reset";
  actiontype?: string;
  path?: string;
  href?: string;
  route?: string;
  disabled?: boolean;
  size?: string;
  tw?: string;
};

export default function ButtonConfigurator() {
  const [current, setCurrent] = useState<ButtonItem>({ value: "", variant: "primary", type: "button" });
  const [items, setItems] = useState<ButtonItem[]>([]);

  const addItem = () => {
    if (!current.value && !current.label) return;
    setItems((prev) => [...prev, { ...current, id: current.id || `btn-${prev.length + 1}` }]);
  };

  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));
  const clearAll = () => setItems([]);

  const output = useMemo(() => {
    return {
      type: "buttonGroup",
      props: {
        gap: 12,
        btnConfig: items,
      },
    };
  }, [items]);

  return (
    <div className="grid gap-6">
      {/* Form */}
      <div className="rounded-lg border border-black/10 bg-white p-4">
        <div className="mb-3 text-sm font-medium">Add Button</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className="h-9 rounded border border-black/15 px-2 text-sm"
            placeholder="id (optional)"
            value={current.id || ""}
            onChange={(e) => setCurrent({ ...current, id: e.target.value })}
          />
          <input
            className="h-9 rounded border border-black/15 px-2 text-sm"
            placeholder="label/value"
            value={current.label ?? current.value ?? ""}
            onChange={(e) => setCurrent({ ...current, label: e.target.value, value: e.target.value })}
          />
          <select
            className="h-9 rounded border border-black/15 px-2 text-sm bg-white"
            value={current.variant || "primary"}
            onChange={(e) => setCurrent({ ...current, variant: e.target.value as ButtonItem["variant"] })}
          >
            <option value="primary">primary</option>
            <option value="secondary">secondary</option>
            <option value="outline">outline</option>
            <option value="text">text</option>
            <option value="danger">danger</option>
            <option value="success">success</option>
            <option value="warning">warning</option>
          </select>
          <select
            className="h-9 rounded border border-black/15 px-2 text-sm bg-white"
            value={current.type || "button"}
            onChange={(e) => setCurrent({ ...current, type: e.target.value as ButtonItem["type"] })}
          >
            <option value="button">button</option>
            <option value="submit">submit</option>
            <option value="reset">reset</option>
          </select>
          <input
            className="h-9 rounded border border-black/15 px-2 text-sm"
            placeholder="actiontype (navigation/save/submit/cancel)"
            value={current.actiontype || ""}
            onChange={(e) => setCurrent({ ...current, actiontype: e.target.value })}
          />
          <input
            className="h-9 rounded border border-black/15 px-2 text-sm"
            placeholder="path/href/route"
            value={current.path || current.href || current.route || ""}
            onChange={(e) => setCurrent({ ...current, path: e.target.value })}
          />
          <input
            className="h-9 rounded border border-black/15 px-2 text-sm"
            placeholder="size (sm/md/lg)"
            value={current.size || ""}
            onChange={(e) => setCurrent({ ...current, size: e.target.value })}
          />
          <input
            className="h-9 rounded border border-black/15 px-2 text-sm"
            placeholder="tw override classes"
            value={current.tw || ""}
            onChange={(e) => setCurrent({ ...current, tw: e.target.value })}
          />
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!current.disabled}
              onChange={(e) => setCurrent({ ...current, disabled: e.target.checked })}
            />
            disabled
          </label>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button className="rounded bg-blue-600 text-white text-sm px-3 py-1.5 hover:bg-blue-700" onClick={addItem}>
            Add Button
          </button>
          <button className="rounded border border-black/15 text-sm px-3 py-1.5 hover:bg-black/[.04]" onClick={clearAll}>
            Clear
          </button>
        </div>
      </div>

      {/* Current list */}
      <div className="rounded-lg border border-black/10 bg-white p-4">
        <div className="mb-3 text-sm font-medium">Buttons</div>
        {items.length === 0 ? (
          <div className="text-sm text-black/60">No buttons added yet.</div>
        ) : (
          <ul className="space-y-2">
            {items.map((b, i) => (
              <li key={i} className="flex items-center justify-between rounded border border-black/10 px-3 py-2 text-sm">
                <div className="truncate">
                  <span className="font-medium">{b.label || b.value}</span>
                  <span className="text-black/60"> · {b.variant || "primary"}</span>
                  {b.actiontype ? <span className="text-black/60"> · {b.actiontype}</span> : null}
                </div>
                <button className="text-red-600 hover:underline" onClick={() => removeItem(i)}>Remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* JSON + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border border-black/10 bg-white p-4">
          <div className="mb-2 text-sm font-medium">Generated JSON</div>
          <pre className="max-h-72 overflow-auto rounded bg-black/[.03] p-3 text-xs leading-relaxed">
{JSON.stringify(output, null, 2)}
          </pre>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-4">
          <div className="mb-2 text-sm font-medium">Live Preview</div>
          <ButtonGroup buttons={items} />
        </div>
      </div>
    </div>
  );
}
