"use client";

import { Vehicle } from "@/lib/types";
import { Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { degToRad, radToDeg } from "three/src/math/MathUtils.js";
import { useGlobals } from "../ContextProviders/GlobalsProvider";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import Section from "../UI/section";
import { createClient } from "@/utils/supabase/client";

export default function Ship({ vehicle }: { vehicle: Vehicle }) {
  const { transports, routes, chopstickVehicleMarker, poi } = useGlobals();
  const { scene } = useGLTF(`/models/vehicles/${vehicle.vehicle_config}/${vehicle.vehicle_config}.gltf`);
  const { scene: worldScene } = useThree();
  const vehicleRef = useRef<THREE.Group|null>(null);
  const [hoverLabel, setHoverLabel] = useState(false);
  const supabase = createClient();


  useEffect(() => {
    if (!vehicleRef.current || !chopstickVehicleMarker || !poi) return;

    const savePos = async () => {
      if (!vehicleRef.current) return;
      const worldPos = new THREE.Vector3();
      const worldQuat = new THREE.Quaternion();

      vehicleRef.current.getWorldPosition(worldPos);
      vehicleRef.current.getWorldQuaternion(worldQuat);

      await supabase.from("vehicles").update({
        position: {
          x: worldPos.x,
          y: worldPos.y,
          z: worldPos.z,
        },
        rotation: radToDeg(new THREE.Euler().setFromQuaternion(worldQuat).y).toFixed()
      }).eq("id", vehicle.id);
    }

    if (poi.config["pad2_chopstick_vehicle"] == vehicle.id) {
      chopstickVehicleMarker.attach(vehicleRef.current);
      vehicleRef.current.position.set(0,-38,0);
      vehicleRef.current.rotation.set(0,degToRad(180-4),0); // 180deg offset for ship
    }
    else if (vehicleRef.current.position.y == -38) {
      worldScene.attach(vehicleRef.current);
      savePos();
    }

  }, [chopstickVehicleMarker, poi]);

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

  useEffect(() => { vehicleRef.current?.position.set(pos.x, pos.y, pos.z) }, [vehicle.stand, vehicle.position]);

  useEffect(() => { if (vehicleRef.current) vehicleRef.current.rotation.y = degToRad(vehicle.rotation); }, [vehicle.rotation]);



  useFrame(() => {
    if (!route || !vehicleTransport || !vehicleRef.current) return;
    
    const now = Date.now();
    const progress = THREE.MathUtils.clamp((now - vehicleTransport.start_time) / (vehicleTransport.end_time - vehicleTransport.start_time), 0, 1);

    // position
    const point = route.getPointAt(progress);
    point.y = vehicle.position.y + standYOffset;
    vehicleRef.current.position.copy(point);

    // rotation
    const tangent = route.getTangentAt(progress).normalize().multiplyScalar(-1);  // 180deg offset for ship
    const lookAtTarget = point.clone().add(tangent);
    vehicleRef.current.lookAt(lookAtTarget);
  });

  return (
    <group ref={vehicleRef}
      onPointerEnter={() => setHoverLabel(true)} onPointerLeave={() => setHoverLabel(false)}
      // position={poi?.config["pad2_chopstick_vehicle"] == vehicle.id?undefined:pos}
      // rotation={poi?.config["pad2_chopstick_vehicle"] == vehicle.id?undefined:new THREE.Euler(0,degToRad(vehicle.rotation),0)}
    >
      <primitive object={scene} />
      {vehicle.stand && <primitive object={standGLTF.scene} />}
      {hoverLabel && <Html center position={[0,20,0]} className="pointer-events-none">
        <Section className="py-1 px-2 w-fit text-nowrap bg-bg-primary/80 pointer-events-none uppercase">{vehicle.type} {vehicle.serial_number}</Section>
      </Html>}
    </group>
  );
}