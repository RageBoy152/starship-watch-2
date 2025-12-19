"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, Environment, OrbitControls, CameraControlsImpl } from "@react-three/drei";
import * as THREE from "three";
import SBProductionSite from "./models/SBProductionSite";
import Ship from "./models/Ship";
import SBLaunchSite from "./models/SBLaunchSite";
import { useGlobals } from "./ContextProviders/GlobalsProvider";
import Booster from "./models/Booster";
const { ACTION } = CameraControlsImpl;



export default function ThreeScene() {
  const { setActiveVehicle, poiVehicles, poi, camControlsEnabled, camControlsRef } = useGlobals();
  const clickPos = useRef<{ x: number; y: number } | null>(null);


  return (
    <div className="absolute h-screen w-screen z-10">
      <Canvas
        camera={{ position: [0,500,0], fov: 45, near: 1, far: 3000 }} shadows={true} gl={{ shadowMapType: THREE.BasicShadowMap, antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
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
        <CameraControls
          ref={camControlsRef}
          enabled={camControlsEnabled}
          smoothTime={0.1}
          mouseButtons={{
            left: ACTION.TRUCK,
            middle: ACTION.DOLLY,
            right: ACTION.ROTATE,
            wheel: ACTION.DOLLY
          }}
        />
        <directionalLight
          position={[-350,200,-60]}
          intensity={1.5}
          castShadow={true}
          onUpdate={light => {
            light.shadow.mapSize.set(4096*2, 4096*2);
            light.shadow.bias = -0.001;

            const cam = light.shadow.camera as THREE.OrthographicCamera;
            const BOUNDS = 1000;
            cam.left = -BOUNDS;
            cam.right = BOUNDS;
            cam.top = BOUNDS;
            cam.bottom = -BOUNDS;
            cam.near = 1;
            cam.far = 1000;
            cam.updateProjectionMatrix();
          }}
        />
        <Environment
          background={true}
          backgroundIntensity={1}
          environmentIntensity={0.1} // optional intensity factor (default: 1, only works with three 0.163 and up)
          files="/hdr/kloppenheim_03_puresky_1k.hdr"
        />

        <Suspense fallback={null}>
          {poi?.id == "0403e1dc-fe0e-401d-835e-092bbfde8772" && <SBProductionSite config={poi.config} last_updated={poi.last_updated} />}
          {poi?.id == "da41c0c8-7a89-4962-b190-ab0d8a634659" && <SBLaunchSite config={poi.config} last_updated={poi.last_updated} />}

          {poiVehicles.map(vehicle => {
            if (vehicle.type=="ship") return <Ship key={vehicle.id} vehicle={vehicle} />
            else if (vehicle.type=="booster") return <Booster key={vehicle.id} vehicle={vehicle} />
          })}
        </Suspense>
      </Canvas>
    </div>
  );
}
