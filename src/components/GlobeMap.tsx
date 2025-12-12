"use client";

import Map, { AttributionControl, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import POIMarker from './POIMarker';
import { POI } from '@/lib/types';
import { useRef } from 'react';
import { groupPOIsByLocation } from '@/lib/utils';


export default function GlobeMap({ pois }: { pois: POI[] }) {
  const mapRef = useRef<MapRef|null>(null);

  const controls_dev = false;
  return (
    <>
      <Map
        initialViewState={{
          longitude: -85,
          latitude: 24.5,
          zoom: 5
        }}
        scrollZoom={controls_dev}
        doubleClickZoom={false}
        dragPan={controls_dev}
        dragRotate={false}
        touchPitch={false}
        style={{
          position: "absolute",
          left: "0", top: "0",
          width: "100vw",
          height: "100vh",
          zIndex: 50,
        }}
        mapboxAccessToken='pk.eyJ1IjoicmFnZTg2MDEiLCJhIjoiY21mNnU4YTBmMDcxdTJtczZmM3BqcGZ2YSJ9.A7F0BzcR_L2hhoA4wxk2rA'
        mapStyle="mapbox://styles/rage8601/cmhlh4ay3001t01pjgayg65z2"
        attributionControl={false}
        ref={mapRef}
        reuseMaps={true}
      >
        <AttributionControl compact={true}/>

        {groupPOIsByLocation(pois).map((groupedLocation, i) =>
          <POIMarker key={i} groupedLocation={groupedLocation} />
        )}
      </Map>
    
    </>
  )
}