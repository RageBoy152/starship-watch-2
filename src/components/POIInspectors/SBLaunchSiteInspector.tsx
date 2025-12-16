"use client";

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../UI/select";
import { useGlobals } from "../ContextProviders/GlobalsProvider";
import { POIInspectorProps } from "../POIInspector";
import { useEffect, useState } from "react";
import { Slider } from "../UI/slider";
import { XIcon } from "lucide-react";

export default function SBLaunchSiteInspector({ updatePOIConfig }: POIInspectorProps) {
  const { poi, poiVehicles } = useGlobals();
  const [stickRotation, setstickRotation] = useState(0);
  const [stickOpen, setStickOpen] = useState(0);

  useEffect(() => {
    if (!poi) return;
    setStickOpen(poi.config["pad2_chopstick_open"]??0);
    setstickRotation(poi.config["pad2_chopstick_rotation"]??0);
  }, [poi]);


  // fix weird hydration errs
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, [])
  
  if (!mounted || !poi) return;
  return (
    <div className="uppercase">
      <p className="font-bold">Pad 2</p>
      <div className="flex flex-col gap-1 mt-1 font-medium">
        <div>
          <p>Chopsticks Height</p>
          <Select value={poi.config["pad2_chopstick_height"]} onValueChange={(newVal) => updatePOIConfig("pad2_chopstick_height", newVal)}>
            <SelectTrigger className="font-bold font-consolas uppercase text-label-secondary/75 bg-bg-secondary/50 border border-label-secondary/25 w-full mb-2">
              <SelectValue></SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Chopsticks Height</SelectLabel>
                <SelectItem value="0">Rest</SelectItem>
                <SelectItem value="1">Lift S</SelectItem>
                <SelectItem value="2">Lift B</SelectItem>
                <SelectItem value="3">Stack B</SelectItem>
                <SelectItem value="4">Stack S (Launch)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <p>Chopsticks Rotation</p>
            <p className="font-consolas font-bold text-sm">{stickRotation.toFixed()}</p>
          </div>
          <Slider min={-75.3} max={75.3} snapPoints={[0]} snapThreshold={2} value={[stickRotation]} onValueChange={(value) => setstickRotation(value[0])} onValueCommit={(value) => updatePOIConfig("pad2_chopstick_rotation", value[0])} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <p>Chopsticks Open</p>
            <p className="font-consolas font-bold text-sm">{stickOpen.toFixed(2)}</p>
          </div>
          <Slider min={0} max={1} step={0.01} value={[stickOpen]} onValueChange={(value) => setStickOpen(value[0])} onValueCommit={(value) => updatePOIConfig("pad2_chopstick_open", value[0])} />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p>Attatched Vehicle</p>
            <XIcon className="w-4 h-4 cursor-pointer" onClick={() => updatePOIConfig("pad2_chopstick_vehicle", "")} />
          </div>
          <Select value={poi.config["pad2_chopstick_vehicle"]} onValueChange={(newVal) => updatePOIConfig("pad2_chopstick_vehicle", newVal)}>
            <SelectTrigger className="font-bold font-consolas uppercase text-label-secondary/75 bg-bg-secondary/50 border border-label-secondary/25 w-full mb-2">
              <SelectValue></SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Boosters</SelectLabel>
                {poiVehicles.filter(v => v.type=="booster").map(v =>
                  <SelectItem className="uppercase" key={v.id} value={v.id}>{v.type} {v.serial_number}</SelectItem>
                )}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Ships</SelectLabel>
                {poiVehicles.filter(v => v.type=="ship").map(v =>
                  <SelectItem className="uppercase" key={v.id} value={v.id}>{v.type} {v.serial_number}</SelectItem>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}