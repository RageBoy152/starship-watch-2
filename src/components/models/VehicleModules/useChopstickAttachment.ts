"use client";

import { useGlobals } from "@/components/ContextProviders/GlobalsProvider";
import { Vehicle } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { degToRad, radToDeg } from "three/src/math/MathUtils.js";


type UseChopstickAttachmentProps = {
  vehicle: Vehicle
  ref: React.RefObject<THREE.Object3D|null>
  chopstickYOffset: number
  chopstickRotationOffset: number
}

export function useChopstickAttachment({ vehicle, ref, chopstickYOffset, chopstickRotationOffset }: UseChopstickAttachmentProps) {
  const { chopstickVehicleMarkers, poi } = useGlobals();
  const { scene: worldScene } = useThree();
  const supabase = createClient();
  const wasAttached = useRef(false);


  const saveTransform = async (pos: THREE.Vector3, rot: number) => {
    await supabase.from("vehicles").update({
      position: {
        x: pos.x,
        y: pos.y,
        z: pos.z,
      },
      rotation: rot
    }).eq("id", vehicle.id);
  }


  useEffect(() => {
    if (!ref.current || !poi) return;

    // find what chopstick we're attatched to
    const entry = Object.entries(poi.config).find(([key, value]) => key.match(/^pad\d+_chopstick_vehicle$/i) && value == vehicle.id);
    const padKey = entry?.[0].split("_")[0].toUpperCase(); // PAD2, PAD1 etc
    const marker = padKey ? chopstickVehicleMarkers[padKey] : null;

    if (marker) {
      wasAttached.current = true;
      marker.attach(ref.current);
      
      ref.current.position.set(0,chopstickYOffset,0);
      ref.current.rotation.set(0,degToRad(chopstickRotationOffset),0);
    } else if (wasAttached.current) {
      wasAttached.current = false;

      const pos = new THREE.Vector3();
      const quat = new THREE.Quaternion();
      ref.current.getWorldPosition(pos);
      ref.current.getWorldQuaternion(quat);

      worldScene.attach(ref.current);

      saveTransform(pos, parseInt(radToDeg(new THREE.Euler().setFromQuaternion(quat).y).toFixed()));
    }
  }, [chopstickVehicleMarkers, poi, vehicle.id]);


  return wasAttached;
}