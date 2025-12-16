"use client";

import { ChopstickHeights } from "@/lib/tempData";
import { moveTowards } from "@/lib/utils";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import moment from "moment-timezone";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { useGlobals } from "../ContextProviders/GlobalsProvider";

export default function SBLaunchSite(props: any) {
  const { scene } = useGLTF("/models/SBLaunchSite/SBLaunchSite.gltf");
  const config: Record<string, any> = props.config;
  const { setChopstickVehicleMarker } = useGlobals();


  useEffect(() => {
    const marker = scene.getObjectByName("PAD2_CHOPSTICK_VEHICLE_MARKER");
    if (marker) setChopstickVehicleMarker(marker);
  }, [scene]);


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


  const carriage = scene.getObjectByName("PAD2_CARRIAGE");
  const stickL = scene.getObjectByName("PAD2_STICK_L");
  const stickR = scene.getObjectByName("PAD2_STICK_R");

  const current = useRef({
    carriageY: 0,
    rotL: 0,
    rotR: 0,
  });
  const target = useRef({
    carriageY: 0,
    rotL: 0,
    rotR: 0,
  });


  const carriageSpeed = 7;
  const armSpeed = 1;

  const animateCarriage = true;
  const animateArms = true;

  const firstLoad = useRef(true);


  useEffect(() => {
    if (!carriage || !stickL || !stickR) return;

    const preset = config["pad2_chopstick_height"];
    const rotation = config["pad2_chopstick_rotation"];
    const open = config["pad2_chopstick_open"];

    const value = ChopstickHeights[preset];
    if (value == null || rotation == null || open == null) return;

    const MIN = -64.8;
    const MAX = 64.8;

    const baseL = -10.5 + 40 * open;
    const baseR =  10.5 + 40 * open;

    const rotMin = Math.max(MIN - baseL, baseR - MAX);
    const rotMax = Math.min(MAX - baseL, baseR - MIN);

    const compensatedRotation = Math.min(rotMax, Math.max(rotMin, rotation));

    target.current.carriageY = value;
    target.current.rotL = degToRad(baseL + compensatedRotation);
    target.current.rotR = degToRad(baseR - compensatedRotation);

    if (firstLoad.current) {
      current.current.carriageY = target.current.carriageY;
      current.current.rotL = target.current.rotL;
      current.current.rotR = target.current.rotR;
      firstLoad.current = false;
    }
  }, [config, props.last_updated]);


  useFrame((_,delta) => {
    if (!carriage || !stickL || !stickR) return;
    
    if (animateCarriage) {
      current.current.carriageY = moveTowards(
        current.current.carriageY,
        target.current.carriageY,
        carriageSpeed * delta
      );
    }
    else current.current.carriageY = target.current.carriageY;

    if (animateArms) {
      current.current.rotL = moveTowards(
        current.current.rotL,
        target.current.rotL,
        armSpeed * delta
      );
      current.current.rotR = moveTowards(
        current.current.rotR,
        target.current.rotR,
        armSpeed * delta
      );
    } else {
      current.current.rotL = target.current.rotL;
      current.current.rotR = target.current.rotR;
    }

    carriage.position.y = current.current.carriageY;
    stickL.rotation.y = current.current.rotL;
    stickR.rotation.y = current.current.rotR;
  });

  return <primitive {...props} object={scene} />;
}