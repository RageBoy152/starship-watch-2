"use client";

import { Vehicle } from "@/lib/types";
import { Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { useEffect, useMemo, useRef, useState } from "react";
import Section from "../UI/section";
import { SkeletonUtils } from "three-stdlib";
import { useTransportRoute } from "./VehicleModules/useTransportRoute";
import { useStandAttachment } from "./VehicleModules/useStandAttachment";
import { useChopstickAttachment } from "./VehicleModules/useChopstickAttachment";


export default function Ship({ vehicle }: { vehicle: Vehicle }) {
  const { scene: gltfScene } = useGLTF(`/models/vehicles/${vehicle.vehicle_config}/${vehicle.vehicle_config}.gltf`);
  const scene = useMemo(() => SkeletonUtils.clone(gltfScene), [gltfScene]);
  const vehicleRef = useRef<THREE.Group|null>(null);
  const [hoverLabel, setHoverLabel] = useState(false);


  // add modules
  const { standScene, yOffset } = useStandAttachment(vehicle.stand);
  useTransportRoute({ vehicle, ref: vehicleRef, yOffset: yOffset, flipRotation: true });
  useChopstickAttachment({ vehicle, ref: vehicleRef, chopstickYOffset: -38, chopstickRotationOffset: 180-4 });


  // milestone model visibility
  vehicle.milestones.forEach(ms => {
    const objParent = scene.getObjectByName(ms.name.replace(":","_").replace(" ","_"));
    objParent?.traverse(_child => {
      const child = _child as THREE.Mesh;
      child.visible = ms.complete;
    });
  });


  // set transforms
  let pos = new THREE.Vector3(vehicle.position.x,vehicle.position.y,vehicle.position.z);
  pos.y += yOffset;

  useEffect(() => { vehicleRef.current?.position.set(pos.x, pos.y, pos.z) }, [vehicle.stand, vehicle.position]);
  useEffect(() => { if (vehicleRef.current) vehicleRef.current.rotation.y = degToRad(vehicle.rotation); }, [vehicle.rotation]);


  return (
    <group ref={vehicleRef} onPointerEnter={() => setHoverLabel(true)} onPointerLeave={() => setHoverLabel(false)}>
      <primitive object={scene} />

      {standScene && <primitive object={standScene} />}

      {hoverLabel && <Html center position={[0,20,0]} className="pointer-events-none">
        <Section className="py-1 px-2 w-fit text-nowrap bg-bg-primary/80 pointer-events-none uppercase">{vehicle.type} {vehicle.serial_number}</Section>
      </Html>}
    </group>
  );
}