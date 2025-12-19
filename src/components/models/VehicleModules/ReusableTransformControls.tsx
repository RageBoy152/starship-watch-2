"use client";

import { useGlobals } from "@/components/ContextProviders/GlobalsProvider";
import { Vehicle } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { TransformControls } from "@react-three/drei";
import * as THREE from "three";


type ReusableTransformControlsProps = {
  vehicle: Vehicle
  ref: React.RefObject<THREE.Object3D|null>
  yOffset: number
}

export default function ReusableTransformControls({ vehicle, ref, yOffset }: ReusableTransformControlsProps) {
  const { moveGizmo, setCamControlsEnabled } = useGlobals();
  const supabase = createClient();


  const savePos = async () => {
    if (!ref.current) return;

    await supabase.from("vehicles").update({
      position: {
        x: ref.current.position.x,
        y: ref.current.position.y-yOffset,
        z: ref.current.position.z,
      },
      location_preset: null
    }).eq("id", vehicle.id);
  }


  if (moveGizmo != vehicle.id || !ref.current) return null;
  return (
    <TransformControls
      object={ref.current}
      mode="translate"
      space="world"
      size={0.75}
      onMouseDown={()=>{ setCamControlsEnabled(false); }} // start - disable other automations?
      onMouseUp={()=>{ setCamControlsEnabled(true); savePos() }} // commit
    />
  );
}