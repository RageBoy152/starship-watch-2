"use client";

import Section from "./UI/section";
import { Tooltip, TooltipContent, TooltipTrigger } from "./UI/tooltip";
import { Button } from "./UI/Button";
import { CalendarRangeIcon, ChartNoAxesCombinedIcon, ChevronDownIcon, LocateFixedIcon, Move3DIcon, SaveIcon } from "lucide-react";
import { clamp360, getVehicleStatusClass } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import VehicleStackingDiagram from "./VehicleStackingDiagram";
import { Checkbox } from "./UI/checkbox";
import { useGlobals } from "./ContextProviders/GlobalsProvider";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./UI/select";
import * as THREE from "three";
import { createClient } from "@/utils/supabase/client";
import moment from "moment-timezone";
import { POI, stands, VehicleMilestone, VehicleStatus } from "@/lib/types";
import { locationPresets } from "@/lib/tempData";
import { Dialog, DialogTrigger } from "./UI/dialog";
import VehicleAnalyticsModal from "./VehicleAnalyticsModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "./UI/dropdown-menu";
import { Slider } from "./UI/slider";
import { twMerge } from "tailwind-merge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./UI/collapsible";
import { useThree } from "@react-three/fiber";
import { radToDeg } from "three/src/math/MathUtils.js";


export default function VehicleInspector() {
  const { activeVehicle: vehicle, transports, routes, poi, POIs, setMoveGizmo, moveGizmo, camControlsRef, vehicleObjectRefs } = useGlobals();
  const vehicleTransport = transports.find(transport => transport.vehicle_id == vehicle?.id);
  const [vehicleTransportProgress, setVehicleTransportProgress] = useState(0);
  const [vehicle3D, setVehicle3D] = useState<THREE.Object3D|undefined>(undefined);

  const [rotation, setRotation] = useState(vehicle?.rotation??0);

  const parentChopsticks = (!poi||!vehicle)?undefined :Object.entries(poi.config).find(([key, value]) => key.match(/^pad\d+_chopstick_vehicle$/i) && value == vehicle.id);

  const [newDescription, setNewDescription] = useState(vehicle?.description??"");
  useEffect(() => { if (vehicle) setNewDescription(vehicle.description??""); }, [vehicle?.description]);
  useEffect(() => { if (textareaRef.current) autoResize(textareaRef.current); }, [newDescription]);

  const [newLocation, setNewLocation] = useState(vehicle?.location??"");
  useEffect(() => { if (vehicle) setNewLocation(vehicle.location); }, [vehicle?.location]);

  const textareaRef = useRef<HTMLTextAreaElement|null>(null);
  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight+2}px`;
  }

  useEffect(() => {
    if (!vehicle) { setVehicle3D(undefined); }
    else setVehicle3D(vehicleObjectRefs.current[vehicle.id]);

    setRotation(vehicle?.rotation??0);
  }, [vehicle]);


  const locate = () => {
    const controls = camControlsRef.current;
    if (!controls || !vehicle) return;

    const target = new THREE.Vector3(
      vehicle.position.x,
      vehicle.position.y,
      vehicle.position.z
    );

    const yOffset = vehicle.type=="ship"?20:40

    controls.setLookAt(
      target.x+100,
      target.y+yOffset+20,
      target.z+50,
      target.x,
      target.y+yOffset,
      target.z,
      true
    );
  }


  const supabase = createClient();
  
  useEffect(() => {
    if (!vehicleTransport) {
      setVehicleTransportProgress(0);
      return;
    }
    else {
      setMoveGizmo(null);
      setTransportRoute(vehicleTransport.route);
    }

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
      end_time: Date.now()+ (poi.id=="0403e1dc-fe0e-401d-835e-092bbfde8772"?(60000*5):(60000)), // 5 min from MB TO HW4, 15 min from GB to HW4 END
      vehicle_id: vehicle.id,
      poi: poi.id
    });

    await supabase.from("vehicles").update({
      location_preset: null
    }).eq("id", vehicle.id);
  }

  const stopTransport = async () => {
    if (!vehicleTransport || !vehicle || !vehicle3D) return;

    // update vehicle pos
    await supabase.from("vehicles").update({
      position: {
        x: vehicle3D.position.x,
        y: vehicle3D.position.y,
        z: vehicle3D.position.z,
      },
      rotation: Math.round(clamp360(radToDeg(vehicle3D.rotation.y)+(vehicle.type=="booster"?0:0)))
    }).eq("id", vehicle.id);

    // remove transport
    await supabase.from("transports").delete().eq("id", vehicleTransport.id);
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


  const setVehicleRotation = async (newRotation: number) => {
    if (!vehicle) return;

    await supabase.from("vehicles").update({
      rotation: newRotation,
      location_preset: null
    }).eq("id", vehicle.id);
  }


  const setLocationPreset = async (newPOI: POI, location: string, sublocation: string, locationPresetValue: { x: number, y: number, z: number, r?: number }) => {
    if (!vehicle) return;

    await supabase.from("vehicles").update({
      location_preset: `${location} | ${sublocation}`,
      location: `${location} | ${sublocation}`,
      position: {
        x: locationPresetValue.x,
        y: locationPresetValue.y,
        z: locationPresetValue.z,
      },
      rotation: locationPresetValue.r!=undefined ? locationPresetValue.r : vehicle.rotation,
      poi: newPOI.id
    }).eq("id", vehicle.id);
  }


  const setLocation = async (location: string) => {
    if (!vehicle) return;

    let filteredLocation = location.trim()
    if (filteredLocation == "") return;

    await supabase.from("vehicles").update({
      location: filteredLocation
    }).eq("id", vehicle.id);
  }


  const setDescription = async (desc: string) => {
    if (!vehicle) return;

    let filteredDesc = desc.trim()

    await supabase.from("vehicles").update({
      description: filteredDesc==""?null:filteredDesc
    }).eq("id", vehicle.id);
  }


  if (!vehicle) return;

  return (
    <div className="flex gap-2">
      {stackingDiagramActive && <VehicleStackingDiagram vehicle={vehicle} closeDiagram={() => setStackingDiagramActive(false)} />}
    
      <Section className={`${!vehicle?"opacity-0":"opacity-100"} transition-opacity w-sm max-h-[calc(100dvh-2rem)] scrollbar overflow-y-auto h-fit`}>
        <div className="flex flex-col gap-3 uppercase">

          <div className="flex items-center justify-between">
            <div className="font-bold">
              <h2 className="text-2xl">{vehicle.type} {vehicle.serial_number}</h2>
              <h3 className="font-consolas text-label-secondary">{vehicle.location_preset??vehicle.location}</h3>
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
                  <Button className="w-fit p-3" onClick={locate}>
                    <LocateFixedIcon className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Locate</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <p className={`font-consolas font-bold -my-2 ${vehicle&&getVehicleStatusClass(vehicle?.status)}`}>{vehicle?.status}</p>

          {vehicle.description && <p className="text-label-secondary whitespace-pre-wrap normal-case">{vehicle.description}</p>}

          <hr className="text-label-secondary/25" />

          <div>
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

          <Collapsible onOpenChange={() => { if (textareaRef.current) autoResize(textareaRef.current); }}>
            <CollapsibleTrigger asChild>
              <p className="font-bold">Edit Details</p>
            </CollapsibleTrigger>
            <CollapsibleContent>
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
                  <Select disabled={parentChopsticks!=undefined} value={vehicle.stand==undefined?"none":vehicle.stand} onValueChange={(newStand) => setVehicleStand(newStand)}>
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
                  <div className="flex justify-between items-center">
                    <p>Position</p>
                    <p className="font-consolas font-bold text-label-secondary/75 -mt-1">{vehicle.position.x.toFixed(2)}, {vehicle.position.y.toFixed(2)}, {vehicle.position.z.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger disabled={vehicleTransport!=undefined||parentChopsticks!=undefined} asChild>
                        <button className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 text-sm flex justify-between items-center text-label-secondary/75 bg-bg-secondary/50 border border-label-secondary/25 px-3 py-1 w-full uppercase font-consolas font-bold">
                          <p>{vehicle.location_preset??"Position Preset"}</p>
                          <ChevronDownIcon className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-80">
                        <DropdownMenuLabel>Position Preset</DropdownMenuLabel>
                        <DropdownMenuGroup>
                          {POIs.filter(_poi => locationPresets[_poi.id] != undefined).map(_poi =>
                            <DropdownMenuSub key={_poi.id}>
                              <DropdownMenuSubTrigger>{_poi.name}</DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent className="w-60">
                                  <DropdownMenuLabel>{_poi.name}</DropdownMenuLabel>
                                  {Object.entries(locationPresets[_poi.id]).map(([location, sublocations]) =>
                                    <DropdownMenuSub key={location}>
                                      <DropdownMenuSubTrigger>{location[0].toUpperCase()}{location.slice(1,)}</DropdownMenuSubTrigger>
                                      <DropdownMenuPortal>
                                        <DropdownMenuSubContent className="w-40">
                                          <DropdownMenuLabel>{location}</DropdownMenuLabel>
                                          {Object.entries(sublocations).map(([sublocation,value]) =>
                                            <DropdownMenuItem key={sublocation} onClick={() => setLocationPreset(_poi, location, sublocation, value)}>{sublocation[0].toUpperCase()}{sublocation.slice(1,)}</DropdownMenuItem>
                                          )}
                                        </DropdownMenuSubContent>
                                      </DropdownMenuPortal>
                                    </DropdownMenuSub>
                                  )}
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                          )}
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button disabled={vehicleTransport!=undefined||parentChopsticks!=undefined} className={`w-fit p-2 ${moveGizmo==vehicle.id?"bg-accent/50 hover:bg-accent":""}`} onClick={() => setMoveGizmo(prev => prev==vehicle.id?null:vehicle.id)}>
                          <Move3DIcon className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Manual Move</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>}


                <div>
                  <div className="flex items-center justify-between">
                    <p>Rotation</p>
                    <p className="font-consolas font-bold text-sm">{rotation.toFixed()}</p>
                  </div>
                  <Slider disabled={vehicleTransport!=undefined||parentChopsticks!=undefined} min={0} max={360} step={5} snapPoints={[0,45,90,180,225,270,315,360]} snapThreshold={15} value={[rotation]} onValueChange={(newVal) => setRotation(newVal[0])} onValueCommit={(value) => setVehicleRotation(value[0])} />
                </div>


                <div>
                  <div className="flex items-center justify-between">
                    <p>Location</p>
                    {(newLocation != (vehicle.location??"")) && <Tooltip>
                      <TooltipTrigger asChild>
                        <Button className="w-fit p-1" onClick={() => setLocation(newLocation)}>
                          <SaveIcon className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Save Changes</p>
                      </TooltipContent>
                    </Tooltip>}
                  </div>
                  <input placeholder="Location" type="text" maxLength={30} value={newLocation} onChange={(e)=>{ setNewLocation(e.currentTarget.value) }} className="w-full py-1 px-3 bg-bg-secondary/50 border border-label-secondary/25 outline-none" />
                </div>


                <div>
                  <div className="flex items-center justify-between">
                    <p>Description</p>
                    {(newDescription != (vehicle.description??"")) && <Tooltip>
                      <TooltipTrigger asChild>
                        <Button className="w-fit p-1" onClick={() => setDescription(newDescription)}>
                          <SaveIcon className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Save Changes</p>
                      </TooltipContent>
                    </Tooltip>}
                  </div>
                  <textarea maxLength={400} ref={textareaRef} value={newDescription} onChange={(e) => setNewDescription(e.currentTarget.value)} placeholder="Description..." className="w-full py-1 px-3 bg-bg-secondary/50 border border-label-secondary/25 outline-none resize-none"></textarea>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <hr className="text-label-secondary/25" />

          <Collapsible>
            <CollapsibleTrigger asChild>
              <p className="font-bold">Edit Milestones</p>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="flex flex-col gap-1 mt-1 font-medium">
                {vehicle.milestones.map(ms =>
                  <VehicleMilestoneEditor key={`${vehicle.id}-${ms.name}`} ms={ms} editMilestone={(newChecked, newDate) => editVehicleMilestone(ms.name, newChecked, newDate)} />
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <hr className="text-label-secondary/25" />

          <Collapsible>
            <CollapsibleTrigger asChild>
              <p className="font-bold">Transport</p>
            </CollapsibleTrigger>
            <CollapsibleContent>
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

                {!vehicleTransport && <Button className="py-1 font-consolas uppercase not-disabled:hover:bg-success/50" disabled={!transportRoute||parentChopsticks!=undefined} onClick={() => addTransport()}>Start</Button>}
                {vehicleTransport && <div className="px-2 py-1 flex justify-between items-center font-consolas font-bold bg-bg-secondary/50 backdrop-blur-lg border border-label-primary/30 relative">
                  <p>{vehicleTransportProgress==0?"Prepping Transport...":(vehicleTransportProgress==1?"Transport Complete":"Driving...")}</p>
                  <p className="lowercase">{(vehicleTransportProgress * 100).toFixed(1)}%</p>
                  <div className="absolute start-0 top-0 h-full bg-success/25 -z-1 pointer-events-none" style={{ width: `${vehicleTransportProgress*100}%` }}></div>
                </div>}
                {vehicleTransport && <Button className="py-1 font-consolas uppercase bg-danger/25 hover:bg-danger/50" onClick={() => stopTransport()}>Stop</Button>}
              </div>
            </CollapsibleContent>
          </Collapsible>

        </div>
      </Section>
    </div>
  );
}



const VehicleMilestoneEditor = ({ ms, editMilestone }: { ms: VehicleMilestone, editMilestone: (newChecked: boolean, newDate?: string) => void }) => {
  const [newCompleteDate, setNewCompleteDate] = useState(ms.complete_date);
  useEffect(() => { setNewCompleteDate(ms.complete_date); }, [ms]);

  return (
    <div className="flex gap-2 items-center">
      <Checkbox checked={ms.complete} onCheckedChange={(checked) => editMilestone(checked as boolean, ms.complete_date)} />
      <p>{ms.name}</p>
      {ms.complete && <div className="w-1/2 ms-auto flex gap-1 items-center">
        <input placeholder="YYYY-MM-DD" type="text" maxLength={10} value={newCompleteDate} onChange={(e)=>{ setNewCompleteDate(e.currentTarget.value) }} className="bg-bg-secondary/50 border border-label-secondary/25 outline-none w-full px-1 py-0" />

        {(newCompleteDate != (ms.complete_date??"")) && <Tooltip>
          <TooltipTrigger asChild>
            <Button className="w-fit p-1.5" onClick={() => editMilestone(ms.complete, newCompleteDate)}>
              <SaveIcon className="w-3 h-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Save Changes</p>
          </TooltipContent>
        </Tooltip>}  
      </div>}
    </div>
  );
}