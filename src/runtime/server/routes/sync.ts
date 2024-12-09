import type { SupabaseClient, User } from "@supabase/supabase-js";
// import { createEventStream } from "h3";
import type { Database } from "../../types/supabase";
import { analyses } from "../db/schema/galaxy/analyses";
import { useDrizzle } from "../utils/drizzle";
import { eq } from 'drizzle-orm';

function setIntervalWithPromise(target: any) {
  return async function (...args: any[]) {
    if (target.isRunning) return
    // if we are here, we can invoke our callback!
    target.isRunning = true
    await target(...args)
    target.isRunning = false
  }
}



export default defineEventHandler(async (event) => {
  const { user, client }: { user: User, client: SupabaseClient<Database> } = event.context?.supabase;
  let syncIntervalId: any | number | undefined = undefined
  // const body = await readBody(event)
  if (!syncIntervalId) {
    syncIntervalId = setInterval(setIntervalWithPromise(async () => {
      await synchronizeAnalyses(client, user.id)
      const userAnalysesDb = await useDrizzle()
        .select()
        .from(analyses)
        .where(eq(analyses.ownerId, user.id))
      if (userAnalysesDb.every((d) => d.isSync)) {
        stopSync()
      }
    }), 6000)
  }

  function stopSync() {
    clearInterval(syncIntervalId)
  }

})

