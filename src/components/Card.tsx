"use client";

import React, { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { DynamicIcon } from "@/lib/iconResolver";
import { useRouter } from "next/navigation";
import { useDynamicState } from "@/container/GlobalState";

export interface CardAction {
  source?: "navigation" | "client" | "custom";
  path?: string;
  functionName?: string;
  [key: string]: any;
}

export interface CardItem {
  title?: string;
  subtitle?: string;
  count?: number | string;
  icon?: string | React.ReactNode;
  linkText?: string;
  href?: string;
  linkTarget?: '_self' | '_blank';
  action?: CardAction[];
  onClick?: (ctx: any) => void;
  className?: string;
  [key: string]: any;
}

export interface CardConfig {
  items: CardItem[];
  layout?: "grid" | "list";
  columns?: number; // grid columns
  fetchData?: {
    apiConfig?: {
      url: string;
      method?: string;
      queryParams?: Record<string, string>;
      responseMapping?: { dataKey?: string };
    };
    responseStructure?: {
      dataPath?: string; // dot path to array, e.g., "results.items"
      patch?: Record<string, string>; // pre-map fields: key -> dot-path from row
    };
    mapping?: {
      title?: string;
      subtitle?: string;
      count?: string;
      linkText?: string;
      href?: string;
      linkTarget?: string;
      icon?: string;
      className?: string;
    };
    mergeMode?: 'replace' | 'append' | 'prepend';
  };
  containerClassName?: string;
  gridClassName?: string;
  cardClassName?: string;
  iconClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  countClassName?: string;
  linkClassName?: string;
  draggable?: boolean; // enable drag & drop reordering (local to component)
  containerized?: boolean; // not used now, reserved for parity
  [key: string]: any;
}

const cn = (...arr: Array<string | false | undefined>) => arr.filter(Boolean).join(" ");

const Card: React.FC<{ config: CardConfig; onReorder?: (items: CardItem[]) => void }> = ({ config, onReorder }) => {
  const router = useRouter();
  const { dynamicState } = useDynamicState();
  const [localItems, setLocalItems] = useState<CardItem[]>(config.items || []);
  const [lastFetched, setLastFetched] = useState<CardItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Keep internal order in sync if config.items changes length/content signature
  React.useEffect(() => {
    const mode = config.fetchData?.mergeMode || 'append';
    if (lastFetched && (config.fetchData?.apiConfig?.url || (config.fetchData && Object.keys(config.fetchData).length))) {
      const base = config.items || [];
      const combined = mode === 'replace' ? lastFetched : mode === 'prepend' ? [...lastFetched, ...base] : [...base, ...lastFetched];
      setLocalItems(combined);
    } else {
      setLocalItems(config.items || []);
    }
  }, [config.items, config.fetchData, lastFetched]);

  // Fetch API-driven data if configured
  React.useEffect(() => {
    const fetchFromApi = async () => {
      const api = config.fetchData?.apiConfig;
      if (!api?.url) return; // nothing to fetch
      setLoading(true);
      setError(null);
      try {
        // Build URL robustly
        let urlString = api.url;
        try {
          // If api.url is absolute this succeeds
          // eslint-disable-next-line no-new
          new URL(api.url);
        } catch {
          // Relative URL: prefix with window origin on client
          if (typeof window !== "undefined") {
            urlString = new URL(api.url, window.location.origin).toString();
          }
        }

        const urlObj = new URL(urlString);
        if (api.queryParams) {
          Object.entries(api.queryParams).forEach(([k, v]) => {
            if (k) urlObj.searchParams.set(k, String(v));
          });
        }

        const res = await fetch(urlObj.toString(), { method: api.method || "GET" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const dataKey = api.responseMapping?.dataKey;
        const rs = config.fetchData?.responseStructure;
        const map = config.fetchData?.mapping || {};

        const get = (obj: any, path?: string) => {
          if (!path) return undefined;
          // support dot-path like 'name.common' and array indices like 'items.0.name'
          return path.split('.').reduce((acc: any, key: string) => {
            const m = key.match(/^(\w+)(?:\[(\d+)\])?$/);
            if (!m) return acc?.[key];
            const k = m[1];
            const idx = m[2] != null ? Number(m[2]) : null;
            const next = acc?.[k];
            return idx != null ? next?.[idx] : next;
          }, obj);
        };

        // Resolve data array via priority: responseStructure.dataPath > responseMapping.dataKey > top-level array
        let data: any = undefined;
        if (rs?.dataPath) data = get(json, rs.dataPath);
        else if (dataKey) data = json?.[dataKey];
        else data = Array.isArray(json) ? json : [];

        if (!Array.isArray(data)) {
          data = data && typeof data === 'object' ? [data] : [];
        }

        // Optional pre-patch rows into a normalized structure
        const patched: any[] = rs?.patch
          ? (data as any[]).map((row) => {
              const base: any = { ...row };
              Object.entries(rs!.patch as Record<string, string>).forEach(([k, path]) => {
                base[k] = get(row, path);
              });
              return base;
            })
          : (data as any[]);

        // Helpers to normalize values into renderable primitives
        const norm = (val: any): any => {
          if (val == null) return '';
          if (typeof val === 'object') {
            // Prefer common/official for country-like shapes
            if ('common' in (val as any)) return (val as any).common;
            if ('official' in (val as any)) return (val as any).official;
            try { return JSON.stringify(val); } catch { return String(val); }
          }
          return val;
        };

        // Resolve mapping spec to a value. Supports literals when path not found or prefixed with '='
        const resolve = (row: any, spec?: any) => {
          if (spec == null) return undefined;
          if (typeof spec === 'string') {
            if (spec.startsWith('=')) return spec.slice(1);
            const val = get(row, spec);
            if (val !== undefined) return val;
            // If spec doesn't look like a path, treat as literal
            if (/^https?:\/\//i.test(spec)) return spec; // URL literal
            if (!(/[.\[]/.test(spec))) return spec;
            return undefined;
          }
          return spec;
        };

        const items: CardItem[] = (patched as any[]).map((row) => ({
          title: norm(map.title ? get(row, map.title) : (row?.name?.common ?? row?.name ?? row?.title ?? "")),
          subtitle: norm(map.subtitle ? get(row, map.subtitle) : (row?.region ?? row?.subregion ?? row?.subtitle ?? "")),
          count: norm(map.count ? get(row, map.count) : (row?.population ?? row?.count ?? "")),
          // Do not norm linkText/href so that undefined stays undefined (avoids empty-string overriding fallback)
          linkText: map.linkText !== undefined ? resolve(row, map.linkText) : undefined,
          href: map.href !== undefined ? String(resolve(row, map.href) ?? '') || undefined : undefined,
          linkTarget: map.linkTarget !== undefined ? (String(resolve(row, map.linkTarget) ?? '') as any) : undefined,
          icon: map.icon ? String(get(row, map.icon) ?? "") : undefined,
          className: map.className ? String(get(row, map.className) ?? "") : undefined,
        }));

        setLastFetched(items);
        const mode = config.fetchData?.mergeMode || 'append';
        const base = config.items || [];
        const combined = mode === 'replace' ? items : mode === 'prepend' ? [...items, ...base] : [...base, ...items];
        setLocalItems(combined);
      } catch (e: any) {
        console.error("Card fetchData error:", e);
        setError(`${e?.message ?? "Fetch failed"} (${config.fetchData?.apiConfig?.url})`);
      } finally {
        setLoading(false);
      }
    };
    fetchFromApi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(config.fetchData)]);

  const executeActions = useCallback(async (actions?: CardAction[]) => {
    if (!actions || !actions.length) return;
    for (const act of actions) {
      const source = act.source || (act as any).actionType;
      if (source === "navigation" && act.path) {
        try { router.push(String(act.path)); } catch (e) { console.error("Navigation failed:", e); }
        continue;
      }
      if ((source === "client" || source === "custom") && act.functionName && typeof window !== "undefined") {
        const fn = (window as any)[act.functionName];
        if (typeof fn === "function") {
          try { fn({ state: dynamicState, config, act }); } catch (e) { console.error("Custom action error:", e); }
        } else {
          console.warn(`Custom function ${act.functionName} not found on window`);
        }
        continue;
      }
      console.info("Unhandled card action:", act);
    }
  }, [router, dynamicState, config]);

  // Drag and drop (HTML5)
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const handleDragStart = (index: number) => () => setDragIndex(index);
  const handleDragOver = (index: number) => (e: React.DragEvent) => {
    if (!config.draggable) return;
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setLocalItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      setDragIndex(index);
      return next;
    });
  };
  const handleDragEnd = () => {
    if (dragIndex === null) return;
    setDragIndex(null);
    onReorder?.(localItems);
  };

  const gridColsClass = useMemo(() => {
    const cols = Math.max(1, Math.min(6, Number(config.columns) || 3));
    return `grid-cols-1 sm:grid-cols-2 md:grid-cols-${cols}`;
  }, [config.columns]);

  return (
    <div className={cn("w-full", config.containerClassName)}>
      {loading && <div className="text-xs opacity-70 mb-2">Loading…</div>}
      {!!error && <div className="text-xs text-red-600 mb-2">{error}</div>}
      <div className={cn(
        config.layout === "list" ? "space-y-3" : cn("grid gap-4", gridColsClass),
        config.gridClassName
      )}>
        {localItems.map((item, i) => (
          <div
            key={i}
            className={cn(
              "rounded-xl shadow p-4 border",
              item.className,
              config.cardClassName,
              config.draggable && "cursor-move"
            )}
            draggable={!!config.draggable}
            onDragStart={handleDragStart(i)}
            onDragOver={handleDragOver(i)}
            onDragEnd={handleDragEnd}
          >
            <div className="flex items-start gap-3">
              {item.icon && (
                typeof item.icon === "string" ? (
                  <DynamicIcon name={item.icon} className={cn("text-2xl", config.iconClassName)} aria-hidden />
                ) : (
                  <span className={cn("text-2xl", config.iconClassName)}>{item.icon}</span>
                )
              )}
              <div className="flex-1 min-w-0">
                {item.title && <div className={cn("font-semibold", config.titleClassName)}>{item.title}</div>}
                {item.subtitle && <div className={cn("text-sm opacity-80", config.subtitleClassName)}>{item.subtitle}</div>}
              </div>
              {item.count !== undefined && (
                <div className={cn("text-lg font-semibold", config.countClassName)}>{item.count}</div>
              )}
            </div>

            <div className="mt-3">
              {item.href ? (
                (() => {
                  const href = String(item.href);
                  const target = item.linkTarget === '_blank' ? '_blank' : '_self';
                  const isExternal = /^https?:\/\//i.test(href);
                  const handleClick = (e: React.MouseEvent) => {
                    // Always execute action/onClick
                    if (item.onClick) item.onClick({ state: dynamicState, config, item });
                    if (item.action) executeActions(item.action);
                    // Let navigation proceed naturally for anchors
                  };
                  if (target === '_blank' || isExternal) {
                    return (
                      <a
                        href={href}
                        target={target}
                        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
                        className={cn("inline-flex items-center gap-1 hover:opacity-90", config.linkClassName)}
                        onClick={handleClick}
                      >
                        {item.linkText || (target === '_blank' ? 'Open in new tab' : 'Open')}
                      </a>
                    );
                  }
                  return (
                    <Link href={href} passHref legacyBehavior>
                      <a
                        className={cn("inline-flex items-center gap-1 hover:opacity-90", config.linkClassName)}
                        onClick={handleClick}
                      >
                        {item.linkText || 'Open'}
                      </a>
                    </Link>
                  );
                })()
              ) : (
                <button
                  className={cn("inline-flex items-center gap-1 hover:opacity-90", config.linkClassName)}
                  onClick={() => {
                    if (item.onClick) item.onClick({ state: dynamicState, config, item });
                    if (item.action) executeActions(item.action);
                  }}
                >
                  {item.linkText || "Open"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Card;
