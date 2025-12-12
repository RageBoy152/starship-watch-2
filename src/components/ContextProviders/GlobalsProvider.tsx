"use client";

import { POI, Transport, Vehicle } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { UUID } from "crypto";
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";


type GlobalsContextType = {
  activeVehicle: Vehicle|null
  setActiveVehicle: Dispatch<SetStateAction<Vehicle|null>>
  poiVehicles: Vehicle[]
  transports: Transport[]
  routes: Record<string, THREE.CatmullRomCurve3>
  poi?: POI
}

const GlobalsContext = createContext<GlobalsContextType|null>(null);

export const useGlobals = () => {
  const ctx = useContext(GlobalsContext);
  if (!ctx) throw new Error("useGlobals has no parent context");
  return ctx;
};

export const GlobalsProvider = ({ children, poi }: { children: React.ReactNode, poi?: POI }) => {
  const supabase = createClient();

  const [activeVehicle, setActiveVehicle] = useState<Vehicle|null>(null);
  const activeVehicleRef = useRef<Vehicle|null>(null);
  const [poiVehicles, setPOIVehicles] = useState<Vehicle[]>([]);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [routes, setRoutes] = useState<Record<string, THREE.CatmullRomCurve3>>({});

  useEffect(() => { activeVehicleRef.current = activeVehicle; }, [activeVehicle]);

  useEffect(() => {
    let ignore = false;

    const getData = async () => {
      // get poi vehicles from db
      if (poi) {
        const { data: poiVehicles, error: poiVehiclesError } = await supabase.from("vehicles").select().eq("poi", poi.id);
        if (poiVehiclesError || !poiVehicles) {
          console.error(poiVehiclesError);
          return "Error fetching poi vehicles";
        }
        else setPOIVehicles(poiVehicles as Vehicle[]);
      }


      // get transports from db
      if (poi) {
        const { data: transports, error: transportsErr } = await supabase.from("transports").select().eq("poi", poi.id)
        if (transportsErr || !transports) {
          console.error(transportsErr);
          return "Error fetching transports";
        }
        else if (!ignore) setTransports(transports as Transport[]);
      }


      // get routes from /models/poi.fileName/routes.gltf
      const loader = new GLTFLoader();
      loader.load(`/models/${poi?.fileName}/routes.gltf`, gltf => {
        const foundRoutes: Record<string, THREE.CatmullRomCurve3> = {};

        gltf.scene.traverse(_obj => {
          const obj = _obj as THREE.Mesh;
          if (obj.name.startsWith("ROUTE_")) {
            const geometry = obj.geometry;

            const pos = geometry.attributes.position.array;
            const pts = [];

            const worldMatrix = obj.matrixWorld;
            for (let i=0; i<pos.length; i+=3) {
              const p = new THREE.Vector3(pos[i], pos[i+1], pos[i+2]);
              p.applyMatrix4(worldMatrix);
              pts.push(p);
            }

            const rotation = new THREE.Euler(0, Math.PI, 0); // 180° around Y
            for (let i = 0; i < pts.length; i++) {
              pts[i].applyEuler(rotation);
            }

            foundRoutes[obj.name] = new THREE.CatmullRomCurve3(pts, false);
          }
        });

        if (!ignore) setRoutes(foundRoutes);
      });
    }
    getData();


    // subscribe to vehicle changes
    const vehicleChange = supabase.channel("vehicles-changes").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "vehicles"
    }, (payload) => {
      setPOIVehicles(prev => {
        if (payload.eventType == "INSERT") return [...prev, payload.new as Vehicle];
        else if (payload.eventType == "UPDATE") {
          if (activeVehicleRef.current?.id == payload.new.id) setActiveVehicle(payload.new as Vehicle);
          return prev.map(vehicle => vehicle.id == payload.new.id ? (payload.new as Vehicle) : vehicle);
        }
        else if (payload.eventType == "DELETE") {
          if (activeVehicleRef.current?.id == payload.old.id) setActiveVehicle(null);
          return prev.filter(vehicle => vehicle.id != payload.old.id);
        }
        else return prev;
      });
    }).subscribe();


    // subscribe to vehicle changes
    const transportChange = supabase.channel("transport-changes").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "transports"
    }, (payload) => {
      setTransports(prev => {
        if (payload.eventType == "INSERT") return [...prev, payload.new as Transport];
        else if (payload.eventType == "UPDATE") return prev.map(transport => transport.id == payload.new.id ? (payload.new as Transport) : transport);
        else if (payload.eventType == "DELETE") return prev.filter(transport => transport.id != payload.old.id);
        else return prev;
      });
    }).subscribe();


    return () => {
      ignore = true;
      supabase.removeChannel(vehicleChange);
      supabase.removeChannel(transportChange);
    }
  }, []);

  return (
    <GlobalsContext.Provider value={{ activeVehicle, setActiveVehicle, transports, routes, poiVehicles, poi }}>
      {children}
    </GlobalsContext.Provider>
  );
}