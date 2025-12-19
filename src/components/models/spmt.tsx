"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { degToRad } from "three/src/math/MathUtils.js";


type SPMTProps = {
  yOffset: number
  zOffset: number
}

export default function SPMT({ yOffset, zOffset }: SPMTProps) {
  const { scene: gltfScene } = useGLTF(`/models/spmt/spmt.gltf`);
  const scene = useMemo(() => SkeletonUtils.clone(gltfScene), [gltfScene]);
  

  const makeModule = (name: string) => {
    const obj = scene.getObjectByName(name);
    return obj ? SkeletonUtils.clone(obj) : null;
  };


  const ax6a = useMemo(() => makeModule("6ax"), [scene]);
  const ax6b = useMemo(() => makeModule("6ax"), [scene]);
  const ax4  = useMemo(() => makeModule("4ax"), [scene]);
  const ppu  = useMemo(() => makeModule("ppu"), [scene]);


  if (!ax4 || !ax6a || !ax6b || !ppu) return;
  return (
    <group rotation={[0,degToRad(-90),0]} position={[0,-yOffset+(-0.388611 + 2.30841),-12]} scale={0.8}>
      <group position={[0,0,zOffset]}><primitive object={ppu} /></group>
      <group position={[0,0,zOffset]}><primitive object={ax6a} /></group>
      <group position={[11.3555,0,zOffset]}><primitive object={ax6b} /></group>
      <group position={[11.3555*2,0,zOffset]}><primitive object={ax4} /></group>
    </group>
  );
}