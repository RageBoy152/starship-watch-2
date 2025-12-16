"use client";

import { Vehicle } from "@/lib/types";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { useGlobals } from "../ContextProviders/GlobalsProvider";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";

export default function Booster({ vehicle }: { vehicle: Vehicle }) {
  const { transports, routes } = useGlobals();
  const { scene } = useGLTF(`/models/vehicles/${vehicle.vehicle_config}/${vehicle.vehicle_config}.gltf`);
  const vehicleRef = useRef<THREE.Group|null>(null);

  vehicle.milestones.forEach(ms => {
    const objParent = scene.getObjectByName(ms.name.replace(":","_").replace(" ","_"));
    objParent?.traverse(_child => {
      const child = _child as THREE.Mesh;
      child.visible = ms.complete;
    });
  });

  let pos = new THREE.Vector3(vehicle.position.x,vehicle.position.y,vehicle.position.z);
  const vehicleTransport = transports.find(transport => transport.vehicle_id == vehicle.id);
  const route = vehicleTransport ? routes[vehicleTransport.route.toUpperCase()] : undefined;


  
  const standGLTF = useGLTF(vehicle.stand?`/models/stands/${vehicle.stand}.gltf`:"/models/empty.gltf");
  const standYOffset = useMemo(() => {
    if (!vehicle.stand) return 0;

    const marker = standGLTF.scene.getObjectByName("AFT_MARKER");
    return marker ? Math.abs(marker.position.y) : 0;
  }, [standGLTF]);

  pos.y += standYOffset;

  

  useFrame(() => {
    if (!route || !vehicleTransport || !vehicleRef.current) return;
    
    const now = Date.now();
    const progress = THREE.MathUtils.clamp((now - vehicleTransport.start_time) / (vehicleTransport.end_time - vehicleTransport.start_time), 0, 1);

    // position
    const point = route.getPointAt(progress);
    point.y = vehicle.position.y + standYOffset;
    vehicleRef.current.position.copy(point);

    // rotation
    const tangent = route.getTangentAt(progress).normalize();
    const lookAtTarget = point.clone().add(tangent);
    vehicleRef.current.lookAt(lookAtTarget);
  });

  return (
    <group ref={vehicleRef} position={pos} rotation={new THREE.Euler(0,degToRad(vehicle.rotation),0)}>
      <primitive object={scene} />
      {vehicle.stand && <primitive object={standGLTF.scene} />}
    </group>
  );
}