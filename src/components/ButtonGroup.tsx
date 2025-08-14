/*
  ButtonGroup
  -----------
  Horizontal container that renders multiple `Button` components.
  Optimized for the dynamic container runtime and compatible with the sample API.

  Features:
  - Accepts `buttons` (preferred) or `items` (legacy) arrays of button configs.
  - Applies `gap` between buttons and uses inline-flex layout.
  - `className` + `tw` for container styling (Tailwind overrides win).
  - `buttonDefaults` to set default props for all children (child props override defaults).
  - `disabledAll` to quickly disable all buttons.

  Sample JSON config (all features):
  {
    name: "actions",
    type: "buttonGroup",
    props: {
      gap: 12,
      className: "items-center",
      tw: "gap-4",
      disabledAll: false,
      buttonDefaults: { size: "small", rounded: "md" },
      buttons: [
        { id: "save", value: "Save", variant: "secondary", type: "button" },
        { id: "submit", value: "Submit", variant: "primary", type: "submit" }
      ]
    }
  }
*/
import React from "react";
import Button, { ButtonProps } from "./Button";

export type ButtonGroupItem = ButtonProps & { id?: string };

export type ButtonGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  buttons?: ButtonGroupItem[];
  items?: ButtonGroupItem[]; 
  gap?: number | string;
  tw?: string;
  buttonDefaults?: Partial<ButtonProps>;
  disabledAll?: boolean;
};

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  buttons,
  items,
  gap = 8,
  children,
  style,
  className,
  tw,
  buttonDefaults,
  disabledAll,
  ...rest
}) => {
  const mergedStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: typeof gap === "number" ? `${gap}px` : gap,
    ...style,
  };

  if (children) {
    return (
      <div style={mergedStyle} className={["flex", className, tw].filter(Boolean).join(" ")} {...rest}>
        {children}
      </div>
    );
  }

  const list = buttons ?? items ?? [];
  // console.debug("ButtonGroup list length", Array.isArray(list) ? list.length : 'n/a');
  return (
    <div style={mergedStyle} className={["flex", className, tw].filter(Boolean).join(" ")} {...rest}>
      {list.map((btn, idx) => (
        <Button
          key={btn.id ?? idx}
          {...buttonDefaults}
          {...btn}
          disabled={disabledAll || btn.disabled}
        />
      ))}
    </div>
  );
};

export default ButtonGroup;
