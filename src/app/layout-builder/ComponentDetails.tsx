"use client";

import React from "react";
import ButtonConfigurator from "./ButtonConfigurator";
import HeaderConfigurator from "./HeaderConfigurator";
import CardConfigurator from "./CardConfigurator";
import ModalConfigurator from "./ModalConfigurator";
import ToastConfigurator from "./ToastConfigurator";

type Props = {
  selectedKey: string | null;
};

export default function ComponentDetails({ selectedKey }: Props) {
  if (!selectedKey) {
    return (
      <div className="rounded-lg border border-black/10 bg-white/70 p-6 text-sm text-black/70">
        Select a component from the left to view details.
      </div>
    );
  }

  if (selectedKey === "modal") {
    return (
      <div className="h-full min-h-0 flex flex-col">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="text-sm uppercase tracking-wide text-blue-700">Configurator</div>
          <div className="mt-1 text-lg font-semibold text-blue-900">Modal</div>
        </div>
        <div className="mt-4 flex-1 min-h-0 overflow-auto pr-1">
          <ModalConfigurator />
        </div>
      </div>
    );
  }

  if (selectedKey === "button" || selectedKey === "buttonGroup") {
    return (
      <div className="h-full min-h-0 flex flex-col">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="text-sm uppercase tracking-wide text-blue-700">Configurator</div>
          <div className="mt-1 text-lg font-semibold text-blue-900">Buttons</div>
        </div>
        <div className="mt-4 flex-1 min-h-0 overflow-auto pr-1">
          <ButtonConfigurator />
        </div>
      </div>
    );
  }

  if (selectedKey === "header") {
    return (
      <div className="h-full min-h-0 flex flex-col">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="text-sm uppercase tracking-wide text-blue-700">Configurator</div>
          <div className="mt-1 text-lg font-semibold text-blue-900">Header</div>
        </div>
        <div className="mt-4 flex-1 min-h-0 overflow-auto pr-1">
          <HeaderConfigurator />
        </div>
      </div>
    );
  }

  if (selectedKey === "cards" || selectedKey === "card") {
    return (
      <div className="h-full min-h-0 flex flex-col">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="text-sm uppercase tracking-wide text-blue-700">Configurator</div>
          <div className="mt-1 text-lg font-semibold text-blue-900">Cards</div>
        </div>
        <div className="mt-4 flex-1 min-h-0 overflow-auto pr-1">
          <CardConfigurator />
        </div>
      </div>
    );
  }

  if (selectedKey === "toast") {
    return (
      <div className="h-full min-h-0 flex flex-col">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="text-sm uppercase tracking-wide text-blue-700">Configurator</div>
          <div className="mt-1 text-lg font-semibold text-blue-900">Toast</div>
        </div>
        <div className="mt-4 flex-1 min-h-0 overflow-auto pr-1">
          <ToastConfigurator />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="text-sm uppercase tracking-wide text-blue-700">Selected Component</div>
        <div className="mt-1 text-lg font-semibold text-blue-900">{selectedKey}</div>
      </div>
      <div className="rounded-lg border border-black/10 bg-white p-6 text-sm text-black/70">
        Coming soon: configurator for <span className="font-mono">{selectedKey}</span>.
      </div>
    </div>
  );
}
