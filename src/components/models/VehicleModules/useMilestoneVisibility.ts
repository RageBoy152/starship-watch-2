"use client";

import { Vehicle } from "@/lib/types";
import { useEffect } from "react";
import * as THREE from "three";





export const getRingCount = (name: string) => {
  const match = name.match(/:(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

export const RING_HEIGHT = 1.8288;


type useMilestoneVisibilityProps = {
  root: THREE.Object3D
  vehicle: Vehicle
  barrelOrder: string[]
}

export function useMilestoneVisibility({ root, vehicle, barrelOrder }: useMilestoneVisibilityProps) {
  vehicle.milestones.forEach(ms => {
    const objParent = root.getObjectByName(ms.name.replace(":","_").replace(/\s+/g, "_"));
    objParent?.traverse(_child => {
      const child = _child as THREE.Mesh;
      child.visible = ms.complete;
    });
  });


  useEffect(() => {
    if (!root) return;
    
    let missingBelow = 0;
    let largestOffset = 0;
    const barrelOffsets: Record<string,number> = {};
    
    barrelOrder.forEach(name => {
      const barrelHeight = getRingCount(name)*RING_HEIGHT;
      const isComplete = vehicle.milestones.find(ms => ms.name == name)?.complete;

      barrelOffsets[name] = missingBelow;
      if (!isComplete) {
        missingBelow += barrelHeight;
        largestOffset = missingBelow;
      }
    });


    vehicle.milestones.forEach(ms => {
      const obj = root.getObjectByName(ms.name.replace(":","_").replace(/\s+/g, "_"));
      if (!obj) return;
      const y = barrelOffsets[ms.name];

      if (y!=undefined) obj.position.y = -y;
      else if (vehicle.type == "ship") obj.position.y = -largestOffset; // revisit this when we have more booster milestones (grid fins)
    })
  }, [root, vehicle.milestones]);
}