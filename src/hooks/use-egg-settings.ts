import { useSyncExternalStore } from "react";
import {
  effectiveSettings,
  getEggSettings,
  getServerEggSettings,
  resetEggSettings,
  setEggSettings,
  subscribeEggSettings,
  type EggSettings,
} from "@/lib/egg-settings";

/** Reactive access to the persisted easter-egg settings. */
export function useEggSettings() {
  const settings = useSyncExternalStore(subscribeEggSettings, getEggSettings, getServerEggSettings);
  return {
    settings,
    effective: effectiveSettings(settings),
    update: (patch: Partial<EggSettings>) => setEggSettings(patch),
    reset: resetEggSettings,
  };
}
