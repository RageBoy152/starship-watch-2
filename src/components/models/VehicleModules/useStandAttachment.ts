"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";


type UseStandAttachmentResult = {
  standScene: THREE.Object3D | null
  yOffset: number
}

export function useStandAttachment(stand?: string): UseStandAttachmentResult {
  const { scene } = useGLTF(stand?`/models/stands/${stand}.gltf`:"/models/empty.gltf");

  const yOffset = useMemo(() => {
    if (!stand) return 0;

    const marker = scene.getObjectByName("AFT_MARKER");
    return marker ? Math.abs(marker.position.y) : 0;
  }, [scene, stand]);

  return {
    standScene: stand ? scene : null,
    yOffset
  }
}