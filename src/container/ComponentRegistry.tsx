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

// Components will be registered progressively without changing config format.
export const componentRegistry: Record<string, ElementType> = {};
