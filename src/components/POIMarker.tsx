"use client";

import { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { GroupedLocation, POI } from '@/lib/types';
import { FlagTriangleRight } from 'lucide-react';
import { redirect } from 'next/navigation';

export default function POIMarker({ groupedLocation }: { groupedLocation: GroupedLocation }) {
  return (
    <Marker
      longitude={groupedLocation.longitude}
      latitude={groupedLocation.latitude}
      anchor="top-left"
    >
      <div className="relative">
        <div className="absolute -start-1 -top-2">
          <FlagTriangleRight className="text-label-secondary" />
        </div>

        <section className="ms-6 -mt-4 font-chakra bg-bg-secondary/50 backdrop-blur-lg border border-label-primary/30 p-4 py-8 md:py-4 flex flex-col gap-3 relative z-10 shadow-[inset_3px_3px_16px_rgba(0,0,0,0.2)]">
          <div className="uppercase font-bold text-base">
            <div className="flex items-center gap-1">
              <h2 className="text-2xl">{groupedLocation.location}</h2>
              <p className="font-consolas ms-12 text-sm text-success-green">Online</p>
            </div>
            <h3 className="font-consolas text-label-secondary/75 text-sm">Texas, USA</h3>
          </div>

          <hr className="border-label-secondary/25" />

          <div className="flex flex-col gap-1 uppercase text-sm">
            {groupedLocation.sites.map((site) => 
              <p key={site.id} className="hover:text-accent cursor-pointer" onClick={() => { redirect(`/site/${site.id}`); }}>{site.name}</p>
            )}
          </div>
        </section>
      </div>
    </Marker>
  )
}