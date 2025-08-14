"use client";
import { useRouter } from "next/navigation";

// Minimal client-side action registry used by ComponentRegistry's ActionButton wrapper.
// Extend as needed.
export function useActionRegistry() {
  const router = useRouter();

  return {
    navigation: (args?: any) => {
      const path = args?.path || args?.href || args?.route;
      if (typeof path === "string" && path) router.push(path);
    },
    save: (_args?: any) => {
      // no-op or add toast/instrumentation here
      console.log("action: save");
    },
    submit: (_args?: any) => {
      console.log("action: submit");
    },
    cancel: (_args?: any) => {
      console.log("action: cancel");
    },
  } as const;
}
