import React from 'react';

// Cache for loaded icon components
const iconCache: Record<string, React.ComponentType<any> | null> = {};

// Map known prefixes to react-icons subpackages
const prefixToPkg: Record<string, string> = {
  Fa: 'fa', // Font Awesome
  Md: 'md', // Material Design
  Fi: 'fi', // Feather
  Ai: 'ai', // Ant Design
  Ri: 'ri', // Remix
  Hi: 'hi', // Heroicons v1
  Hi2: 'hi2', // Heroicons v2
  Bi: 'bi', // Bootstrap Icons
  Ci: 'ci', // Circum Icons
  Go: 'go', // Octicons
  Gr: 'gr', // Grommet
  Im: 'im', // IcoMoon
  Gi: 'gi', // Game Icons
  Tb: 'tb', // Tabler Icons
  Si: 'si', // Simple Icons
  Sl: 'sl', // Simple Line Icons
  Bs: 'bs', // Bootstrap (legacy set)
  Pi: 'pi', // Phosphor
  Vsc: 'vsc', // VS Code Icons
};

function detectPrefix(name: string): string | null {
  if (name.startsWith('Vsc')) return 'Vsc';
  if (name.startsWith('Hi2')) return 'Hi2';
  const two = name.slice(0, 2);
  return prefixToPkg[two] ? two : null;
}

async function loadIcon(name: string): Promise<React.ComponentType<any> | null> {
  if (!name || typeof name !== 'string') return null;
  if (iconCache[name] !== undefined) return iconCache[name];

  const prefix = detectPrefix(name);
  if (!prefix) {
    iconCache[name] = null;
    return null;
  }

  const pkg = prefixToPkg[prefix];
  try {
    const mod = await import(
      /* webpackChunkName: "react-icons-[request]" */
      /* @vite-ignore */ `react-icons/${pkg}`
    );
    const Comp = (mod as any)[name] as React.ComponentType<any> | undefined;
    iconCache[name] = Comp ?? null;
    return iconCache[name];
  } catch (e) {
    iconCache[name] = null;
    return null;
  }
}

export function useIcon(name?: string) {
  const [Comp, setComp] = React.useState<React.ComponentType<any> | null>(null);
  React.useEffect(() => {
    let mounted = true;
    if (!name || typeof name !== 'string') {
      setComp(null);
      return;
    }
    loadIcon(name).then((C) => {
      if (mounted) setComp(C);
    });
    return () => {
      mounted = false;
    };
  }, [name]);
  return Comp;
}

export const DynamicIcon: React.FC<{ name?: string; className?: string; title?: string } & React.HTMLAttributes<HTMLElement>> = ({ name, className, title, ...rest }) => {
  const IconComp = useIcon(name);
  if (!name) return null;
  if (!IconComp) return <span aria-hidden className={className} {...rest} />;
  return <IconComp className={className} title={title} {...rest} />;
};
