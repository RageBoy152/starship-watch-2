import { GlobalsProvider } from "@/components/ContextProviders/GlobalsProvider";
import SitePageUI from "@/components/SitePageUI";
import ThreeScene from "@/components/ThreeScene";
import { POI } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";

export default async function Page({ params }: { params: Promise<{ site: string }> }) {
  const { site } = await params;

  const suapabse = await createClient();
  const { data: poiData, error: poiError } = await suapabse.from("pois").select().eq("id", site).single();
  if (poiError || !poiData) { console.error(poiError); }

  const poi: POI|undefined = poiData ? (poiData as POI) : undefined;
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