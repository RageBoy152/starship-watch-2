"use client";

import { chopstickPresets } from "@/lib/tempData";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { degToRad } from "three/src/math/MathUtils.js";

export default function SBLaunchSite(props: any) {
  const { scene } = useGLTF("/models/SBLaunchSite/SBLaunchSite.gltf");
  const config: Record<string, any> = props.config;


  scene.traverse(_child => {
    const child = (_child as THREE.Mesh);

    if (child.isMesh) {

      child.castShadow = true;
      child.receiveShadow = true;

      // glass mat fix
      const mat = child.material as THREE.Material;
      if (mat.name == "Glass") {
        mat.transparent = true;
        mat.depthWrite = false;
        child.castShadow = false;
        child.receiveShadow = false;
      }
    }
  });


  const carriage = scene.getObjectByName("CARRIAGE");
  const stickL = scene.getObjectByName("STICK_L");
  const stickR = scene.getObjectByName("STICK_R");

  if (carriage && stickL && stickR) {
    // launch pos
    const preset = config["chopstick_preset"];
    const value = chopstickPresets[preset];
    if (value != undefined) {
      carriage.position.y = value.c;
      stickL.rotation.y = degToRad(-10.5+value.l);
      stickR.rotation.y = degToRad(10.5+value.r);
    }
  }

  return <primitive {...props} object={scene} />;
}