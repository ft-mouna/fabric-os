"use client";

import React from "react";
import { useToast } from "@/sample/common/ToastContext";

export interface ToastConfig {
  message?: string; // HTML or text
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  triggerOnMount?: boolean;
  fetchData?: {
    apiConfig?: {
      url: string;
      method?: string;
      queryParams?: Record<string, string>;
      responseMapping?: { dataKey?: string };
    };
    responseStructure?: { dataPath?: string; patch?: Record<string, string> };
    mapping?: {
      message?: string;
      type?: string;
      duration?: string;
      position?: string;
    };
  };
}

const Toast: React.FC<{ config: ToastConfig }> = ({ config }) => {
  const { showToast } = useToast();
  const [loadedConfig, setLoadedConfig] = React.useState<ToastConfig>(config);

  React.useEffect(() => {
    const run = async () => {
      const api = config.fetchData?.apiConfig;
      if (!api?.url) return;
      try {
        let urlString = api.url;
        try { new URL(api.url); } catch { if (typeof window !== 'undefined') urlString = new URL(api.url, window.location.origin).toString(); }
        const urlObj = new URL(urlString);
        if (api.queryParams) Object.entries(api.queryParams).forEach(([k, v]) => { if (k) urlObj.searchParams.set(k, String(v)); });
        const res = await fetch(urlObj.toString(), { method: api.method || 'GET' });
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
            if (!(/[.\[]/.test(spec))) return spec;
            return undefined;
          }
          return spec;
        };
        const pick = (v: any) => v == null ? undefined : (typeof v === 'object' ? JSON.stringify(v) : v);
        let data: any = undefined;
        if (rs?.dataPath) data = get(json, rs.dataPath);
        else if (dataKey) data = json?.[dataKey];
        else data = json;
        const row = Array.isArray(data) ? data[0] : data;
        const merged: ToastConfig = { ...config };
        if (row && typeof row === 'object') {
          if (map.message) merged.message = String(resolve(row, map.message) ?? merged.message ?? '');
          if (map.type) merged.type = String(resolve(row, map.type) ?? merged.type ?? 'info') as any;
          if (map.duration) merged.duration = Number(resolve(row, map.duration) ?? merged.duration ?? 3000);
          if (map.position) merged.position = String(resolve(row, map.position) ?? merged.position ?? 'top-right') as any;
        }
        setLoadedConfig(merged);
      } catch (e) {
        // Fallback to provided config
        setLoadedConfig(config);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(config.fetchData)]);

  React.useEffect(() => {
    if (!config.triggerOnMount) return;
    if (!loadedConfig.message) return;
    showToast({
      message: loadedConfig.message!,
      type: loadedConfig.type || 'info',
      duration: loadedConfig.duration || 3000,
      position: loadedConfig.position || 'top-right'
    });
    // only on mount or when loadedConfig changes via fetch
  }, [loadedConfig, showToast, config.triggerOnMount]);

  // Render a simple trigger button when not triggering on mount
  if (!config.triggerOnMount) {
    return (
      <button className="px-3 py-2 rounded-md border bg-gray-50 hover:bg-gray-100 text-sm" onClick={() => {
        if (!loadedConfig.message) return;
        showToast({
          message: loadedConfig.message!,
          type: loadedConfig.type || 'info',
          duration: loadedConfig.duration || 3000,
          position: loadedConfig.position || 'top-right'
        });
      }}>Show Toast</button>
    );
  }
  return null;
};

export default Toast;
