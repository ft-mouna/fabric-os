"use client";

import React, { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import { ThemeContext } from "@/sample/common/ThemeWrapper";

// Types mirror Header.tsx config
interface NavAction {
  source?: "navigation" | "client" | "custom";
  path?: string;
  functionName?: string;
  [key: string]: any;
}

interface NavItem {
  type?: "info" | "link" | "signout";
  label: string;
  href?: string;
  dropdown?: NavItem[];
  icon?: string;
  condition?: boolean | string;
  value?: any;
  action?: NavAction[];
  onClick?: never;
  [key: string]: any;
}

interface Profile {
  name?: string;
  avatar: string;
  menuItems: NavItem[];
}

interface HeaderConfig {
  companyName: string;
  navItems: NavItem[];
  profile: Profile;
  additionalFeatures?: React.ReactNode;
  headerClassName?: string;
  navItemsClassName?: string;
  dropdownClassName?: string;
  profileClassName?: string;
  navPosition?: "left" | "center" | "right";
  layout?: "top" | "side-left" | "side-right";
  navOrientation?: "top" | "left" | "right";
  containerClassName?: string;
  brandClassName?: string;
  menuButtonClassName?: string;
  [key: string]: any;
}

const defaultConfig: HeaderConfig = {
  companyName: "ICICI",
  navItems: [
    { type: "link", label: "Home", icon: "MdHome", href: "/" },
    {
      label: "Products",
      icon: "FaBoxes",
      dropdown: [
        {
          type: "link",
          label: "Catalog",
          icon: "FiList",
          action: [{ source: "navigation", path: "/catalog" }],
        },
      ],
    },
    {
      label: "Refresh",
      icon: "FiRefreshCcw",
      action: [{ source: "client", functionName: "refreshData" }],
    },
  ],
  profile: {
    name: "John Doe",
    avatar: "/images/avatar.svg",
    menuItems: [
      { type: "link", label: "Profile", icon: "FiUser", href: "/profile" },
      {
        type: "signout",
        label: "Sign Out",
        icon: "FiLogOut",
        action: [{ source: "client", functionName: "appSignOut" }],
      },
    ],
  },
  layout: "top",
  navPosition: "right",
  headerClassName: "bg-white border-b border-gray-200 text-black",
  containerClassName: "mx-auto max-w-6xl px-4",
  navItemsClassName: "flex items-center gap-1",
  dropdownClassName: "bg-white text-black shadow-lg ring-1 ring-black/5 rounded-md py-1",
  profileClassName: "ml-auto flex items-center gap-2",
  brandClassName: "flex items-center gap-3 py-2",
  menuButtonClassName:
    "inline-flex items-center justify-center rounded-md p-2 text-black hover:bg-gray-100 md:hidden",
};

function TextInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block text-sm">
      <span className="text-black/70">{label}</span>
      <input
        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function SelectInput({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="block text-sm">
      <span className="text-black/70">{label}</span>
      <select
        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function HeaderConfigurator() {
  const [config, setConfig] = useState<HeaderConfig>(defaultConfig);
  const [jsonDraft, setJsonDraft] = useState<string>(JSON.stringify(defaultConfig, null, 2));
  const [jsonError, setJsonError] = useState<string>("");
  const [autoApply, setAutoApply] = useState<boolean>(true);

  // Sync form -> JSON
  const configJson = useMemo(() => JSON.stringify(config, null, 2), [config]);
  const previewConfig = useMemo(() => ({ ...config, containerized: true }), [config]);

  // Keep the editable JSON draft in sync with the form values
  useEffect(() => {
    setJsonDraft(JSON.stringify(config, null, 2));
  }, [config]);

  // Sync JSON -> form
  const applyJson = () => {
    try {
      const parsed = JSON.parse(jsonDraft);
      setConfig(parsed);
      setJsonError("");
    } catch (e: any) {
      setJsonError(e?.message ?? "Invalid JSON");
    }
  };

  // NavItems helpers
  const addNavItem = () => {
    setConfig((c) => ({
      ...c,
      navItems: [...c.navItems, { type: "link", label: "New", href: "#", icon: "FiCircle" }],
    }));
  };
  const removeNavItem = (idx: number) => {
    setConfig((c) => ({ ...c, navItems: c.navItems.filter((_, i) => i !== idx) }));
  };
  const updateNavItem = (idx: number, patch: Partial<NavItem>) => {
    setConfig((c) => ({
      ...c,
      navItems: c.navItems.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    }));
  };
  const addDropdownItem = (idx: number) => {
    setConfig((c) => ({
      ...c,
      navItems: c.navItems.map((it, i) =>
        i === idx ? { ...it, dropdown: [...(it.dropdown ?? []), { type: "link", label: "Child", href: "#", icon: "FiChevronRight" }] } : it
      ),
    }));
  };
  const removeDropdownItem = (idx: number, dIdx: number) => {
    setConfig((c) => ({
      ...c,
      navItems: c.navItems.map((it, i) =>
        i === idx ? { ...it, dropdown: (it.dropdown ?? []).filter((_, j) => j !== dIdx) } : it
      ),
    }));
  };
  const updateDropdownItem = (idx: number, dIdx: number, patch: Partial<NavItem>) => {
    setConfig((c) => ({
      ...c,
      navItems: c.navItems.map((it, i) =>
        i === idx
          ? { ...it, dropdown: (it.dropdown ?? []).map((d, j) => (j === dIdx ? { ...d, ...patch } : d)) }
          : it
      ),
    }));
  };
  const addAction = (idx: number, dIdx?: number) => {
    const add = (actions?: NavAction[]): NavAction[] => ([
      ...(actions ?? []),
      { source: "navigation" as const, path: "/" },
    ]);
    setConfig((c) => ({
      ...c,
      navItems: c.navItems.map((it, i) => {
        if (i !== idx) return it;
        if (dIdx === undefined) return { ...it, action: add(it.action) };
        const dropdown = (it.dropdown ?? []).map((d, j) => (j === dIdx ? { ...d, action: add(d.action) } : d));
        return { ...it, dropdown };
      }),
    }));
  };
  const updateAction = (idx: number, aIdx: number, patch: Partial<NavAction>, dIdx?: number) => {
    setConfig((c) => ({
      ...c,
      navItems: c.navItems.map((it, i) => {
        if (i !== idx) return it;
        if (dIdx === undefined) {
          const action = (it.action ?? []).map((a, k) => (k === aIdx ? { ...a, ...patch } : a));
          return { ...it, action };
        }
        const dropdown = (it.dropdown ?? []).map((d, j) =>
          j === dIdx ? { ...d, action: (d.action ?? []).map((a, k) => (k === aIdx ? { ...a, ...patch } : a)) } : d
        );
        return { ...it, dropdown };
      }),
    }));
  };
  const removeAction = (idx: number, aIdx: number, dIdx?: number) => {
    setConfig((c) => ({
      ...c,
      navItems: c.navItems.map((it, i) => {
        if (i !== idx) return it;
        if (dIdx === undefined) return { ...it, action: (it.action ?? []).filter((_, k) => k !== aIdx) };
        const dropdown = (it.dropdown ?? []).map((d, j) => (j === dIdx ? { ...d, action: (d.action ?? []).filter((_, k) => k !== aIdx) } : d));
        return { ...it, dropdown };
      }),
    }));
  };

  // Profile menu helpers
  const addProfileItem = () => {
    setConfig((c) => ({
      ...c,
      profile: {
        ...c.profile,
        menuItems: [...c.profile.menuItems, { type: "link", label: "New", href: "#", icon: "FiCircle" }],
      },
    }));
  };
  const removeProfileItem = (idx: number) => {
    setConfig((c) => ({
      ...c,
      profile: { ...c.profile, menuItems: c.profile.menuItems.filter((_, i) => i !== idx) },
    }));
  };
  const updateProfileItem = (idx: number, patch: Partial<NavItem>) => {
    setConfig((c) => ({
      ...c,
      profile: {
        ...c.profile,
        menuItems: c.profile.menuItems.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
      },
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Form */}
      <div className="rounded-lg border border-black/10 bg-white p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TextInput label="Company Name" value={config.companyName} onChange={(v) => setConfig({ ...config, companyName: v })} />
          <TextInput label="Header Class" value={config.headerClassName ?? ""} onChange={(v) => setConfig({ ...config, headerClassName: v })} />
          <TextInput label="Container Class" value={config.containerClassName ?? ""} onChange={(v) => setConfig({ ...config, containerClassName: v })} />
          <TextInput label="Brand Class" value={config.brandClassName ?? ""} onChange={(v) => setConfig({ ...config, brandClassName: v })} />
          <TextInput label="Nav Items Class" value={config.navItemsClassName ?? ""} onChange={(v) => setConfig({ ...config, navItemsClassName: v })} />
          <TextInput label="Dropdown Class" value={config.dropdownClassName ?? ""} onChange={(v) => setConfig({ ...config, dropdownClassName: v })} />
          <TextInput label="Profile Menu Class" value={config.profileClassName ?? ""} onChange={(v) => setConfig({ ...config, profileClassName: v })} />
          <TextInput label="Menu Button Class" value={config.menuButtonClassName ?? ""} onChange={(v) => setConfig({ ...config, menuButtonClassName: v })} />
          <SelectInput
            label="Layout"
            value={config.layout ?? "top"}
            onChange={(v) => setConfig({ ...config, layout: v as HeaderConfig["layout"] })}
            options={[{ value: "top", label: "Top" }, { value: "side-left", label: "Side Left" }, { value: "side-right", label: "Side Right" }]}
          />
          <SelectInput
            label="Nav Position"
            value={config.navPosition ?? "right"}
            onChange={(v) => setConfig({ ...config, navPosition: v as HeaderConfig["navPosition"] })}
            options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]}
          />
          <SelectInput
            label="Nav Orientation"
            value={config.navOrientation ?? "top"}
            onChange={(v) => setConfig({ ...config, navOrientation: v as HeaderConfig["navOrientation"] })}
            options={[{ value: "top", label: "Top" }, { value: "left", label: "Left" }, { value: "right", label: "Right" }]}
          />
        </div>

        {/* Profile */}
        <div className="mt-4 border-t pt-4">
          <div className="text-sm font-semibold text-black/80">Profile</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <TextInput label="Name" value={config.profile.name ?? ""} onChange={(v) => setConfig({ ...config, profile: { ...config.profile, name: v } })} />
            <TextInput label="Avatar URL" value={config.profile.avatar} onChange={(v) => setConfig({ ...config, profile: { ...config.profile, avatar: v } })} />
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Profile Menu Items</div>
              <button className="px-2 py-1 text-xs rounded-md bg-blue-600 text-white" onClick={addProfileItem}>+ Add</button>
            </div>
            <div className="mt-2 space-y-2">
              {config.profile.menuItems.map((it, i) => (
                <div key={i} className="rounded-md border p-2 grid grid-cols-1 md:grid-cols-5 gap-2">
                  <SelectInput
                    label="Type"
                    value={it.type ?? "link"}
                    onChange={(v) => updateProfileItem(i, { type: v as NavItem["type"] })}
                    options={[{ value: "link", label: "link" }, { value: "signout", label: "signout" }, { value: "info", label: "info" }]}
                  />
                  <TextInput label="Label" value={it.label} onChange={(v) => updateProfileItem(i, { label: v })} />
                  <TextInput label="Icon" value={(it.icon as string) ?? ""} onChange={(v) => updateProfileItem(i, { icon: v })} />
                  <TextInput label="Href" value={it.href ?? ""} onChange={(v) => updateProfileItem(i, { href: v })} />
                  <div className="flex items-end">
                    <button className="px-2 py-1 text-xs rounded-md bg-red-600 text-white" onClick={() => removeProfileItem(i)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <div className="mt-6 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-black/80">Navigation Items</div>
            <button className="px-2 py-1 text-xs rounded-md bg-blue-600 text-white" onClick={addNavItem}>+ Add</button>
          </div>

          <div className="mt-3 space-y-3">
            {config.navItems.map((it, i) => (
              <div key={i} className="rounded-md border p-3">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                  <SelectInput
                    label="Type"
                    value={it.type ?? "link"}
                    onChange={(v) => updateNavItem(i, { type: v as NavItem["type"] })}
                    options={[{ value: "link", label: "link" }, { value: "signout", label: "signout" }, { value: "info", label: "info" }]}
                  />
                  <TextInput label="Label" value={it.label} onChange={(v) => updateNavItem(i, { label: v })} />
                  <TextInput label="Icon" value={it.icon ?? ""} onChange={(v) => updateNavItem(i, { icon: v })} />
                  <TextInput label="Href" value={it.href ?? ""} onChange={(v) => updateNavItem(i, { href: v })} />
                  <TextInput label="Condition (string/expr)" value={(it.condition as string) ?? ""} onChange={(v) => updateNavItem(i, { condition: v })} />
                  <div className="flex items-end">
                    <button className="px-2 py-1 text-xs rounded-md bg-red-600 text-white" onClick={() => removeNavItem(i)}>Remove</button>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium">Actions</div>
                    <button className="px-2 py-1 text-xs rounded-md bg-blue-500 text-white" onClick={() => addAction(i)}>+ Add Action</button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {(it.action ?? []).map((a, k) => (
                      <div key={k} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <SelectInput
                          label="Source"
                          value={a.source ?? "navigation"}
                          onChange={(v) => updateAction(i, k, { source: v as NavAction["source"] })}
                          options={[{ value: "navigation", label: "navigation" }, { value: "client", label: "client" }, { value: "custom", label: "custom" }]}
                        />
                        <TextInput label="Path" value={a.path ?? ""} onChange={(v) => updateAction(i, k, { path: v })} />
                        <TextInput label="Function Name" value={a.functionName ?? ""} onChange={(v) => updateAction(i, k, { functionName: v })} />
                        <div className="flex items-end">
                          <button className="px-2 py-1 text-xs rounded-md bg-red-600 text-white" onClick={() => removeAction(i, k)}>Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dropdown children */}
                <div className="mt-3 border-t pt-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium">Dropdown</div>
                    <button className="px-2 py-1 text-xs rounded-md bg-blue-500 text-white" onClick={() => addDropdownItem(i)}>+ Add Child</button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {(it.dropdown ?? []).map((d, j) => (
                      <div key={j} className="rounded border p-2 grid grid-cols-1 md:grid-cols-6 gap-2">
                        <SelectInput
                          label="Type"
                          value={d.type ?? "link"}
                          onChange={(v) => updateDropdownItem(i, j, { type: v as NavItem["type"] })}
                          options={[{ value: "link", label: "link" }, { value: "signout", label: "signout" }, { value: "info", label: "info" }]}
                        />
                        <TextInput label="Label" value={d.label} onChange={(v) => updateDropdownItem(i, j, { label: v })} />
                        <TextInput label="Icon" value={d.icon ?? ""} onChange={(v) => updateDropdownItem(i, j, { icon: v })} />
                        <TextInput label="Href" value={d.href ?? ""} onChange={(v) => updateDropdownItem(i, j, { href: v })} />
                        <TextInput label="Value (for info)" value={(d.value as string) ?? ""} onChange={(v) => updateDropdownItem(i, j, { value: v })} />
                        <div className="flex items-end">
                          <button className="px-2 py-1 text-xs rounded-md bg-red-600 text-white" onClick={() => removeDropdownItem(i, j)}>Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dropdown actions */}
                  {(it.dropdown ?? []).map((d, j) => (
                    <div key={j} className="mt-2">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-medium">Dropdown Actions #{j + 1}</div>
                        <button className="px-2 py-1 text-xs rounded-md bg-blue-500 text-white" onClick={() => addAction(i, j)}>+ Add Action</button>
                      </div>
                      <div className="mt-2 space-y-2">
                        {(d.action ?? []).map((a, k) => (
                          <div key={k} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                            <SelectInput
                              label="Source"
                              value={a.source ?? "navigation"}
                              onChange={(v) => updateAction(i, k, { source: v as NavAction["source"] }, j)}
                              options={[{ value: "navigation", label: "navigation" }, { value: "client", label: "client" }, { value: "custom", label: "custom" }]}
                            />
                            <TextInput label="Path" value={a.path ?? ""} onChange={(v) => updateAction(i, k, { path: v }, j)} />
                            <TextInput label="Function Name" value={a.functionName ?? ""} onChange={(v) => updateAction(i, k, { functionName: v }, j)} />
                            <div className="flex items-end">
                              <button className="px-2 py-1 text-xs rounded-md bg-red-600 text-white" onClick={() => removeAction(i, k, j)}>Remove</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* JSON + Preview */}
      <div className="space-y-4">
        <div className="rounded-lg border border-black/10 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-black/80">JSON</div>
            <button
              className="px-2 py-1 text-xs rounded-md bg-blue-600 text-white"
              onClick={applyJson}
              title="Apply JSON to form"
            >
              Apply
            </button>
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
          <div className="mt-3 border rounded-md overflow-hidden relative min-h-[320px]">
            <ThemeContext.Provider value={{ logo: "/images/logo.svg" }}>
              <Header config={previewConfig} />
            </ThemeContext.Provider>
          </div>
        </div>
      </div>
    </div>
  );
}
