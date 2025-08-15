/**
 * Header (Dynamic, Config-Driven Navigation)
 * -----------------------------------------------------------
 * A reusable navigation component that renders from a config object without changing
 * existing schema. It supports top or side (left/right) orientations, responsive mobile behavior,
 * dynamic icons via react-icons string names (e.g., "FaEye"), and config-driven actions.
 *
 * Key features:
 * - Orientation: top (default), side-left, side-right via `layout` or `navOrientation`.
 * - Icons: set `icon` to a string like "FaEye" (react-icons) or pass a ReactNode.
 * - Actions: items can specify `action` (array) and/or `onClick` to drive behavior.
 *   - navigation: { source: 'navigation', path: '/route' }
 *   - client/custom: { source: 'client', functionName: 'globalFnName' }
 * - Backward compatible: `href` still works; if `action` is defined we prioritize executing it.
 * - Class overrides: headerClassName, navItemsClassName, dropdownClassName, profileClassName, containerClassName, brandClassName, menuButtonClassName.
 *
 * Sample config (TypeScript/JSON-like):
 * {
 *   companyName: 'ICICI',
 *   navItems: [
 *     { type: 'link', label: 'Home', icon: 'MdHome', href: '/' },
 *     { label: 'Products', icon: 'FaBoxes', dropdown: [
 *         { type: 'link', label: 'Catalog', icon: 'FiList', action: [{ source: 'navigation', path: '/catalog' }] },
 *         { type: 'info', label: 'Env', value: 'env.name' }
 *       ]
 *     },
 *     { label: 'Refresh', icon: 'FiRefreshCcw', action: [{ source: 'client', functionName: 'refreshData' }] },
 *   ],
 *   profile: {
 *     name: 'John Doe',
 *     avatar: '/avatar.png',
 *     menuItems: [
 *       { type: 'link', label: 'Profile', icon: 'FiUser', href: '/profile' },
 *       { type: 'signout', label: 'Sign Out', icon: 'FiLogOut', action: [{ source: 'client', functionName: 'appSignOut' }] }
 *     ]
 *   },
 *   // Optional
 *   layout: 'top', // 'top' | 'side-left' | 'side-right'
 *   navPosition: 'right', // alignment within the bar when top
 *   headerClassName: 'primary-bg',
 *   containerClassName: 'container mx-auto',
 *   navItemsClassName: 'gap-2',
 *   dropdownClassName: 'shadow-md',
 *   profileClassName: '',
 *   brandClassName: 'font-semibold',
 *   menuButtonClassName: 'md:hidden'
 * }
 *
 * Notes:
 * - For client/custom actions, define global functions on window, e.g.:
 *     (window as any).appSignOut = async () => {
 *       const mod = await import('next-auth/react');
 *       await mod.signOut();
 *     }
 *     (window as any).refreshData = ({ state, config }) => { // implement here }
 */
'use client';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useTheme } from '../sample/common/ThemeWrapper';
import { useDynamicState } from '@/container/GlobalState';
import { DynamicIcon } from '../lib/iconResolver';
import { useRouter } from 'next/navigation';

 

interface NavItem {
  type?: 'info' | 'link' | 'signout';
  label: string;
  href?: string;
  dropdown?: NavItem[];
  icon?: React.ReactNode;
  condition?: boolean | ((roleName: string) => boolean) | string;
  value?: any;
  action?: any[]; 
  onClick?: (state: any) => void;
  [key: string]: any;
}

interface Profile {
  name?: string;
  avatar: string;
  menuItems: NavItem[];
  [key: string]: any;
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
  navPosition?: 'left' | 'center' | 'right';
  layout?: 'top' | 'side-left' | 'side-right';
  navOrientation?: 'top' | 'left' | 'right';
  containerClassName?: string;
  brandClassName?: string;
  menuButtonClassName?: string;
  [key: string]: any;
}

interface HeaderProps {
  config: HeaderConfig;
}

const cn = (...classes: Array<string | undefined | false>) => classes.filter(Boolean).join(' ');

const Header: React.FC<HeaderProps> = ({ config }) => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState<number | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const themeConfig: any = useTheme();
  const { dynamicState } = useDynamicState();

  const profileRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const renderIcon = useCallback((icon?: string | React.ReactNode, className?: string) => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return <DynamicIcon name={icon} className={className} aria-hidden />;
    }
    return <span className={className}>{icon}</span>;
  }, []);

  const executeActions = useCallback(async (actions?: any[]) => {
    if (!actions || !actions.length) return;
    for (const act of actions) {
      const source = act.source || act.actionType; 
      if (source === 'navigation' && act.path) {
        try {
          router.push(String(act.path));
        } catch (e) {
          console.error('Navigation failed:', e);
        }
        continue;
      }
      if ((source === 'client' || source === 'custom') && act.functionName && typeof window !== 'undefined') {
        const fn = (window as any)[act.functionName];
        if (typeof fn === 'function') {
          try { fn({ state: dynamicState, config, act }); } catch (e) { console.error('Custom action error:', e); }
        } else {
          console.warn(`Custom function ${act.functionName} not found on window`);
        }
        continue;
      }
      console.info('Unhandled action in Header (delegated to container):', act);
    }
  }, [router, dynamicState, config]);

  const orientation = useMemo<'top' | 'left' | 'right'>(() => {
    if (config.layout === 'side-left' || config.navOrientation === 'left') return 'left';
    if (config.layout === 'side-right' || config.navOrientation === 'right') return 'right';
    return 'top';
  }, [config.layout, config.navOrientation]);

  const navJustifyClass = useMemo(() => {
    switch (config.navPosition) {
      case 'left':
        return 'justify-start';
      case 'center':
        return 'justify-center';
      case 'right':
      default:
        return 'justify-end';
    }
  }, [config.navPosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        profileRef.current && !profileRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        mobileMenuRef.current && !mobileMenuRef.current.contains(target)
      ) {
        setIsProfileOpen(false);
        setIsDropdownOpen(null);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const parseGlobalValue = useCallback((value: any) => {
    if (typeof value === 'string' && value.includes('[global[')) {
      const match = value.match(/\[global\[(.*?)\]\]/);
      if (match) {
        const key = match[1];
        return dynamicState[key] ?? '';
      }
    }
    return value;
  }, [dynamicState]);

  const shouldRenderNavItem = useCallback((item: NavItem) => {
    if (item.condition === undefined) return true;
    if (typeof item.condition === 'boolean') return item.condition;
    if (typeof item.condition === 'function') return item.condition(dynamicState.roleName);
    if (typeof item.condition === 'string') {
      const replaced = item.condition.replace(/\[global\[(.*?)\]\]/g, (_, key) => String(dynamicState[key] ?? ''));
      try {
        const fn = new Function('state', `return (${replaced});`);
        return !!fn(dynamicState);
      } catch {
        return false;
      }
    }
    return true;
  }, [dynamicState]);

  if (!themeConfig) return null;

  const handleSignOut = async () => {
    console.warn('Signout invoked but no dynamic action provided. Add an action to this menu item to define behavior.');
  };

  const isContainerized = !!(config as any).containerized;
  const defaultHeaderBase = orientation === 'top'
    ? 'w-full flex items-center'
    : (isContainerized ? 'h-full flex flex-col items-stretch' : 'h-screen flex flex-col items-stretch');
  const defaultHeaderPosition = orientation === 'top'
    ? 'sticky top-0 z-40'
    : isContainerized
      ? (orientation === 'left' ? 'relative w-64' : 'relative w-64 ml-auto')
      : (orientation === 'left' ? 'fixed left-0 top-0 z-40 w-64' : 'fixed right-0 top-0 z-40 w-64');
  // If no override provided, fall back to site theme class `primary-bg`
  const headerClass = cn(defaultHeaderBase, defaultHeaderPosition, 'shadow-sm', config.headerClassName || 'primary-bg');

  const brandClass = cn('flex items-center gap-3 p-3', config.brandClassName);
  const navListBase = orientation === 'top' ? 'flex items-center gap-4' : 'flex flex-col gap-1 p-2';
  const navListClass = cn(navListBase, config.navItemsClassName);
  const dropdownClass = cn(
    'absolute mt-2 rounded-md shadow-lg border min-w-[10rem] py-1',
    config.dropdownClassName
  );
  const profileMenuClass = cn(
    'absolute right-0 mt-2 rounded-md shadow-lg w-max z-10 border',
    config.profileClassName
  );

  const MobileMenuButton = (
    <button
      className={cn('md:hidden p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current', config.menuButtonClassName)}
      aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isMobileMenuOpen}
      onClick={() => setIsMobileMenuOpen((p) => !p)}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {isMobileMenuOpen ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        )}
      </svg>
    </button>
  );

  const ChevronIcon = ({ open }: { open: boolean }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-4 w-4 ml-1 transition-transform', open && 'rotate-180')}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  const NavItems = (
    <ul className={navListClass} role="menubar">
      {config?.navItems?.map((item, index) => {
        if (!shouldRenderNavItem(item)) return null;
        const hasDropdown = !!item.dropdown?.length;
        return (
          <li key={index} className={cn('relative', orientation !== 'top' && 'w-full')} role="none">
            {hasDropdown ? (
              <>
                <button
                  onClick={() => setIsDropdownOpen(isDropdownOpen === index ? null : index)}
                  className={cn('flex items-center whitespace-nowrap px-2 py-2 hover:opacity-90', orientation !== 'top' && 'w-full justify-between')}
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen === index}
                  role="menuitem"
                >
                  {renderIcon(item.icon, 'mr-1 h-4 w-4')}
                  {item.label}
                  <ChevronIcon open={isDropdownOpen === index} />
                </button>
                {isDropdownOpen === index && (
                  <ul className={dropdownClass} ref={dropdownRef} role="menu">
                    {item.dropdown!.map((dropdownItem, dropdownIndex) => (
                      <li key={dropdownIndex} className="px-2 py-2 hover:opacity-90" role="none">
                        {dropdownItem.type === 'link' && !dropdownItem.action && (
                          <Link href={dropdownItem.href || ''} passHref legacyBehavior>
                            <a className="block flex items-center" role="menuitem">
                              {renderIcon(dropdownItem.icon, 'mr-1 h-4 w-4')}
                              {dropdownItem.label}
                            </a>
                          </Link>
                        )}
                        {(dropdownItem.action || dropdownItem.onClick || dropdownItem.type === 'signout') && (
                          <button className="w-full text-left flex items-center px-2 py-1" role="menuitem" onClick={() => {
                            if (dropdownItem.onClick) dropdownItem.onClick(dynamicState);
                            if (dropdownItem.action) executeActions(dropdownItem.action);
                            if (dropdownItem.type === 'signout' && !dropdownItem.action && !dropdownItem.onClick) handleSignOut();
                            setIsDropdownOpen(null);
                          }}>
                            {renderIcon(dropdownItem.icon, 'mr-1 h-4 w-4')}
                            {dropdownItem.label}
                          </button>
                        )}
                        {dropdownItem.type === 'info' && (
                          <span role="menuitem">{dropdownItem.label}: {parseGlobalValue(dropdownItem.value)}</span>
                        )}
                      </li>) )}
                  </ul>
                )}
              </>
            ) : (
              <>
                {(!item.action && !item.onClick && item.href) ? (
                  <Link href={item.href} passHref legacyBehavior>
                    <a className={cn('hover:opacity-90 flex items-center px-2 py-2', orientation !== 'top' && 'w-full')} role="menuitem">
                      {renderIcon(item.icon, 'mr-1 h-4 w-4')}
                      {item.label}
                    </a>
                  </Link>
                ) : (
                  <button className={cn('hover:opacity-90 flex items-center px-2 py-2', orientation !== 'top' && 'w-full')} role="menuitem" onClick={() => {
                    if (item.onClick) item.onClick(dynamicState);
                    if (item.action) executeActions(item.action);
                    if (item.type === 'signout' && !item.action && !item.onClick) handleSignOut();
                  }}>
                    {renderIcon(item.icon, 'mr-1 h-4 w-4')}
                    {item.label}
                  </button>
                )}
              </>
            )}
          </li>
        );
      })}
    </ul>
  );

  const ProfileMenu = (
    <div className="relative" ref={profileRef} role="none">
      {(() => {
        const profile = config?.profile || { avatar: '/images/user-avatar.png', name: 'User', menuItems: [] };
        return (
          <>
            <button onClick={() => setIsProfileOpen(!isProfileOpen)} aria-haspopup="menu" aria-expanded={isProfileOpen} className="p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current">
              <img src={profile.avatar} alt={profile.name || 'User'} className="h-10 w-10 rounded-full" />
            </button>
            {isProfileOpen && (
              <div className={profileMenuClass} role="menu">
                {profile.name && (
                  <div className="px-4 py-2">
                    <p className="font-semibold">{profile.name}</p>
                  </div>
                )}
                <ul>
                  {Array.isArray(profile.menuItems) && profile.menuItems.map((item, index) => (
              <li key={index} className={cn('px-4 py-2 text-xs', item.type === 'link' && 'hover:opacity-90')} role="none">
                {item.type === 'link' && !item.action && !item.onClick && (
                  <Link href={item.href || ''} passHref legacyBehavior>
                    <a className="block flex items-center" role="menuitem">
                      {renderIcon(item.icon, 'mr-1 h-4 w-4')}
                      {item.label}
                    </a>
                  </Link>
                )}
                {(item.type === 'info') && (
                  <span role="menuitem">{item.label}: {parseGlobalValue(item.value)}</span>
                )}
                {(item.action || item.onClick || item.type === 'signout') && (
                  <button className="w-full text-left flex items-center gap-2" onClick={() => {
                    if (item.onClick) item.onClick(dynamicState);
                    if (item.action) executeActions(item.action);
                    if (item.type === 'signout' && !item.action && !item.onClick) handleSignOut();
                    setIsProfileOpen(false);
                  }} role="menuitem">
                    {renderIcon(item.icon || (item.type === 'signout' ? 'FiLogOut' : undefined), 'h-4 w-4')}
                    <span>{item.label}</span>
                  </button>
                )}
              </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        );
      })()}
    </div>
  );

  // Layouts
  if (orientation === 'left' || orientation === 'right') {
    return (
      <aside className={headerClass} {...config.rest} ref={mobileMenuRef}>
        <div className={brandClass}>
          <img src={themeConfig.logo} alt={config.companyName} className="h-8 w-auto" />
          <span className="font-semibold text-sm">{config.companyName}</span>
          <div className="ml-auto md:hidden">{MobileMenuButton}</div>
        </div>

        <div className={cn('flex-1 overflow-y-auto', !isMobileMenuOpen && 'hidden md:block')}>
          <nav className="">
            {NavItems}
          </nav>
        </div>

        <div className="p-3 mt-auto">
          {ProfileMenu}
        </div>
      </aside>
    );
  }

  // Top orientation
  return (
    <header className={headerClass} {...config.rest}>
      <div className={cn('container mx-auto w-full', config.containerClassName)}>
        <div className={cn('flex items-center gap-4 py-2')}>
          {/* Brand */}
          <div className={cn('flex items-center gap-3 flex-shrink-0', config.brandClassName)}>
            <img src={themeConfig.logo} alt={config.companyName} className="h-8 w-auto" />
            <span className="hidden sm:inline font-semibold text-sm">{config.companyName}</span>
          </div>

          {/* Nav when positioned left */}
          {config.navPosition === 'left' && (
            <div className="hidden md:block">
              <nav className="flex items-center">
                {NavItems}
              </nav>
            </div>
          )}

          {/* Center nav */}
          {config.navPosition === 'center' && (
            <div className="flex-1 hidden md:flex justify-center">
              <nav className="flex items-center">
                {NavItems}
              </nav>
            </div>
          )}

          {/* Right group (nav when right, menu button, profile, extras) */}
          <div className="ml-auto flex items-center gap-3">
            {(!config.navPosition || config.navPosition === 'right') && (
              <div className="hidden md:block">
                <nav className="flex items-center">
                  {NavItems}
                </nav>
              </div>
            )}
            <div className="md:hidden">{MobileMenuButton}</div>
            {ProfileMenu}
            {config.additionalFeatures}
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden" ref={mobileMenuRef}>
            <nav className="px-2 pb-3 ">
              {NavItems}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
