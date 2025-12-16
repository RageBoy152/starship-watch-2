"use client";

import { chopstickPresets } from "@/lib/tempData";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../UI/select";
import { useGlobals } from "../ContextProviders/GlobalsProvider";
import { POIInspectorProps } from "../POIInspector";
import { useEffect, useState } from "react";

export default function SBLaunchSiteInspector({ updatePOIConfig }: POIInspectorProps) {
  const { poi } = useGlobals();

  // fix weird hydration errs
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, [])
  
  if (!mounted || !poi) return;
  return (
    <div className="uppercase">
      <p className="font-bold">Pad 2</p>
      <div className="flex flex-col gap-1 mt-1 font-medium">
        <div>
          <p>Chopsticks Preset</p>
          <Select value={poi.config["chopstick_preset"]} onValueChange={(newVal) => { updatePOIConfig("chopstick_preset", newVal) }}>
            <SelectTrigger className="font-bold font-consolas uppercase text-label-secondary/75 bg-bg-secondary/50 border border-label-secondary/25 w-full mb-2">
              <SelectValue></SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Chopsticks Preset</SelectLabel>
                {Object.entries(chopstickPresets).map(([name,value]) =>
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}