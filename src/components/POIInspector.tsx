"use client";

import { useGlobals } from "./ContextProviders/GlobalsProvider";
import Section from "./UI/section";
import SBLaunchSiteInspector from "./POIInspectors/SBLaunchSiteInspector";
import { createClient } from "@/utils/supabase/client";
import moment from "moment-timezone";


export type POIInspectorProps = {
  updatePOIConfig: (key: string, value: any) => void
}

export default function POIInspector() {
  const { activeVehicle, poi } = useGlobals();
  const supabase = createClient();

  const updatePOIConfig = async (key: string, value: any) => {
    if (!poi) return;

    await supabase.from("pois").update({
      config: { ...poi.config, [key]: value },
      last_updated: moment().toISOString()
    }).eq("id", poi.id);
  }


  if (activeVehicle || !poi) return;
  return (
    <Section className="transition-opacity w-sm max-h-[calc(100dvh-2rem)] scrollbar overflow-y-auto">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="uppercase font-bold">
            <h2 className="text-2xl">{poi.name}</h2>
            <h3 className="font-consolas text-label-secondary">{poi.location.split(",").splice(0,2).join(",")}</h3>
          </div>
          <div className="font-consolas font-bold uppercase text-success/75">Online</div>
        </div>

        <hr className="text-label-secondary/25" />

        {poi.id == "da41c0c8-7a89-4962-b190-ab0d8a634659" && <SBLaunchSiteInspector updatePOIConfig={updatePOIConfig} />}
      </div>
    </Section>
  );
}