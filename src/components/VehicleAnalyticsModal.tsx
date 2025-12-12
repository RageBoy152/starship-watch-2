"use client";

import moment from "moment-timezone";
import { useGlobals } from "./ContextProviders/GlobalsProvider";
import { DialogContent, DialogHeader, DialogTitle } from "./UI/dialog";
import { LineChart, Line, XAxis, YAxis, Tooltip as ReTooltip, Legend, ResponsiveContainer } from 'recharts';
import { VehicleMilestone } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "./UI/tooltip";


export default function VehicleAnalyticsModal() {
  const { activeVehicle: vehicle } = useGlobals();

  const milestones = vehicle?.milestones.filter(ms => ms.complete && moment(ms.complete_date, "YYYY-MM-DD", true).isValid())??[];
  const recentMilestone = milestones.length ? milestones.sort((a,b) => moment(b.complete_date).diff(moment(a.complete_date)))[0] : undefined;
  const firstMilestone = milestones.length ? milestones.sort((a,b) => moment(a.complete_date).diff(moment(b.complete_date)))[0] : undefined;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle title={`${vehicle?.type} ${vehicle?.serial_number}`} subheading={`Analytics - ${moment().format("YYYY-MM-DD")}`} />
      </DialogHeader>

      <hr className="border-label-secondary/25" />

      <div className="grid grid-cols-2 grid-rows-12 gap-2">
        <div className="bg-bg-secondary/50 border border-label-secondary/25 row-span-12 p-3">FLIGHTS</div>
        <div className="bg-bg-secondary/50 border border-label-secondary/25 row-span-3 uppercase p-3">
          <p className="font-bold">Prod Timeline</p>
          {(!firstMilestone && !recentMilestone) && <p className="mt-1">Awaiting first milestone.</p>}
          {(firstMilestone || recentMilestone) && <div className="grid grid-cols-2 gap-y-1 mt-1 font-medium">
            {firstMilestone && <div>
              <p>First Milestone</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="font-consolas font-bold text-label-secondary/75 -mt-1 w-fit">{firstMilestone.name} ({moment(firstMilestone.complete_date).fromNow()})</p>
                </TooltipTrigger>
                <TooltipContent align="end" side="right">{moment(firstMilestone.complete_date).format("YYYY-MM-DD")}</TooltipContent>
              </Tooltip>
            </div>}
            
            {recentMilestone && <div>
              <p>Recent Milestone</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="font-consolas font-bold text-label-secondary/75 -mt-1 w-fit">{recentMilestone.name} ({moment(recentMilestone.complete_date).fromNow()})</p>
                </TooltipTrigger>
                <TooltipContent align="end" side="right">{moment(recentMilestone.complete_date).format("YYYY-MM-DD")}</TooltipContent>
              </Tooltip>
            </div>}
          </div>}
        </div>
        <div className="bg-bg-secondary/50 border border-label-secondary/25 row-span-9">
          <ProdTimelineChart milestones={vehicle?.milestones??[]} />
        </div>
      </div>


    </DialogContent>
  );
}


const ProdTimelineChart = ({ milestones }: { milestones: VehicleMilestone[] }) => {
  const data = milestones
  .filter(ms => ms.complete && moment(ms.complete_date, "YYYY-MM-DD", true).isValid())
  .sort((a,b) => moment(a.complete_date).diff(moment(b.complete_date)))
  .map(ms => {
    const baseDate = moment(milestones[0].complete_date);

    return {
      milestone: ms.name.toUpperCase(),
      day: moment(ms.complete_date).diff(baseDate, "days")
    };
  })

  return (
    <ResponsiveContainer height={300-.2}>
      <p className="w-sm font-bold uppercase mb-2 mt-3 ms-3">Milestone Graph</p>
      <LineChart data={data} margin={{ top: 12, right: 24, bottom: 14, left: 12 }}>
        <XAxis interval={0} dataKey="milestone" label={{ value: "Milestone", position: "insideBottom", offset: 32.5, fill: "#ccc" }} tick={<RotatedTick rotation={-45} textAnchor="end" />} height={90} />
        <YAxis label={{ value: "Days", angle: -90, position: "insideLeft", offset: 5, fill: "#ccc" }} width={55} tick={<RotatedTick dy={6} />} />
        <ReTooltip content={<CustomTooltip />} />
        {/* <Legend /> */}
        <Line type="linear" dataKey="day" stroke="#389DE4" strokeWidth={2} animationDuration={500} />
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
      <p className="font-medium text-label-primary">{label}</p>

      {payload.map((entry, i) =>
        <p key={i} className="uppercase font-consolas font-bold text-label-secondary/75">{entry.name}: <span>{entry.value}</span></p>
      )}
    </div>
  );
}