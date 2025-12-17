"use client";

import Section from "./UI/section";
import { Tooltip, TooltipContent, TooltipTrigger } from "./UI/tooltip";
import { Button } from "./UI/Button";
import { CalendarRangeIcon, ChartNoAxesCombinedIcon, ChevronDownIcon, LocateFixedIcon } from "lucide-react";
import { getVehicleStatusClass, groupPOIsByLocation } from "@/lib/utils";
import { useEffect, useState } from "react";
import VehicleStackingDiagram from "./VehicleStackingDiagram";
import { Checkbox } from "./UI/checkbox";
import { useGlobals } from "./ContextProviders/GlobalsProvider";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./UI/select";
import * as THREE from "three";
import { createClient } from "@/utils/supabase/client";
import moment from "moment-timezone";
import { stands, VehicleMilestone, VehicleStatus } from "@/lib/types";
import { locationPresets } from "@/lib/tempData";
import { Dialog, DialogTrigger } from "./UI/dialog";
import VehicleAnalyticsModal from "./VehicleAnalyticsModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "./UI/dropdown-menu";


export default function VehicleInspector() {
  const { activeVehicle: vehicle, transports, routes, poi, POIs } = useGlobals();
  const vehicleTransport = transports.find(transport => transport.vehicle_id == vehicle?.id);
  const [vehicleTransportProgress, setVehicleTransportProgress] = useState(0);

  const [vehicleSite, setVehicleSite] = useState<string|undefined>(vehicle?.poi);
  useEffect(() => { setVehicleSite(vehicle?.poi) }, [vehicle]);

  const supabase = createClient();
  
  useEffect(() => {
    if (!vehicleTransport) {
      setVehicleTransportProgress(0);
      return;
    }
    else setTransportRoute(vehicleTransport.route);

    const interval = setInterval(() => {
      const now = Date.now();
      const progress = THREE.MathUtils.clamp((now - vehicleTransport.start_time) / (vehicleTransport.end_time - vehicleTransport.start_time),0,1);
      setVehicleTransportProgress(progress);
    }, 100);

    return () => clearInterval(interval);
  }, [vehicleTransport]);


  const [stackingDiagramActive, setStackingDiagramActive] = useState(false);

  const [transportRoute, setTransportRoute] = useState<string|undefined>(vehicleTransport?.route);

  const addTransport = async () => {
    if (!transportRoute || !vehicle || !poi) return;

    await supabase.from("transports").insert({
      route: transportRoute.replace(" → ","-"),
      start_time: Date.now(),
      end_time: Date.now()+ (poi.id=="0403e1dc-fe0e-401d-835e-092bbfde8772"?(60000*5)+(60000*15):(60000*4)), // 5 min from MB TO HW4, 15 min from GB to HW4 END
      vehicle_id: vehicle.id,
      poi: poi.id
    });
  }

  const stopTransport = async () => {
    if (!vehicleTransport || !vehicle) return;

    const route = routes[vehicleTransport?.route.toUpperCase()];
    const point = route.getPointAt(vehicleTransportProgress);

    const tangent = route.getTangentAt(vehicleTransportProgress).normalize().multiplyScalar(vehicle.type=="ship"?-1:1); // rotate 180deg
    const tangentXZ = new THREE.Vector3(tangent.x, 0, tangent.z).normalize();
    const yRotationDeg = THREE.MathUtils.radToDeg(Math.atan2(tangentXZ.x, tangentXZ.z));


    // update vehicle pos
    if (point) await supabase.from("vehicles").update({
      position: {
        x: point.x,
        y: vehicle.position.y,
        z: point.z,
      },
      rotation: Math.round(yRotationDeg)
    }).eq("id", vehicle.id);

    // remove transport
    await supabase.from("transports").delete().eq("id", vehicleTransport.id);

    setTransportRoute(undefined);
  }


  const editVehicleMilestone = async (milestoneName: string, newComplete: boolean, newTimestamp?: string) => {
    if (!vehicle) return;
    if (newTimestamp && !moment(newTimestamp, "YYYY-MM-DD", true).isValid()) {
      console.log("Invalid syntax"); return;
    }

    await supabase.from("vehicles").update({
      milestones: vehicle.milestones.map(ms => ms.name == milestoneName ? {
        ...ms,
        complete: newComplete,
        complete_date: newTimestamp
      } : ms)
    }).eq("id", vehicle.id);
  }


  const changeVehicleSite = async () => {
    if (!vehicle || !vehicleSite) return;

    await supabase.from("vehicles").update({
      poi: vehicleSite
    }).eq("id", vehicle.id);
  }


  const setVehiclePosition = async (newPos: { x: number, y: number, z: number, r?: number }, location: string) => {
    if (!vehicle || !newPos || !location) return;

    console.log(`New Rotation: ${newPos.r!=undefined ? newPos.r : vehicle.rotation}`);

    await supabase.from("vehicles").update({
      position: { x: newPos.x, y: newPos.y, z: newPos.z },
      location: location,
      rotation: newPos.r!=undefined ? newPos.r : vehicle.rotation,
      stand: null
    }).eq("id", vehicle.id);
  }


  const setVehicleStatus = async (newStatus: VehicleStatus) => {
    if (!vehicle || !newStatus) return;

    await supabase.from("vehicles").update({
      status: newStatus
    }).eq("id", vehicle.id);
  }


  const setVehicleStand= async (newStand: string) => {
    if (!vehicle || !newStand) return;

    await supabase.from("vehicles").update({
      stand: newStand=="none"?null:newStand
    }).eq("id", vehicle.id);
  }

  if (!vehicle) return;

  return (
    <div className="flex gap-2">
      {stackingDiagramActive && <VehicleStackingDiagram vehicle={vehicle} closeDiagram={() => setStackingDiagramActive(false)} />}
    
      <Section className={`${!vehicle?"opacity-0":"opacity-100"} transition-opacity w-sm max-h-[calc(100dvh-2rem)] scrollbar overflow-y-auto`}>
        <div className="flex flex-col gap-3">

          <div className="flex items-center justify-between">
            <div className="uppercase font-bold">
              <h2 className="text-2xl">{vehicle.type} {vehicle.serial_number}</h2>
              <h3 className="font-consolas text-label-secondary">{vehicle.location}</h3>
            </div>

            <div className="flex gap-1">
              <Tooltip>
                <Dialog>
                  <DialogTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button className="w-fit p-3">
                        <ChartNoAxesCombinedIcon className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                  </DialogTrigger>
                    
                  <TooltipContent side="bottom">
                    <p>Vehicle Analytics</p>
                  </TooltipContent>

                  <VehicleAnalyticsModal />
                </Dialog>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className={`w-fit p-3 ${stackingDiagramActive?"bg-accent/50 hover:bg-accent":""}`} onClick={() => setStackingDiagramActive(prev => !prev)}>
                    <CalendarRangeIcon className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Stacking Diagram</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="w-fit p-3">
                    <LocateFixedIcon className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Locate</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <p className={`font-consolas font-bold uppercase -my-2 ${vehicle&&getVehicleStatusClass(vehicle?.status)}`}>{vehicle?.status}</p>

          <hr className="text-label-secondary/25" />

          <div className="uppercase">
            <p className="font-bold">Stats</p>
            <div className="grid grid-cols-2 gap-y-1 mt-1 font-medium">
              <div>
                <p>Flights</p>
                <p className="font-consolas font-bold text-label-secondary/75 -mt-1">0</p>
              </div>
              <div>
                <p>Cryo Tests</p>
                <p className="font-consolas font-bold text-label-secondary/75 -mt-1">0</p>
              </div>
              <div>
                <p>Barrels</p>
                <p className="font-consolas font-bold text-label-secondary/75 -mt-1">{vehicle.milestones.filter(ms => ms.barrel && ms.complete).length}/{vehicle.milestones.filter(ms => ms.barrel).length}</p>
              </div>
              <div>
                <p>Static Fires</p>
                <p className="font-consolas font-bold text-label-secondary/75 -mt-1">0</p>
              </div>
            </div>
          </div>

          <hr className="text-label-secondary/25" />

          <div className="uppercase">
            <p className="font-bold">Edit Details</p>
            <div className="flex flex-col gap-1 mt-1 font-medium">
              <div>
                <p>Status</p>
                <Select value={vehicle.status} onValueChange={(newStatus) => setVehicleStatus(newStatus as VehicleStatus)}>
                  <SelectTrigger className="font-bold font-consolas uppercase text-label-secondary/75 bg-bg-secondary/50 border border-label-secondary/25 w-full mb-2">
                    <SelectValue></SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Vehicle Status</SelectLabel>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                      <SelectItem value="destroyed">Destroyed</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p>Stand</p>
                <Select value={vehicle.stand==undefined?"none":vehicle.stand} onValueChange={(newStand) => setVehicleStand(newStand)}>
                  <SelectTrigger className="font-bold font-consolas uppercase text-label-secondary/75 bg-bg-secondary/50 border border-label-secondary/25 w-full mb-2">
                    <SelectValue></SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Select Stand</SelectLabel>
                      <SelectItem value="none">None</SelectItem>
                      {stands[vehicle.vehicle_config].map((stand,i) =>
                        <SelectItem value={stand} key={i} className="uppercase">{stand}</SelectItem>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {poi && <div>
                <p>Location</p>
                <p className="font-consolas font-bold text-label-secondary/75 -mt-1">{vehicle.position.x.toFixed(2)}, {vehicle.position.y.toFixed(2)}, {vehicle.position.z.toFixed(2)}</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="cursor-pointer flex justify-between items-center bg-bg-secondary/50 backdrop-blur-lg border border-label-primary/30 py-1 px-2 w-full uppercase font-consolas font-bold text-label-secondary/75">
                      <p>Move To</p>
                      <ChevronDownIcon className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-80">
                    <DropdownMenuLabel>Location</DropdownMenuLabel>
                    <DropdownMenuGroup>
                      {Object.entries(locationPresets[poi.id]).map(([location, sublocations]) =>
                        <DropdownMenuSub key={location}>
                          <DropdownMenuSubTrigger>{location[0].toUpperCase()}{location.slice(1,)}</DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent className="w-60">
                              <DropdownMenuLabel>{location}</DropdownMenuLabel>
                              {Object.entries(sublocations).map(([sublocation, value]) =>
                                <DropdownMenuItem key={sublocation} onClick={() => setVehiclePosition(value, location)}>{sublocation[0].toUpperCase()}{sublocation.slice(1,)}</DropdownMenuItem>
                              )}
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                      )}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>}
            </div>
          </div>

          <hr className="text-label-secondary/25" />

          <div className="uppercase">
            <p className="font-bold">Edit Milestones</p>
            <div className="flex flex-col gap-1 mt-1 font-medium">
              {vehicle.milestones.map(ms =>
                <VehicleMilestoneEditor key={`${vehicle.id}-${ms.name}`} ms={ms} editMilestone={(newChecked, newDate) => editVehicleMilestone(ms.name, newChecked, newDate)} />
              )}
            </div>
          </div>

          <hr className="text-label-secondary/25" />

          <div className="uppercase">
            <p className="font-bold">Transport</p>
            <div className="flex flex-col gap-1 mt-1 font-medium">
              <p>Route</p>
              <Select onValueChange={(val) => setTransportRoute(val)} value={transportRoute} disabled={vehicleTransport!=null}>
                <SelectTrigger className="font-bold font-consolas uppercase text-label-secondary/75 bg-bg-secondary/50 border border-label-secondary/25 w-full mb-2">
                  <SelectValue></SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{Object.entries(routes).length==0?"No Routes for this POI":"Choose Route"}</SelectLabel>
                      {Object.entries(routes).map(([name,]) =>
                        <SelectItem key={name} value={name}>{name.split("ROUTE_")[1].replace("-", " → ")}</SelectItem>
                      )}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {!vehicleTransport && <Button className="py-1 font-consolas uppercase hover:bg-success/50" disabled={!transportRoute} onClick={() => addTransport()}>Start</Button>}
              {vehicleTransport && <div className="px-2 py-1 flex justify-between items-center font-consolas font-bold bg-bg-secondary/50 backdrop-blur-lg border border-label-primary/30 relative">
                <p>{vehicleTransportProgress==0?"Prepping Transport...":(vehicleTransportProgress==1?"Transport Complete":"Driving...")}</p>
                <p className="lowercase">{(vehicleTransportProgress * 100).toFixed(1)}%</p>
                <div className="absolute start-0 top-0 h-full bg-success/25 -z-1 pointer-events-none" style={{ width: `${vehicleTransportProgress*100}%` }}></div>
              </div>}
              {vehicleTransport && <Button className="py-1 font-consolas uppercase bg-danger/25 hover:bg-danger/50" onClick={() => stopTransport()}>Stop</Button>}
            </div>

            <div className="flex flex-col gap-1 mt-1 font-medium">
              <p>Site</p>
              <Select onValueChange={(val) => setVehicleSite(val)} value={vehicleSite}>
                <SelectTrigger className="font-bold font-consolas uppercase text-label-secondary/75 bg-bg-secondary/50 border border-label-secondary/25 w-full mb-2">
                  <SelectValue></SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {groupPOIsByLocation(POIs).map((poiGroup, i) =>
                    <SelectGroup key={poiGroup.location} className={i>0?"mt-2":""}>
                      <SelectLabel>{poiGroup.location}</SelectLabel>
                        {poiGroup.sites.map(site =>
                          <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                        )}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>

              <Button className="py-1 font-consolas uppercase hover:bg-success/50" disabled={!vehicleSite} onClick={() => changeVehicleSite()}>Teleport</Button>
            </div>
          </div>

        </div>
      </Section>
    </div>
  );
}



const VehicleMilestoneEditor = ({ ms, editMilestone }: { ms: VehicleMilestone, editMilestone: (newChecked: boolean, newDate?: string) => void }) => {
  const [msDate, setMsDate] = useState<string>(ms.complete_date??"");

  return (
    <div className="flex gap-2 items-center">
      <Checkbox checked={ms.complete} onCheckedChange={(checked) => editMilestone(checked as boolean, ms.complete_date)} />
      <p>{ms.name}</p>
      {ms.complete && <input placeholder="YYYY-MM-DD" type="text" value={msDate} onChange={(e)=>{ setMsDate(e.currentTarget.value) }} onKeyDown={(e)=>{ if (e.key == "Enter") editMilestone(ms.complete, e.currentTarget.value); }} className="ms-auto w-1/2 bg-bg-secondary/50 border border-label-secondary/25 px-1 outline-none" />}
    </div>
  );
}