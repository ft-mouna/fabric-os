"use client";
/*
  Button (lean, sample-compatible)
  --------------------------------
  - Minimal, efficient Button aligned with the sample API so existing configs work.
  - Supports: value | children, variant, size, rounded, fullWidth/block, loading, icon, iconPosition,
    href/route navigation, action (client navigation), hide, shadow/ghost, inline color overrides,
    className and tw (Tailwind overrides with precedence).

  Sample config (all features):
  {
    name: "primaryBtn",
    type: "button",
    props: {
      value: "Submit",
      variant: "primary",            // primary | secondary | outline | text | danger | success | warning
      size: "medium",                // xsmall | small | medium | large | xlarge
      rounded: "full",               // true | false | full | sm | md | lg | xl
      block: false,
      fullWidth: false,
      shadow: "sm",                  // false | true | sm | md | lg
      ghost: false,
      loading: false,
      href: "/demo/buttons",         // or route: "/path"
      action: [                       // optional minimal action support
        { actionType: "client", source: "navigation", path: "/demo/buttons" }
      ],
      iconPosition: "left",
      // icon: <IconComponent />      // pass as ReactNode if needed
      textColor: undefined,           // inline style overrides (optional)
      bgColor: undefined,
      borderColor: undefined,
      className: "",
      tw: "",                        // Tailwind overrides appended last
      hide: false,
      type: "button"
    }
  }
*/
import React, { ButtonHTMLAttributes, ReactNode } from "react";
import { useRouter } from "next/navigation";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  value?: string;
  variant?: "primary" | "secondary" | "outline" | "text" | "danger" | "success" | "warning";
  size?: "xsmall" | "small" | "medium" | "large" | "xlarge" | string;
  rounded?: boolean | "full" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right" | "center";
  loading?: boolean;
  href?: string;
  route?: string;
  disabled?: boolean;
  block?: boolean;
  shadow?: boolean | "sm" | "md" | "lg";
  ghost?: boolean;
  outlineColor?: string;
  textColor?: string;
  bgColor?: string;
  borderColor?: string;
  iconOnly?: boolean;
  iconSize?: string;
  className?: string;
  tw?: string;
  action?: Array<{ actionType?: "client" | string; source?: string; path?: string; [k: string]: any }>;
  type?: "button" | "submit" | "reset";
  hide?: any;
  globalVariables?: any;
  showICon?: boolean;
  formData?: any;
  formValid?: any;
  setFormSubmitted?: (v: boolean) => void;
  isValidateForm?: boolean;
  invalidToastMessage?: string;
  data?: any;
}

const Button: React.FC<ButtonProps> = ({
  value,
  children,
  variant = "primary",
  size = "medium",
  rounded = "full",
  fullWidth = false,
  icon,
  iconPosition = "left",
  loading = false,
  href,
  route,
  disabled,
  block,
  shadow = "sm",
  ghost,
  outlineColor,
  textColor,
  bgColor,
  borderColor,
  iconOnly,
  className,
  tw,
  action,
  type = "button",
  hide,
  setFormSubmitted,
  isValidateForm,
  ...rest
}) => {
  const router = useRouter();

  // Visibility guard (lean): if `hide` is truthy (except explicit false), hide.
  if (hide !== false && hide !== undefined && hide !== null) {
    return null;
  }

  const computedDisabled = Boolean(disabled || loading);

  const base = [
    "inline-flex items-center justify-center select-none whitespace-nowrap align-middle",
    "font-medium transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
    "ring-offset-white",
    computedDisabled ? "opacity-60 pointer-events-none" : "",
    block || fullWidth ? "w-full" : "",
    iconOnly && !children ? "p-2" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const variantStyles: Record<string, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    outline: "border border-gray-300 text-gray-800 hover:bg-gray-100",
    text: "text-blue-600 hover:underline",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700",
    warning: "bg-yellow-400 text-gray-800 hover:bg-yellow-500",
  };

  const sizeStyles: Record<string, string> = {
    xsmall: "px-2 py-1 text-xs",
    small: "px-3 py-2 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-6 py-3 text-lg",
    xlarge: "px-8 py-4 text-xl",
  };

  const roundedStyles: Record<string, string> = {
    false: "rounded-md",
    true: "rounded-full",
    full: "rounded-full",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
  } as any;

  const shadowStyles: Record<string, string> = {
    false: "",
    true: "shadow",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  } as any;

  const ghostStyles = ghost ? "bg-transparent border border-transparent hover:border-gray-300" : "";

  const customInline: React.CSSProperties = {
    ...(outlineColor ? { outlineColor } : {}),
    ...(textColor ? { color: textColor } : {}),
    ...(bgColor ? { backgroundColor: bgColor } : {}),
    ...(borderColor ? { borderColor } : {}),
  };

  const iconSpacing = icon && children && iconPosition !== "center" ? (iconPosition === "left" ? "mr-2" : "ml-2") : "";

  const classes = [
    base,
    variantStyles[variant] ?? variantStyles.primary,
    sizeStyles[size] ?? sizeStyles.medium,
    roundedStyles[String(rounded)] ?? roundedStyles.full,
    shadowStyles[String(shadow)] ?? shadowStyles.sm,
    ghostStyles,
    className || "",
    tw || "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (computedDisabled) return;

    if (isValidateForm && setFormSubmitted) setFormSubmitted(true);

    // Simple navigation support via props
    if (route) return router.replace(route);
    if (href) return router.push(href);

    // Minimal action support: client navigation
    if (Array.isArray(action)) {
      const nav = action.find((a) => a?.actionType === "client" && a?.source === "navigation" && a?.path);
      if (nav?.path) return router.push(nav.path);
    }

    // Fallback to provided onClick
    rest.onClick?.(e);
  };

  return (
    <button
      className={classes}
      style={customInline}
      disabled={computedDisabled}
      aria-disabled={computedDisabled}
      aria-busy={loading || undefined}
      data-variant={variant}
      data-size={size}
      type={type}
      onClick={handleClick}
      {...rest}
    >
      {loading && (
        <svg
          className="animate-spin mr-2 h-4 w-4 text-current"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {icon && iconPosition === "left" && <span className={iconSpacing}>{icon}</span>}
      {icon && iconPosition === "center" && icon}
      {children ?? value}
      {icon && iconPosition === "right" && <span className={iconSpacing}>{icon}</span>}
    </button>
  );
};

export default Button;
