"use client";

import Section from "./UI/section";
import { Tooltip, TooltipContent, TooltipTrigger } from "./UI/tooltip";
import { Button } from "./UI/Button";
import Link from "next/link";
import { CameraIcon, CloudIcon, ExternalLinkIcon, GlobeIcon } from "lucide-react";
import { useGlobals } from "./ContextProviders/GlobalsProvider";

export default function SitePageHeading() {
  const { poi } = useGlobals();

  return (
    <Section>
      <div className="flex items-center gap-2">
        <img src="/starship-icon.png" alt="Starship Icon" className="w-[40px] h-[40px]" />
        <div className="uppercase font-bold">
          <h2 className="text-2xl">Starship Watch</h2>
          <h3 className="font-consolas text-label-secondary">{poi?.name}, {poi?.location.split(",")[1]}</h3>
        </div>
      </div>

      <hr className="border-label-secondary/25" />

      <div className="flex gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button className="w-fit p-2">
              <Link href="/">
                <GlobeIcon className="w-4 h-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="flex items-center gap-2">
              <p>Operations Overview</p>
              <ExternalLinkIcon className="w-4 h-4" />
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button className="w-fit p-2">
              <CameraIcon className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Camera Modes</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button className={`${true?"bg-accent/50 hover:bg-accent":""} w-fit p-2`}>
              <CloudIcon className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Enable Sky</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </Section>
  );
}