"use client";

import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function SBLaunchSite(props: any) {
  const { scene } = useGLTF("/models/SBLaunchSite/SBLaunchSite.gltf");

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

  return <primitive {...props} object={scene} />;
}