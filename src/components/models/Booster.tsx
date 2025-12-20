"use client";

import { Vehicle } from "@/lib/types";
import { Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { SkeletonUtils } from "three-stdlib";
import { useTransportRoute } from "./VehicleModules/useTransportRoute";
import { useStandAttachment } from "./VehicleModules/useStandAttachment";
import { useChopstickAttachment } from "./VehicleModules/useChopstickAttachment";
import Section from "../UI/section";
import ReusableTransformControls from "./VehicleModules/ReusableTransformControls";
import { locationPresets } from "@/lib/tempData";
import { useBoosterCH4Stack } from "./VehicleModules/useBoosterCH4Stack";
import { useMilestoneVisibility } from "./VehicleModules/useMilestoneVisibility";
import { useGlobals } from "../ContextProviders/GlobalsProvider";
import SPMT from "./spmt";


const BARREL_ORDER = [
  "ax:2",
  "a6:4",
  "a5:4",
  "a4:4",
  "a3:4",
  "a2:4",
  "cx:3",
  "f3:4",
  "f2:4",
  "fx:3",
];


export default function Booster({ vehicle }: { vehicle: Vehicle }) {
  const { scene: gltfScene } = useGLTF(`/models/vehicles/${vehicle.vehicle_config}/${vehicle.vehicle_config}.gltf`);
  const scene = useMemo(() => SkeletonUtils.clone(gltfScene), [gltfScene]);
  const vehicleRef = useRef<THREE.Group|null>(null);
  const [hoverLabel, setHoverLabel] = useState(false);
  const { registerVehicleObject, unregisterVehicleObject } = useGlobals();


  // register 3d object ref
  useEffect(() => {
    if (!vehicleRef.current) return;
    registerVehicleObject(vehicle.id, vehicleRef.current);
    return () => { unregisterVehicleObject(vehicle.id); }
  }, [vehicle.id]);


  // add modules
  const { standScene, yOffset } = useStandAttachment(vehicle.stand);
  useTransportRoute({ vehicle, ref: vehicleRef, yOffset: yOffset });
  const wasAttached = useChopstickAttachment({ vehicle, ref: vehicleRef, chopstickYOffset: -61.715, chopstickRotationOffset: -4 });
  useMilestoneVisibility({ root: scene, vehicle, barrelOrder: BARREL_ORDER });
  useBoosterCH4Stack({ root: scene, vehicle, barrelOrder: BARREL_ORDER });


  // set transforms
  let pos = new THREE.Vector3(vehicle.position.x,vehicle.position.y,vehicle.position.z);
  pos.y += yOffset;

  useEffect(() => { if (!wasAttached.current) vehicleRef.current?.position.set(pos.x, pos.y, pos.z) }, [vehicle.stand, vehicle.position]);
  useEffect(() => { if (vehicleRef.current) vehicleRef.current.rotation.y = degToRad(vehicle.rotation); }, [vehicle.rotation]);
  useEffect(() => {
    if (!vehicleRef.current || !vehicle.location_preset) return;

    const locationPresetValue = locationPresets[vehicle.poi][vehicle.location_preset.split(" | ")[0]][vehicle.location_preset.split(" | ")[1]];
    vehicleRef.current.position.set(locationPresetValue.x, locationPresetValue.y+yOffset, locationPresetValue.z);
    if (locationPresetValue.r!=null) vehicleRef.current.rotation.y = degToRad(locationPresetValue.r);
  }, [vehicle, yOffset]);



  return (
    <>
      <group ref={vehicleRef} name={`VEHICLE_${vehicle?.id}`} onPointerEnter={() => setHoverLabel(true)} onPointerLeave={() => setHoverLabel(false)}>
        <primitive object={scene} />

        {standScene && <primitive object={standScene}>
          {true && <>
            <SPMT yOffset={yOffset} zOffset={-3.5} />
            <SPMT yOffset={yOffset} zOffset={3.5} />
          </>}
        </primitive>}

        {hoverLabel && <Html center position={[0,40,0]} className="pointer-events-none">
          <Section className="py-1 px-2 w-fit text-nowrap bg-bg-primary/80 pointer-events-none uppercase">{vehicle.type} {vehicle.serial_number}</Section>
        </Html>}
      </group>

      <ReusableTransformControls ref={vehicleRef} vehicle={vehicle} yOffset={yOffset} />
    </>
  );
}