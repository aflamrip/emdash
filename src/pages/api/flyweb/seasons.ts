import type { APIRoute } from "astro";
import { getEmDashCollection, getEmDashEntry } from "emdash";

export const GET: APIRoute = async ({ site, url }) => {
	const siteUrl = site ?? new URL(url.origin);
	const baseUrl = siteUrl.href.replace(/\/$/, "");

	const seriesFilter = url.searchParams.get("series");
	const limitParam = url.searchParams.get("limit");
	const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10), 1), 100) : 50;

	const { entries: allSeries = [] } = await getEmDashCollection("tv", { limit: 50 }).catch(() => ({ entries: [] }));

	const targetSeries = seriesFilter
		? allSeries.filter((s: any) => s.id === seriesFilter)
		: allSeries;

	const seasonLines: string[] = [];

	for (const series of targetSeries) {
		const tvDetails = await getEmDashEntry("tv", series.id, {
			references: { seasons: { limit: 50 } },
		}).catch(() => null);

		const seasons: any[] = tvDetails?.entry?.references?.seasons?.entries ?? [];

		for (const season of seasons) {
			const s = season.data;
			const seasonNum = s.season_number ?? 1;

			// Fetch episode count
			const fullSeason = await getEmDashEntry("seasons", season.id, {
				references: { episodes: { limit: 100 } },
			}).catch(() => null);

			const episodes = fullSeason?.entry?.references?.episodes?.entries ?? [];

			seasonLines.push(
				JSON.stringify({
					id: s.id ?? season.id,
					title: s.title ?? `الموسم ${seasonNum}`,
					slug: season.id,
					series_slug: series.id,
					series_title: series.data?.title ?? series.id,
					season_number: seasonNum,
					episodes_count: episodes.length,
					url: `${baseUrl}/tv/${series.id}/season-${seasonNum}`,
				})
			);

			if (seasonLines.length >= limit) break;
		}
		if (seasonLines.length >= limit) break;
	}

	return new Response(seasonLines.join("\n"), {
		headers: {
			"Content-Type": "application/x-ndjson; charset=utf-8",
			"Cache-Control": "public, max-age=3600, s-maxage=86400",
		},
	});
};
