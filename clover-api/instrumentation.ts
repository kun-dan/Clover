export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Must run before any outbound fetch: AniList, the providers, and the job below.
    const { configureFetchProxy } = await import("./lib/proxy");
    await configureFetchProxy();

    const cron = await import("node-cron");
    const { runChapterUpdateJob } = await import("./jobs/chapterUpdateJob");

    // Run once 2 minutes after startup
    setTimeout(() => runChapterUpdateJob().catch(console.error), 2 * 60 * 1000);

    // Then every hour
    cron.schedule("0 * * * *", () => {
      runChapterUpdateJob().catch(console.error);
    });

    console.log("[Instrumentation] Chapter update job scheduled (hourly)");
  }
}
