"use client";

import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { degToRad } from "three/src/math/MathUtils.js";

export default function SBProductionSite(props: any) {
  const { scene } = useGLTF("/models/SBProductionSite/SBProductionSite.gltf");

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

  return <primitive {...props} object={scene} rotation={[0,degToRad(180),0]} />;
}