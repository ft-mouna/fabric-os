/*
  DynamicContainer (New Application)
  ----------------------------------
  Purpose:
  - Renders a container element based on a config object and recursively renders its child
    component configs using `DynamicComponent`.

  How it is used:
  - Receives a `container` object that includes `config` (name, type, props, show) and
    a list of `components` (child configs). It chooses a concrete React component by
    resolving `config.type` via `componentRegistry`, or falls back to an intrinsic element
    such as 'div'.

  Contract with Config:
  - `config.name`: logical identifier of the container (string).
  - `config.type`: key in `componentRegistry` or a valid intrinsic HTML tag.
  - `config.props`: passed directly to the resolved React component.
  - `config.show`: if explicitly `false`, the container is not rendered (default is visible).
  - `components`: an array of child component configs to be rendered inside this container.

  Scope in this minimal implementation:
  - Styling systems, theming, and event wiring are intentionally omitted.
  - Visibility is simplified to a single boolean flag (`show`).
  - Children are rendered in-order as provided by the config.

  Extensibility:
  - Add styling/theming hooks, event systems, or advanced visibility rules as the
  application requirements grow, keeping the config contract stable.

  Sample JSON reference (container shape):
  {
    "container": {
      "config": {
        "name": "root",
        "type": "div",
        "props": { "className": "page" },
        "show": true
      },
      "components": [
        { "name": "header", "type": "text", "props": { "children": "Welcome" } },
        { "name": "content", "type": "div", "props": { "className": "content" } }
      ]
    }
  }
*/
"use client"

import { JSX } from "react";
import { componentRegistry } from "./ComponentRegistry";
import DynamicComponent from "./DynamicComponent";

type ContainerConfig = {
    name: string
    type: keyof typeof componentRegistry | keyof JSX.IntrinsicElements,
    props?: Record<string, any>,
    show?: Boolean,
    events?: Record<string, any>[],
}


type Config = {
    name: string
    type: keyof typeof componentRegistry | keyof JSX.IntrinsicElements,
    props?: Record<string, any>,
    nestedChildren?: Config[]
    selfClosing?: Boolean
    show?: Boolean,
    childNode?: React.ReactNode,
    events?: Record<string, any>[]
    visibility?: Record<string, any>
}

interface Container {
    config: ContainerConfig,
    components: Config[],
}

type WrapperConfig = {
    container: Container,
    children?: React.ReactNode
    handleEvents?: (e: any) => void
}

const DynamicContainer = ({ container, children }: WrapperConfig) => {

    const ContainerComponent = componentRegistry[container.config.type] || container.config.type || 'div'

    if (container.config.show === false) return null

    return (
        <ContainerComponent {...container.config.props}>
            {children}
            {(container.components || []).map((compConfig, i) => (
                <DynamicComponent key={i} config={compConfig} children={compConfig.childNode} />
            ))}
        </ContainerComponent>
    )
}

export default DynamicContainer
