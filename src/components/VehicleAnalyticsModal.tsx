"use client";

import moment from "moment-timezone";
import { useGlobals } from "./ContextProviders/GlobalsProvider";
import { DialogContent, DialogHeader, DialogTitle } from "./UI/dialog";
import { LineChart, Line, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Vehicle, VehicleMilestone } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "./UI/tooltip";
import { PlusIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "./UI/dropdown-menu";
import { Fragment, useMemo, useState } from "react";
import { UUID } from "crypto";


export default function VehicleAnalyticsModal() {
  const { activeVehicle: vehicle } = useGlobals();

  const milestones = vehicle?.milestones.filter(ms => ms.complete && moment(ms.complete_date, "YYYY-MM-DD", true).isValid())??[];
  const recentMilestone = milestones.length ? milestones.sort((a,b) => moment(b.complete_date).diff(moment(a.complete_date)))[0] : undefined;
  const firstMilestone = milestones.length ? milestones.sort((a,b) => moment(a.complete_date).diff(moment(b.complete_date)))[0] : undefined;

  return (
    <DialogContent dialogContentClassName="w-8/12">
      <DialogHeader>
        <DialogTitle title={`${vehicle?.type} ${vehicle?.serial_number}`} subheading={`Analytics - ${moment().format("YYYY-MM-DD")}`} />
      </DialogHeader>

      <hr className="border-label-secondary/25" />

      <div className="grid grid-cols-6 grid-rows-12 gap-2">
        <div className="bg-bg-secondary/50 border border-label-secondary/25 row-span-12 col-span-2 p-3">FLIGHTS</div>
        <div className="bg-bg-secondary/50 border border-label-secondary/25 row-span-3 col-span-4 uppercase p-3">
          <p className="font-bold">Prod Timeline</p>
          {(!firstMilestone && !recentMilestone) && <p className="mt-1">Awaiting first milestone.</p>}
          {(firstMilestone || recentMilestone) && <div className="grid grid-cols-2 gap-y-1 mt-1 font-medium">
            {firstMilestone && <div>
              <p>First Milestone</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="font-consolas font-bold text-label-secondary/75 -mt-1 w-fit">{firstMilestone.name} ({moment(firstMilestone.complete_date).calendar(null, { sameDay: "[Today]", lastDay: "[Yesterday]", lastWeek: "MMM D", sameElse: "MMM D, YYYY" })})</p>
                </TooltipTrigger>
                <TooltipContent align="end" side="right">{moment(firstMilestone.complete_date).format("YYYY-MM-DD")}</TooltipContent>
              </Tooltip>
            </div>}

            {recentMilestone && <div>
              <p>Recent Milestone</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="font-consolas font-bold text-label-secondary/75 -mt-1 w-fit">{recentMilestone.name} ({moment(recentMilestone.complete_date).calendar(null, { sameDay: "[Today]", lastDay: "[Yesterday]", lastWeek: "MMM D", sameElse: "MMM D, YYYY" })})</p>
                </TooltipTrigger>
                <TooltipContent align="end" side="right">{moment(recentMilestone.complete_date).format("YYYY-MM-DD")}</TooltipContent>
              </Tooltip>
            </div>}
          </div>}
        </div>
        <div className="bg-bg-secondary/50 border border-label-secondary/25 row-span-9 col-span-4">
          {vehicle && <ProdTimelineChart vehicle={vehicle} />}
        </div>
      </div>


    </DialogContent>
  );
}


const ProdTimelineChart = ({ vehicle }: { vehicle: Vehicle }) => {
  const { poiVehicles } = useGlobals();
  const comparibleVehicles = poiVehicles.filter(v => v.type == vehicle.type && v.id != vehicle.id);

  const [comparedVehicleIds, setComparedVehicleIds] = useState<UUID[]>([]);
  const allVehicles = [vehicle, ...poiVehicles.filter(v => comparedVehicleIds.includes(v.id))];

  const seriesColors = ["#389DE4", "#DA3432", "#FF9900", "#E4CA38", "#45CF5D"];


  const getMilestoneDays = (v: Vehicle) => {
    const milestones = v.milestones
    .filter(ms => ms.complete && moment(ms.complete_date, "YYYY-MM-DD", true).isValid())
    .sort((a,b) => moment(a.complete_date).diff(moment(b.complete_date)));

    if (!milestones.length) return [];

    const baseDate = moment(milestones[0].complete_date);

    return milestones.map(ms => ({
      milestone: ms.name.toUpperCase().replace("LANDING TANK", "LT"),
      day: moment(ms.complete_date).diff(baseDate, "days"),
    }));
  }


  const chartData = useMemo(() => {
    const rows: Record<string, any> = {};

    allVehicles.forEach(v => {
      const seriesKey = `${v.type[0]}${v.serial_number}`;
      const milestones = getMilestoneDays(v);

      milestones.forEach(ms => {
        if (!rows[ms.milestone]) {
          rows[ms.milestone] = { milestone: ms.milestone };
        }
        rows[ms.milestone][seriesKey] = ms.day;
      });
    });

    return Object.values(rows);
  }, [vehicle, comparedVehicleIds, poiVehicles]);


  return (
    <ResponsiveContainer height={300-.2}>
      <div className="w-164 flex justify-between items-center font-bold uppercase mb-2 mt-3 ms-3">
        <p>Milestone Graph ({allVehicles.map((v,i,arr) => <Fragment key={v.id}>
          <span className={v.id==vehicle.id?"":"hover:line-through cursor-pointer"} style={{ color: arr.length>1?seriesColors[i%seriesColors.length]:undefined }} onClick={() => { if (v.id!=vehicle.id) setComparedVehicleIds(prev => prev.filter(pv => pv!=v.id)) }}>{v.type[0]+v.serial_number}</span>
          {i<arr.length-1 && <span>, </span>}
        </Fragment>)})</p>

        {comparibleVehicles.filter(v => !comparedVehicleIds.includes(v.id)).length>0 && <DropdownMenu>
          <DropdownMenuTrigger disabled={allVehicles.length==seriesColors.length} asChild>
            <button className="cursor-pointer flex justify-between items-center bg-bg-secondary/50 backdrop-blur-lg border border-label-primary/30 p-1 w-fit uppercase font-consolas font-bold text-label-secondary/75">
              <PlusIcon className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel>Compare With</DropdownMenuLabel>
            {comparibleVehicles.filter(v => !comparedVehicleIds.includes(v.id)).map(vehicle =>
              <DropdownMenuItem key={vehicle.id} onClick={() => setComparedVehicleIds(prev => prev.includes(vehicle.id)?prev:[...prev,vehicle.id])} className="uppercase">{vehicle.type[0]}{vehicle.serial_number}</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>}

      </div>
      <LineChart data={chartData} margin={{ top: 12, right: 24, bottom: 14+20, left: 12 }}>
        <XAxis interval={0} dataKey="milestone" label={{ value: "Milestone", position: "insideBottom", offset: 32.5-20, fill: "#ccc" }} tick={<RotatedTick rotation={-45} textAnchor="end" />} height={90} />
        <YAxis label={{ value: "Days", angle: -90, position: "insideLeft", offset: 5, fill: "#ccc" }} width={55} tick={<RotatedTick dy={6} />} />
        <ReTooltip content={<CustomTooltip />} />
        {allVehicles.map((v,i) => {
          const key = `${v.type[0]}${v.serial_number}`;
          return (
            <Line
            key={key}
            type="linear"
            dataKey={key}
            stroke={seriesColors[i%seriesColors.length]}
            strokeWidth={v.id === vehicle.id ? 2 : 1.5}
            dot
            animationDuration={500}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>

  );
}


type TickProps = {
  x?: number
  y?: number
  payload?: {
    value: string | number
  }
  rotation?: number
  textAnchor?: "start"|"middle"|"end"
  dy?: 12|6
}
export const RotatedTick = ({ x=0, y=0, payload, rotation, textAnchor, dy }: TickProps) => {
  if (!payload) return null;

  const text = String(payload?.value ?? "");
  const parts = text.split(" "); // split on spaces

  return (
    <g transform={`translate(${x},${y})`}>
      {parts.map((line, i) =>
        <text
          key={i}
          dy={(dy??12)*(i+1)+(i>0?2:0)}
          textAnchor={textAnchor}
          transform={`rotate(${rotation})`}
          className="fill-label-secondary text-xs"
        >
          {line}
        </text>
      )}
    </g>
  );
}


type TooltipProps = {
  active?: boolean
  payload?: any[]
  label?: any
}
const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-bg-secondary/50 backdrop-blur-lg border border-label-primary/30 w-fit p-2 shadow-lg">
      <p className="font-medium text-label-primary">{label.replace(" LT"," LANDING TANK")}</p>

      {payload.map((entry, i) =>
        <p key={i} className="uppercase font-consolas font-bold text-label-secondary/75">{entry.name}: <span>{entry.value}</span></p>
      )}
    </div>
  );
}