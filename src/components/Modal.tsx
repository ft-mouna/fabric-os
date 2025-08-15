"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useDynamicState } from "@/container/GlobalState";

export interface ModalAction {
  text: string;
  href?: string;
  linkTarget?: "_self" | "_blank";
  action?: any[]; // navigation | client | custom (same as Cards)
  onClick?: (ctx: any) => void;
  className?: string;
}

export interface ModalConfig {
  open?: boolean;
  closeOnBackdrop?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  draggable?: boolean;

  title?: string;
  subtitle?: string;
  body?: string; // plain or HTML string (rendered via dangerouslySetInnerHTML)
  icon?: string | React.ReactNode;

  actions?: ModalAction[];

  fetchData?: {
    apiConfig?: {
      url: string;
      method?: string;
      queryParams?: Record<string, string>;
      responseMapping?: { dataKey?: string };
    };
    responseStructure?: {
      dataPath?: string;
      patch?: Record<string, string>;
    };
    mapping?: {
      title?: string;
      subtitle?: string;
      body?: string;
      // simple primary/secondary action mappings
      primaryText?: string;
      primaryHref?: string;
      primaryLinkTarget?: string;
      secondaryText?: string;
      secondaryHref?: string;
      secondaryLinkTarget?: string;
    };
    mergeMode?: "replace" | "append" | "prepend"; // for actions merge
  };

  containerClassName?: string;
  backdropClassName?: string;
  modalClassName?: string;
  titleClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  iconClassName?: string;
  actionClassName?: string;
}

const cn = (...arr: Array<string | false | undefined>) => arr.filter(Boolean).join(" ");

const Modal: React.FC<{ config: ModalConfig; onChangeOpen?: (open: boolean) => void }> = ({ config, onChangeOpen }) => {
  const router = useRouter();
  const { dynamicState } = useDynamicState();

  const [open, setOpen] = React.useState<boolean>(!!config.open);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const [title, setTitle] = React.useState<string | undefined>(config.title);
  const [subtitle, setSubtitle] = React.useState<string | undefined>(config.subtitle);
  const [body, setBody] = React.useState<string | undefined>(config.body);
  const [actions, setActions] = React.useState<ModalAction[]>(config.actions || []);

  React.useEffect(() => setOpen(!!config.open), [config.open]);

  // Focus trap setup
  const modalRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!open) return;
    const el = modalRef.current;
    if (!el) return;
    const selectors = [
      'a[href]', 'button', 'textarea', 'input', 'select',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');
    const focusables = Array.from(el.querySelectorAll<HTMLElement>(selectors)).filter((n) => !n.hasAttribute('disabled'));
    // initial focus: first focusable or container
    (focusables[0] || el).focus({ preventScroll: true });
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (!focusables.length) return;
      const active = document.activeElement as HTMLElement | null;
      const idx = focusables.indexOf(active || el);
      if (e.shiftKey) {
        // backwards
        const prev = focusables[(idx - 1 + focusables.length) % focusables.length];
        prev?.focus();
        e.preventDefault();
      } else {
        const next = focusables[(idx + 1) % focusables.length];
        next?.focus();
        e.preventDefault();
      }
    };
    el.addEventListener('keydown', onKeyDown);
    return () => el.removeEventListener('keydown', onKeyDown);
  }, [open]);

  // Close on ESC
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (open) {
          setOpen(false);
          onChangeOpen?.(false);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onChangeOpen]);

  const isExternal = (href: string) => /^https?:\/\//i.test(href);

  const executeActions = async (acts?: any[]) => {
    if (!acts || !acts.length) return;
    for (const act of acts) {
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
      console.info("Unhandled modal action:", act);
    }
  };

  // Fetch content (title/subtitle/body and basic actions)
  React.useEffect(() => {
    const fetchData = async () => {
      const api = config.fetchData?.apiConfig;
      if (!api?.url) return;
      setLoading(true);
      setError(null);
      try {
        let urlString = api.url;
        try { new URL(api.url); } catch { if (typeof window !== "undefined") urlString = new URL(api.url, window.location.origin).toString(); }
        const urlObj = new URL(urlString);
        if (api.queryParams) Object.entries(api.queryParams).forEach(([k, v]) => { if (k) urlObj.searchParams.set(k, String(v)); });
        const res = await fetch(urlObj.toString(), { method: api.method || "GET" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const rs = config.fetchData?.responseStructure;
        const dataKey = api.responseMapping?.dataKey;
        const map = config.fetchData?.mapping || {};

        const get = (obj: any, path?: string) => {
          if (!path) return undefined;
          return path.split('.').reduce((acc: any, key: string) => {
            const m = key.match(/^(\w+)(?:\[(\d+)\])?$/);
            if (!m) return acc?.[key];
            const k = m[1];
            const idx = m[2] != null ? Number(m[2]) : null;
            const next = acc?.[k];
            return idx != null ? next?.[idx] : next;
          }, obj);
        };

        const resolve = (row: any, spec?: any) => {
          if (spec == null) return undefined;
          if (typeof spec === 'string') {
            if (spec.startsWith('=')) return spec.slice(1);
            const val = get(row, spec);
            if (val !== undefined) return val;
            if (/^https?:\/\//i.test(spec)) return spec;
            if (!(/[.\[]/.test(spec))) return spec;
            return undefined;
          }
          return spec;
        };

        const pickText = (v: any) => {
          if (v == null) return '';
          if (typeof v === 'object') {
            if ('common' in (v as any)) return (v as any).common;
            if ('official' in (v as any)) return (v as any).official;
            try { return JSON.stringify(v); } catch { return String(v); }
          }
          return String(v);
        };

        let data: any = undefined;
        if (rs?.dataPath) data = get(json, rs.dataPath);
        else if (dataKey) data = json?.[dataKey];
        else data = json;

        const first = Array.isArray(data) ? data[0] : data;
        if (first && typeof first === 'object') {
          setTitle(pickText(map.title ? resolve(first, map.title) : (first.title ?? first.name ?? config.title)));
          setSubtitle(pickText(map.subtitle ? resolve(first, map.subtitle) : (first.subtitle ?? config.subtitle)));
          setBody(pickText(map.body ? resolve(first, map.body) : (config.body ?? "")));

          const newActions: ModalAction[] = [];
          const ptxt = resolve(first, map.primaryText);
          const ph = resolve(first, map.primaryHref);
          const pt = resolve(first, map.primaryLinkTarget) as any;
          if (ptxt || ph) newActions.push({ text: pickText(ptxt ?? 'OK'), href: ph ? String(ph) : undefined, linkTarget: pt === '_blank' ? '_blank' : '_self' });
          const stxt = resolve(first, map.secondaryText);
          const sh = resolve(first, map.secondaryHref);
          const st = resolve(first, map.secondaryLinkTarget) as any;
          if (stxt || sh) newActions.push({ text: pickText(stxt ?? 'Cancel'), href: sh ? String(sh) : undefined, linkTarget: st === '_blank' ? '_blank' : '_self' });

          const mode = config.fetchData?.mergeMode || 'append';
          if (newActions.length) {
            const base = config.actions || [];
            const combined = mode === 'replace' ? newActions : mode === 'prepend' ? [...newActions, ...base] : [...base, ...newActions];
            setActions(combined);
          }
        }
      } catch (e: any) {
        console.error("Modal fetchData error:", e);
        setError(`${e?.message ?? "Fetch failed"} (${config.fetchData?.apiConfig?.url})`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(config.fetchData)]);

  const sizeClass = React.useMemo(() => {
    switch (config.size) {
      case "sm": return "max-w-sm";
      case "md": return "max-w-md";
      case "lg": return "max-w-lg";
      case "xl": return "max-w-2xl";
      default: return "max-w-lg";
    }
  }, [config.size]);

  const handleBackdrop = () => {
    if (config.closeOnBackdrop) {
      setOpen(false);
      onChangeOpen?.(false);
    }
  };

  const sanitizeHtml = (html: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      // remove scripts and event handlers
      doc.querySelectorAll('script,noscript,iframe').forEach((n) => n.remove());
      doc.querySelectorAll('*').forEach((el: Element) => {
        // remove on* handlers and javascript: urls
        for (const attr of Array.from(el.attributes)) {
          const name = attr.name.toLowerCase();
          const val = attr.value;
          if (name.startsWith('on')) el.removeAttribute(attr.name);
          if ((name === 'href' || name === 'src') && /^\s*javascript:/i.test(val)) el.removeAttribute(attr.name);
        }
      });
      return doc.body.innerHTML;
    } catch {
      return html;
    }
  };

  const renderBody = () => {
    if (!body) return null;
    // Simple, optional HTML rendering. Assume trusted in builder; can swap to sanitizer if needed.
    const safe = sanitizeHtml(body);
    return <div className={cn("text-sm", config.bodyClassName)} dangerouslySetInnerHTML={{ __html: safe }} />;
  };

  if (!open) return null;

  return (
    <div className={cn("fixed inset-0 z-50", config.containerClassName)} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={cn("absolute inset-0 bg-black/40", config.backdropClassName)} onClick={handleBackdrop} />
      <div ref={modalRef} tabIndex={-1} className={cn("relative mx-auto mt-24 bg-white rounded-xl shadow-lg border p-4 w-[92%] outline-none", sizeClass, config.modalClassName)}>
        {loading && <div className="text-xs opacity-70 mb-2">Loading…</div>}
        {!!error && <div className="text-xs text-red-600 mb-2">{error}</div>}
        <div className={cn("flex items-start gap-3")}
        >
          <div className="flex-1 min-w-0">
            {config.title || title ? <div id="modal-title" className={cn("font-semibold text-lg", config.titleClassName)}>{title ?? config.title}</div> : null}
            {config.subtitle || subtitle ? <div className={cn("text-sm opacity-80 mt-1")}>{subtitle ?? config.subtitle}</div> : null}
          </div>
        </div>
        <div className="mt-3">
          {renderBody()}
        </div>
        <div className={cn("mt-4 flex items-center justify-end gap-2", config.footerClassName)}>
          {(actions.length ? actions : (config.actions || [])).map((btn, i) => {
            const text = btn.text || (i === 0 ? "OK" : "Cancel");
            const href = btn.href;
            const target = btn.linkTarget === "_blank" ? "_blank" : "_self";
            const onBtnClick = () => {
              if (btn.onClick) btn.onClick({ state: dynamicState, config, btn });
              if (btn.action) executeActions(btn.action);
              if (!href) return;
              if (target === "_blank" || isExternal(href)) {
                window.open(href, target === "_blank" ? "_blank" : "_self", target === "_blank" ? "noopener,noreferrer" : undefined);
              } else {
                router.push(href);
              }
            };
            return (
              <button key={i} className={cn("px-3 py-2 rounded-md border bg-gray-50 hover:bg-gray-100 text-sm", config.actionClassName, btn.className)} onClick={onBtnClick}>
                {text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Modal;
