import type { APIRoute } from "astro";
import { getEmDashCollection, getEmDashEntry, getEntryTerms } from "emdash";

export const GET: APIRoute = async ({ site, url }) => {
	const siteUrl = site ?? new URL(url.origin);
	const baseUrl = siteUrl.href.replace(/\/$/, "");

	const limitParam = url.searchParams.get("limit");
	const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10), 1), 100) : 50;

	const { entries: tvSeries = [] } = await getEmDashCollection("tv", {
		limit,
		orderBy: { created_at: "desc" },
	}).catch(() => ({ entries: [] }));

	const lines = await Promise.all(
		tvSeries.map(async (series: any) => {
			const s = series.data;
			let genres: string[] = [];
			if (s.id) {
				const terms = await getEntryTerms("tv", s.id).catch(() => []);
				genres = terms.filter((t: any) => t.name === "genre" || t.name === "tv_genre").map((t: any) => t.label);
			}

			// Get seasons count via References API
			const tvDetails = await getEmDashEntry("tv", series.id, {
				references: { seasons: { limit: 50 } },
			}).catch(() => null);

			const seasons = tvDetails?.entry?.references?.seasons?.entries ?? [];
			const imgUrl = typeof s.featured_image === "string" ? s.featured_image : s.featured_image?.src;

			return JSON.stringify({
				id: s.id ?? series.id,
				title: s.title ?? series.id,
				slug: series.id,
				overview: s.overview ?? s.excerpt ?? "",
				release: s.release ?? "",
				seasons_count: seasons.length,
				genres,
				image: imgUrl ?? null,
				url: `${baseUrl}/tv/${series.id}`,
				created_at: s.createdAt instanceof Date ? s.createdAt.toISOString() : (s.created_at ?? null),
			});
		})
	);

	return new Response(lines.join("\n"), {
		headers: {
			"Content-Type": "application/x-ndjson; charset=utf-8",
			"Cache-Control": "public, max-age=3600, s-maxage=86400",
		},
	});
};
