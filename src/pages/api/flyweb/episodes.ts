import type { APIRoute } from "astro";
import { getEmDashCollection } from "emdash";

export const GET: APIRoute = async ({ site, url }) => {
	const siteUrl = site ?? new URL(url.origin);
	const baseUrl = siteUrl.href.replace(/\/$/, "");

	const seriesFilter = url.searchParams.get("series");
	const seasonFilter = url.searchParams.get("season");
	const limitParam = url.searchParams.get("limit");
	const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10), 1), 100) : 50;

	const [epRes, tvRes] = await Promise.all([
		getEmDashCollection("episodes", { limit: 100, orderBy: { created_at: "desc" } }).catch(() => ({ entries: [] })),
		getEmDashCollection("tv", { limit: 50 }).catch(() => ({ entries: [] })),
	]);

	const rawEpisodes: any[] = (epRes as any).entries || [];
	const tvSeries: any[] = (tvRes as any).entries || [];

	let filtered = rawEpisodes;

	if (seriesFilter) {
		filtered = filtered.filter((ep: any) => ep.id.startsWith(seriesFilter + "-"));
	}
	if (seasonFilter) {
		const targetSeason = `season-${seasonFilter}`;
		filtered = filtered.filter((ep: any) => ep.id.includes(targetSeason));
	}

	const lines = filtered.slice(0, limit).map((ep: any) => {
		const e = ep.data;
		const matchedSeries = tvSeries.find((t: any) => ep.id.startsWith(t.id + "-")) ?? tvSeries[0];
		const seriesSlug = matchedSeries?.id ?? "series";
		const seriesTitle = matchedSeries?.data?.title ?? seriesSlug;
		const seasonMatch = ep.id.match(/season-(\d+)/);
		const seasonNumber = seasonMatch ? parseInt(seasonMatch[1], 10) : (e.season_number ?? 1);
		const episodeNumber = e.episode_number ?? 1;

		return JSON.stringify({
			id: e.id ?? ep.id,
			title: e.title ?? `الحلقة ${episodeNumber}`,
			slug: ep.id,
			series_slug: seriesSlug,
			series_title: seriesTitle,
			season_number: seasonNumber,
			episode_number: episodeNumber,
			duration: e.duration ?? 0,
			url: `${baseUrl}/tv/${seriesSlug}/season-${seasonNumber}/episode-${episodeNumber}`,
			created_at: e.createdAt instanceof Date ? e.createdAt.toISOString() : (e.created_at ?? null),
		});
	});

	return new Response(lines.join("\n"), {
		headers: {
			"Content-Type": "application/x-ndjson; charset=utf-8",
			"Cache-Control": "public, max-age=3600, s-maxage=86400",
		},
	});
};
