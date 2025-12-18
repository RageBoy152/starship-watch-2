"use client";

import { useEffect, useMemo, useState } from "react";
import { useGlobals } from "../ContextProviders/GlobalsProvider";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../UI/select";
import { Slider } from "../UI/slider";
import { XIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { UUID } from "crypto";


type ChopstickSettingsProps = {
  prefix: string // "PAD2", "PAD1", etc
  updatePOIConfig: (key: string, value: any) => void
  maxAngle: number
}

export default function ChopstickSettings({ prefix, updatePOIConfig, maxAngle }: ChopstickSettingsProps) {
  const { poiVehicles, poi, transports } = useGlobals();
  const [stickRotation, setstickRotation] = useState(0);
  const [stickOpen, setStickOpen] = useState(0);
  const supabase = createClient();


  useEffect(() => {
    setstickRotation(poi?.config[`${prefix.toLowerCase()}_chopstick_rotation`]??0);
    setStickOpen(poi?.config[`${prefix.toLowerCase()}_chopstick_open`]??0);
  }, [poi]);


  const attachVehicleObject = async (vehicleId: UUID) => {
    await supabase.from("vehicles").update({
      location_preset: null,
      location: `Pad ${prefix[prefix.length-1]} | Chopsticks`,
      stand: null
    }).eq("id", vehicleId);
  }


  const safePOIVehicles = useMemo(() => {
    return poiVehicles.filter(v => transports.find(transport => transport.vehicle_id == v.id)==undefined)
  }, [poiVehicles, transports]);


  if (!poi) return;
  return (
    <>
      <div>
        <p>Chopsticks Height</p>
        <Select value={poi.config[`${prefix.toLowerCase()}_chopstick_height`]} onValueChange={(newVal) => updatePOIConfig(`${prefix.toLowerCase()}_chopstick_height`, newVal)}>
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
        <Slider min={-maxAngle} max={maxAngle} snapPoints={[0]} snapThreshold={2} value={[stickRotation]} onValueChange={(value) => setstickRotation(value[0])} onValueCommit={(value) => updatePOIConfig(`${prefix.toLowerCase()}_chopstick_rotation`, value[0])} />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <p>Chopsticks Open</p>
          <p className="font-consolas font-bold text-sm">{stickOpen.toFixed(2)}</p>
        </div>
        <Slider min={0} max={1} step={0.01} value={[stickOpen]} onValueChange={(value) => setStickOpen(value[0])} onValueCommit={(value) => updatePOIConfig(`${prefix.toLowerCase()}_chopstick_open`, value[0])} />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <p>Attatched Vehicle</p>
          <XIcon className="w-4 h-4 cursor-pointer" onClick={() => updatePOIConfig(`${prefix.toLowerCase()}_chopstick_vehicle`, "")} />
        </div>
        <Select value={poi.config[`${prefix.toLowerCase()}_chopstick_vehicle`]} onValueChange={(newVal) => { attachVehicleObject(newVal as UUID); updatePOIConfig(`${prefix.toLowerCase()}_chopstick_vehicle`, newVal); }}>
          <SelectTrigger className="font-bold font-consolas uppercase text-label-secondary/75 bg-bg-secondary/50 border border-label-secondary/25 w-full mb-2">
            <SelectValue></SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Boosters</SelectLabel>
              {safePOIVehicles.filter(v => v.type=="booster").map(v =>
                <SelectItem className="uppercase" key={v.id} value={v.id}>{v.type} {v.serial_number}</SelectItem>
              )}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Ships</SelectLabel>
              {safePOIVehicles.filter(v => v.type=="ship").map(v =>
                <SelectItem className="uppercase" key={v.id} value={v.id}>{v.type} {v.serial_number}</SelectItem>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}