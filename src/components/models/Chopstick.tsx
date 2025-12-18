"use client";

import { moveTowards } from "@/lib/utils";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { degToRad } from "three/src/math/MathUtils.js";


type ChopstickProps = {
  root: THREE.Object3D
  prefix: string // "PAD2", "PAD1", etc
  config: Record<string, any>
  chopstickHeights: number[]
  zeroRotationOffset: number
  maxAngle: number
  onVehicleMarker?: (marker: THREE.Object3D) => void
}

export default function Chopstick({ root, prefix, config, chopstickHeights, zeroRotationOffset, maxAngle, onVehicleMarker }: ChopstickProps) {
  // get empty control objects
  const carriage = root.getObjectByName(`${prefix}_CARRIAGE`);
  const stickL = root.getObjectByName(`${prefix}_STICK_L`);
  const stickR = root.getObjectByName(`${prefix}_STICK_R`);
  const marker = root.getObjectByName(`${prefix}_CHOPSTICK_VEHICLE_MARKER`);

  // current & target states
  const current = useRef({ carriageY: 0, rotL: 0, rotR: 0 });
  const target = useRef({ carriageY: 0, rotL: 0, rotR: 0 });

  // instant snap to target on first load - prevents unintended animation on page load
  const firstLoad = useRef(true);

  // speed controls - should be added to config later
  const carriageSpeed = 7;
  const armSpeed = 1;



  useEffect(() => {
    if (!carriage || !stickL || !stickR) return;

    // get config values
    const preset = config[`${prefix.toLowerCase()}_chopstick_height`];
    const rotation = config[`${prefix.toLowerCase()}_chopstick_rotation`];
    const open = config[`${prefix.toLowerCase()}_chopstick_open`];

    const value = chopstickHeights[preset];
    if (value == null || rotation == null || open == null) return;

    const MIN = -(maxAngle-zeroRotationOffset);
    const MAX = maxAngle-zeroRotationOffset;

    const baseL = -zeroRotationOffset + 40 * open;
    const baseR =  zeroRotationOffset + 40 * open;

    const rotMin = Math.max(MIN - baseL, baseR - MAX);
    const rotMax = Math.min(MAX - baseL, baseR - MIN);

    const compensatedRotation = Math.min(rotMax, Math.max(rotMin, rotation));

    // set target values based on config
    target.current.carriageY = value;
    target.current.rotL = degToRad(baseL + compensatedRotation);
    target.current.rotR = degToRad(baseR - compensatedRotation);

    // snap to target on first load
    if (firstLoad.current) {
      current.current = { ...target.current };
      firstLoad.current = false;
    }
  }, [config, prefix]);


  useEffect(() => {
    if (marker && onVehicleMarker) onVehicleMarker(marker);
  }, [marker]);


  useFrame((_, delta) => {
    if (!carriage || !stickL || !stickR) return;

    // linear move towards target
    current.current.carriageY = moveTowards(current.current.carriageY, target.current.carriageY, carriageSpeed * delta);
    current.current.rotL = moveTowards(current.current.rotL, target.current.rotL, armSpeed * delta);
    current.current.rotR = moveTowards(current.current.rotR, target.current.rotR, armSpeed * delta);

    carriage.position.y = current.current.carriageY;
    stickL.rotation.y = current.current.rotL;
    stickR.rotation.y = current.current.rotR;
  });


  return null;
}