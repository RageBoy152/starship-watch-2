"use client";

import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useGlobals } from "../ContextProviders/GlobalsProvider";
import Chopstick from "./Chopstick";

export default function SBLaunchSite(props: any) {
  const { scene } = useGLTF("/models/SBLaunchSite/SBLaunchSite.gltf");
  const { setChopstickVehicleMarkers } = useGlobals();


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


  return <>
    <primitive {...props} object={scene} />

    <Chopstick root={scene} prefix="PAD2" config={props.config} chopstickHeights={[24, 28.1, 52.16, 62.3+2.3, 107.39+2.3, 128]} zeroRotationOffset={10.5} maxAngle={75.3} onVehicleMarker={(marker) => setChopstickVehicleMarkers(prev => ({ ...prev, "PAD2": marker }))} />
    <Chopstick root={scene} prefix="PAD1" config={props.config} chopstickHeights={[24.6773, 28.1, 54, 63.5, 107.39, 128]} zeroRotationOffset={2.62} maxAngle={52.4} onVehicleMarker={(marker) => setChopstickVehicleMarkers(prev => ({ ...prev, "PAD1": marker }))} />
  </>
}