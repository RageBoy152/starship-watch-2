"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { POI, Transport, Vehicle } from "@/lib/types";
import { defaultPOI } from "@/app/page";
import SBProductionSite from "./models/SBProductionSite";
import Ship from "./models/Ship";
import SBLaunchSite from "./models/SBLaunchSite";
import { useGlobals } from "./ContextProviders/GlobalsProvider";
import Booster from "./models/Booster";



export default function ThreeScene() {
  const { setActiveVehicle, poiVehicles, poi } = useGlobals();
  const clickPos = useRef<{ x: number; y: number } | null>(null);


  const lightRef = useRef<THREE.DirectionalLight|null>(null);

  useEffect(() => {
    const light = lightRef.current;
    if (!light) return;

    // Shadow map
    light.shadow.mapSize.set(4096 * 3, 4096 * 3);
    light.shadow.bias = -0.0003;

    // Shadow camera bounds
    const BOUNDS = 300;
    const cam = light.shadow.camera as THREE.OrthographicCamera;
    cam.left = -BOUNDS;
    cam.right = BOUNDS;
    cam.top = BOUNDS;
    cam.bottom = -BOUNDS;
    cam.near = 0.1;
    cam.far = 1000;
    cam.updateProjectionMatrix();
  }, []);


  return (
    <div className="absolute h-screen w-screen z-10">
      <Canvas
        camera={{ position: [0,500,0], fov: 45, near: 1, far: 1000 }} shadows={true} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        onPointerDown={(e) => clickPos.current = { x: e.clientX, y: e.clientY }}
        onPointerUp={(e) => {
          if (!clickPos.current) return;

          const dx = e.clientX - clickPos.current.x;
          const dy = e.clientY - clickPos.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (!distance) setActiveVehicle(null);
          clickPos.current = null;
        }}
      >
        <OrbitControls
          enablePan={true} enableZoom={true} enableRotate={true}
          enableDamping={true} dampingFactor={0.1}
          mouseButtons={{ LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }}
          target={[0,0,0]}
        />
        <directionalLight position={[0,50,50]} intensity={1.5} castShadow={true} shadow-mapSize={[2048, 2048]} />
        <Environment
          background={true}
          backgroundIntensity={1}
          environmentIntensity={0.1} // optional intensity factor (default: 1, only works with three 0.163 and up)
          files="/hdr/kloppenheim_03_puresky_1k.hdr"
        />

        <Suspense fallback={null}>
          {poi?.id == "96dde332-05ea-49ca-8470-aab5eadd7685" && <SBProductionSite />}
          {poi?.id == "cf98ff6e-c336-4b46-b510-32f436649730" && <SBLaunchSite />}

          {poiVehicles.map(vehicle => {
            if (vehicle.type=="ship") return <Ship key={vehicle.id} vehicle={vehicle} />
            else if (vehicle.type=="booster") return <Booster key={vehicle.id} vehicle={vehicle} />
          })}
        </Suspense>
      </Canvas>
    </div>
  );
}
