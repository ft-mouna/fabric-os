/*
  GlobalState (New Application)
  -----------------------------
  Purpose:
  - Provides a lightweight, application-scoped state container for the new runtime.
    Components can read/write shared state without coupling to a specific feature set.

  How it is used:
  - Wrap the area that renders dynamic containers/components with `DynamicStateProvider`.
    Use the `useDynamicState()` hook to access `{ dynamicState, handleStateChange, setDynamicState }`.

  Contract:
  - `dynamicState`: a plain object that you control. Keep it minimal; add keys only as needed.
  - `handleStateChange(key, value)`: updates state at a (possibly nested) path. For example,
    `handleStateChange("ui.modal.isOpen", true)` creates `{ ui: { modal: { isOpen: true }}}`.
  - `setDynamicState`: raw setter for advanced scenarios (batch updates, resets, etc.).

  Scope in this minimal implementation:
  - No prepopulated keys or feature-specific structures. This avoids accidental coupling
    to legacy behaviors and keeps the runtime lean.

  Extensibility:
  - Introduce selectors, middleware-like hooks, or persistence later without changing the
    public API exposed by this module.
*/
import { createContext, useContext, useState } from "react";


const DynamicStateContext = createContext<any>({})

export const DynamicStateProvider = ({ children }: any) => {

    const [dynamicState, setDynamicState] = useState<any>({})

    /**
 * Adds or modifies state
 *
 * @param key The state key where the value is stored
 * @param value value to be stored in state
 * @returns void
 * 
 * `key` If you have an object in the state and you want to update a nested key, `handleStateChange supports that too!`
 * Example: key = i.am.super.cool would update the cool element with the value provided
 */
    const handleStateChange = (key: any, value: any) => {

        setDynamicState((prev: any) => {
            const newState = { ...prev };
            const keys = key.split(".");
            let current = newState;

            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {};
                current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = value;
            return newState;
        });

    }

    return (
        <DynamicStateContext.Provider value={{ dynamicState, handleStateChange, setDynamicState }} >
            {children}
        </DynamicStateContext.Provider>
    )

}

export const useDynamicState = () => useContext(DynamicStateContext);
