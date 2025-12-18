"use client";

import { moveTowards } from "@/lib/utils";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";


type DoorProps ={
  root: THREE.Object3D
  config: Record<string, any>
  prefix: string
  minScale: number
}

export default function Door({ root, config, prefix, minScale }: DoorProps) {
  // control object
  const door = root.getObjectByName(`${prefix}_DOOR`);
  
  // current & target states
  const current = useRef(0);
  const target = useRef(0);

  // instant snap to target on first load - prevents unintended animation on page load
  const firstLoad = useRef(true);
  
  // speed
  const doorSpeed = 0.2;


  useEffect(() => {
    if (!door) return;

    const setting = config[`${prefix.toLowerCase()}_door_open`];
    if (setting == null) return;

    target.current = setting;

    // snap to target on first load
    if (firstLoad.current) {
      current.current = target.current ;
      firstLoad.current = false;
    }
  }, [config, prefix]);


  useFrame((_, delta) => {
      if (!door) return;
  
      // linear move towards target
      current.current = moveTowards(current.current, target.current, doorSpeed * delta);
      door.scale.y = Math.max(current.current, minScale);
    });


  return null;
}