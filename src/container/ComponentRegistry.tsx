/*
  Component Registry (New Application)
  -----------------------------------
  Purpose:
  - Acts as a lookup table that maps a logical component `type` from layout/config files
    to a concrete React component implementation.

  How it is used:
  - `DynamicComponent` and `DynamicContainer` read `config.type` from the layout JSON and
    attempt to resolve it from this registry. If a match is not found, they fall back to
    intrinsic HTML elements (e.g., 'div').

  Contract with Config:
  - Keys of this object are the canonical names referenced in layout/config (e.g., 'topnav',
    'table', 'form').
  - Values are React components that accept a generic `props` object. The exact props are
    provided by the layout/config and should be validated by the component itself.

  Current state (intentionally minimal):
  - Registry is empty to start with. As the new application stabilizes, register only the
    components you actually need, to keep the runtime lightweight.

  Migration note:
  - The sample application has a populated registry. Use it as reference when bringing in
  components here, but keep this file lean and purpose-built for the new app.

  Sample JSON reference (types map to registry keys):
  {
    "container": {
      "config": { "name": "root", "type": "div", "props": { "className": "page" } },
      "components": [
        { "name": "title", "type": "text", "props": { "children": "Hello" } },
        { "name": "cta", "type": "buttonGroup", "props": { "variant": "primary" } }
      ]
    }
  }
*/

import type { ElementType } from "react";
import Button from "../components/Button";
import ButtonGroup from "../components/ButtonGroup";
import { useActionRegistry } from "./actions/registry";
import { useDynamicState } from "./GlobalState";

// Button wrapper to support legacy `actiontype` and `label` props
const ActionButton = (props: any) => {
  const actions = useActionRegistry();
  const { actiontype, onClick, label, children, ...rest } = props || {};
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (actiontype && actions[actiontype as keyof typeof actions]) {
      try { (actions as any)[actiontype](); } catch { /* no-op */ }
    }
    onClick?.(e);
  };
  return (
    <Button {...rest} onClick={handleClick}>
      {children ?? label ?? rest.value}
    </Button>
  );
};

// ButtonGroup wrapper to support legacy shapes: `btnConfig`, `items`, or `buttons` and inject global state
const WrappedButtonGroup = (props: any) => {
  const { dynamicState } = useDynamicState();
  const baseButtons = props.buttons ?? props.btnConfig ?? props.items ?? [];
  const mapped = Array.isArray(baseButtons)
    ? baseButtons.map((b: any) => ({ ...b, globalVariables: dynamicState }))
    : [];
  return (
    <ButtonGroup
      buttons={mapped}
      className={props.className}
      tw={props.tw}
      buttonDefaults={props.buttonDefaults}
      disabledAll={props.disabledAll}
    />
  );
};

export const componentRegistry: Record<string, ElementType> = {
  button: ActionButton,
  buttonGroup: WrappedButtonGroup,
};
