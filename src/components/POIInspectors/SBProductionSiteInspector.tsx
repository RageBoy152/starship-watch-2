"use client";

import { useGlobals } from "../ContextProviders/GlobalsProvider";
import { useEffect, useState } from "react";
import { POIInspectorProps } from "../POIInspector";
import { Slider } from "../UI/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../UI/collapsible";

export default function SBProductionSiteInspector({ updatePOIConfig }: POIInspectorProps) {
  const { poi } = useGlobals();
  

  // fix weird hydration errs
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, [])
  

  if (!mounted || !poi) return;
  return (
    <>
      <Collapsible>
        <CollapsibleTrigger asChild>
          <p className="font-bold">Megabay Doors</p>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-1 mt-1 font-medium">
            <DoorSetting defaultValue={poi.config["mb1_door_open"]??0} configKey="mb1_door_open" label="Megabay 1" updatePOIConfig={updatePOIConfig} />
            <DoorSetting defaultValue={poi.config["mb2_door_open"]??0} configKey="mb2_door_open" label="Megabay 2" updatePOIConfig={updatePOIConfig} />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}


const DoorSetting = ({ defaultValue, configKey, label, updatePOIConfig }: { defaultValue: number, configKey: string, label: string, updatePOIConfig: (key:string,value:any) => void }) => {
  const [open, setOpen] = useState(defaultValue);

  return (
    <div>
      <div className="flex items-center justify-between">
        <p>{label}</p>
        <p className="font-consolas font-bold text-sm">{open.toFixed(2)}</p>
      </div>
      <Slider min={0} max={1} step={0.01} value={[open]} onValueChange={(newVal) => setOpen(newVal[0])} onValueCommit={(value) => updatePOIConfig(configKey, value[0])} />
    </div>
  );
}