"use client";

import { locationPresets } from "@/lib/tempData";
import { Vehicle } from "@/lib/types";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { getRingCount, RING_HEIGHT } from "./useMilestoneVisibility";


type useBoosterCH4StackProps = {
  root: THREE.Object3D
  vehicle: Vehicle
  barrelOrder: string[]
}

export function useBoosterCH4Stack({ root, vehicle, barrelOrder }: useBoosterCH4StackProps) {
  const ch4GroupRef = useRef<THREE.Group | null>(null);
  useEffect(() => {
    if (!root) return;

    const fx3 = root.getObjectByName("fx_3");
    const f24 = root.getObjectByName("f2_4");
    const f34 = root.getObjectByName("f3_4");

    if (!fx3 || !f24 || !f34) return;

    const parent = fx3.parent;
    if (!parent) return;

    const ch4Group = new THREE.Group();
    ch4Group.name = "CH4_STACK";

    parent.add(ch4Group);

    parent.updateMatrixWorld(true);

    ch4Group.attach(fx3);
    ch4Group.attach(f24);
    ch4Group.attach(f34);

    ch4GroupRef.current = ch4Group;
  }, [root]);


  const setGroupWorldPosition = (
    group: THREE.Object3D,
    worldPos: THREE.Vector3
  ) => {
    if (!group.parent) return;

    const localPos = worldPos.clone();
    group.parent.worldToLocal(localPos);
    group.position.copy(localPos);
  };

  const fullyStacked = vehicle.milestones.find(ms => ms.name.toLowerCase()=="final stack")?.complete;
  useEffect(() => {
    const group = ch4GroupRef.current;
    if (!group || !group.parent) return;

    if (!fullyStacked) {
      const ch4TankLocation = locationPresets["0403e1dc-fe0e-401d-835e-092bbfde8772"]["megabay 1"]["bay 6"];
      let heightOffset = 0;
      barrelOrder.forEach(name => {
        if (name.startsWith("f")) return;
        const height = getRingCount(name)*RING_HEIGHT;
        const isComplete = vehicle.milestones.find(ms => ms.name == name)?.complete;
        if (isComplete) heightOffset += height;
      });

      const worldTarget = new THREE.Vector3(ch4TankLocation.x, ch4TankLocation.y-heightOffset, ch4TankLocation.z);
      setGroupWorldPosition(group, worldTarget);
    } else {
      const worldTarget = new THREE.Vector3(vehicle.position.x, vehicle.position.y, vehicle.position.z);
      setGroupWorldPosition(group, worldTarget);
    }
  }, [fullyStacked, vehicle.position]);
}