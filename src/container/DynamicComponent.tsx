/*
  DynamicComponent (New Application)
  ----------------------------------
  Purpose:
  - Renders a single UI component based on a config object. It resolves the concrete
    React component from `componentRegistry` using `config.type`, falling back to
    intrinsic HTML elements when no registry match exists.

  How it is used:
  - Receives a `config` object (name, type, props, show, nestedChildren, selfClosing)
    and optional `children` (usually from the parsed layout/config). It renders the
    resolved component with the provided props and recursively renders any
    `nestedChildren`.

  Contract with Config:
  - `name`: logical identifier (string) and used as an element id when applicable.
  - `type`: key in `componentRegistry` or a valid intrinsic HTML tag.
  - `props`: passed through to the resolved component.
  - `show`: if explicitly `false`, the component is not rendered (default is visible).
  - `selfClosing`: when true, renders only the component without children.
  - `nestedChildren`: an array of child component configs to be rendered inside.

  Scope in this minimal implementation:
  - Omits advanced features from the sample (events, API dependencies, placeholder
    interpolation, conditional visibility). These can be reintroduced later in a
    targeted fashion as requirements grow.

  Extensibility:
  - Add back event wiring, data dependencies, and condition evaluators behind
  small, composable utilities without changing the config contract.

  Sample JSON reference (component shape):
  {
    "name": "title",
    "type": "text",
    "props": { "children": "Hello" },
    "show": true,
    "selfClosing": false,
    "nestedChildren": [
      { "name": "emphasis", "type": "span", "props": { "children": "world" } }
    ]
  }
*/
"use client"

import React, { memo } from "react"
import { componentRegistry } from "./ComponentRegistry"
import { JSX } from "react";


type Config = {
    name: string
    type: keyof typeof componentRegistry | keyof JSX.IntrinsicElements,
    props?: Record<string, any>
    dependencies?: Record<string, any>
    state?: Record<string, any>
    nestedChildren?: Config[]
    selfClosing?: Boolean
    show?: Boolean,
    childNode?: React.ReactNode
    events?: Record<string, any>[]
    visibility?: Record<string, any>
    placeholder?: Boolean
}

const DynamicComponent = memo(({ config, children }: { config: Config, children?: React.ReactNode }) => {
    const Component = componentRegistry[config?.type] || config?.type || 'div'

    // Default show=true when not provided
    if (config?.show === false) return null

    if (!config?.selfClosing) {
        return (
            <Component id={config?.name} {...config?.props}>
                {typeof children === "string" && (<div dangerouslySetInnerHTML={{ __html: children }} />)}
                {typeof children !== "string" && children}
                {config?.nestedChildren?.map((child, i) => (
                    <DynamicComponent key={i} config={child} children={child.childNode} />
                ))}
            </Component>
        );
    } else {
        return <Component {...config?.props} />
    }
})

export default DynamicComponent
