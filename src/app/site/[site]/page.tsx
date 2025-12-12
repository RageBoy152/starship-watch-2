import { GlobalsProvider } from "@/components/ContextProviders/GlobalsProvider";
import SitePageUI from "@/components/SitePageUI";
import ThreeScene from "@/components/ThreeScene";
import { pois } from "@/lib/tempData";

export default async function Page({ params }: { params: Promise<{ site: string }> }) {
  const { site } = await params;
  
  // get poi - would be db fetch
  const poi = pois.find(poi => poi.id == site);
  if (!poi) return "Invalid location";

  return (
    <>
      <GlobalsProvider poi={poi}>
        <SitePageUI />
        <ThreeScene />
      </GlobalsProvider>
    </>
  );
}