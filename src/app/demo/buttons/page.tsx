"use client";

/*
  Demo Page: Buttons
  ------------------
  Loads a JSON container config directly (no static TS builders) and renders via the generic runtime.
*/
import React from "react";
import DynamicContainer from "../../../container/DynamicContainer";
import buttonsContainer from "../../../configs/components/buttons.demo.json";
import { DynamicStateProvider } from "../../../container/GlobalState";

export default function ButtonsDemoPage() {
  return (
    <DynamicStateProvider>
      <div style={{ padding: 24 }}>
        <h2>Buttons Demo</h2>
        <DynamicContainer container={buttonsContainer as any}>
          {/* optional children can go here */}
        </DynamicContainer>
      </div>
    </DynamicStateProvider>
  );
}
