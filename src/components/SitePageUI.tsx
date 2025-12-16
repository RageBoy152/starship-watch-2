import POIInspector from "./POIInspector";
import SitePageHeading from "./SitePageHeading";
import SitePageVehiclesList from "./SitePageVehiclesList";
import VehicleInspector from "./VehicleInspector";


export default function SitePageUI() {
  return (
    <div className="absolute z-20 pointer-events-none p-4 flex w-full justify-between">
      <div className="flex flex-col gap-2">
        <SitePageHeading />
        <SitePageVehiclesList />
      </div>
      <div>
        <POIInspector />
        <VehicleInspector />
      </div>
    </div>
  );
}