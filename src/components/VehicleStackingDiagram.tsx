import { Vehicle } from "@/lib/types";
import Section from "./UI/section";
import { XIcon } from "lucide-react";
import moment from "moment-timezone";

export default function VehicleStackingDiagram({ vehicle, closeDiagram }: { vehicle: Vehicle, closeDiagram: () => void }) {
  return (
    <Section className="w-sm h-fit">
      <div className="flex items-center justify-between">
        <div className="uppercase font-bold">
          <h2 className="text-2xl">{vehicle.type} {vehicle.serial_number}</h2>
          <h3 className="font-consolas text-label-secondary">Stacking Diagram - {moment().format("YYYY-MM-DD")}</h3>
        </div>
        <button className="cursor-pointer p-3 pe-0" onClick={closeDiagram}><XIcon className="w-5 h-5" /></button>
      </div>

      <hr className="text-label-secondary/25" />

      <div className="flex flex-col items-center">
        {vehicle.milestones.filter(ms => ms.barrel).map(ms =>
          <div key={ms.name} className="flex w-full">
            <div className="relative flex w-full group">
              <img className={`w-50 ${ms.complete?"opacity-80 group-hover:opacity-100":"opacity-50 group-hover:opacity-70"}`} src={`/vehicle-config-images/stacking-diagram/${vehicle.vehicle_config}/${ms.name.replace(":","_").toUpperCase()}.png`} />
              <div className="absolute w-full h-full pointer-events-none group-hover:opacity-100 opacity-0 flex items-center justify-center">
                <p className="font-consolas font-bold uppercase">{ms.name}</p>
              </div>
            </div>
            <div className="border-t w-full border-label-secondary/25 uppercase font-bold">
              <div className="flex justify-between">
                <p>{ms.name}</p>
              </div>
              {ms.complete && <p className="font-consolas text-label-secondary/75">{ms.complete_date??"No Date"}</p>}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}