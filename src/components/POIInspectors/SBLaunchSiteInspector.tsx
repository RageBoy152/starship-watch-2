"use client";

import { useGlobals } from "../ContextProviders/GlobalsProvider";
import { useEffect, useState } from "react";
import ChopstickSettings from "./ChopstickSettings";
import { POIInspectorProps } from "../POIInspector";


export default function SBLaunchSiteInspector({ updatePOIConfig }: POIInspectorProps) {
  const { poi } = useGlobals();


  // fix weird hydration errs
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, [])
  

  if (!mounted || !poi) return;
  return (
    <>
      <div className="uppercase">
        <p className="font-bold">Pad 2</p>
        <div className="flex flex-col gap-1 mt-1 font-medium">
          <ChopstickSettings prefix="PAD2" updatePOIConfig={updatePOIConfig} maxAngle={75.3} />
        </div>
      </div>

      <hr className="text-label-secondary/25" />

      <div className="uppercase">
        <p className="font-bold">Pad 1</p>
        <div className="flex flex-col gap-1 mt-1 font-medium">
          <ChopstickSettings prefix="PAD1" updatePOIConfig={updatePOIConfig} maxAngle={52.4} />
        </div>
      </div>
    </>
  );
}