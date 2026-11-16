import type { APIRoute } from "astro";
import { getEmDashCollection, getEntryTerms } from "emdash";

export const GET: APIRoute = async ({ site, url }) => {
	const siteUrl = site ?? new URL(url.origin);
	const baseUrl = siteUrl.href.replace(/\/$/, "");

	const limitParam = url.searchParams.get("limit");
	const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10), 1), 100) : 50;
	const genreFilter = url.searchParams.get("genre");

	const { entries: movies = [] } = await getEmDashCollection("movies", {
		limit,
		orderBy: { created_at: "desc" },
	}).catch(() => ({ entries: [] }));

	const lines = await Promise.all(
		movies.map(async (movie: any) => {
			const m = movie.data;
			let genres: string[] = [];
			if (m.id) {
				const terms = await getEntryTerms("movies", m.id).catch(() => []);
				genres = terms.filter((t: any) => t.name === "genre" || t.name === "movie_genre").map((t: any) => t.label);
			}

			const imgUrl = typeof m.featured_image === "string" ? m.featured_image : m.featured_image?.src;

			if (genreFilter && !genres.some((g: string) => g.toLowerCase().includes(genreFilter.toLowerCase()))) {
				return null;
			}

			return JSON.stringify({
				id: m.id ?? movie.id,
				title: m.title ?? movie.id,
				slug: movie.id,
				overview: m.overview ?? m.excerpt ?? "",
				release: m.release ?? "",
				duration: m.duration ?? 0,
				quality: m.quality ?? "FHD",
				genres,
				image: imgUrl ?? null,
				url: `${baseUrl}/movies/${movie.id}`,
				created_at: m.createdAt instanceof Date ? m.createdAt.toISOString() : (m.created_at ?? null),
			});
		})
	);

	return new Response(lines.filter(Boolean).join("\n"), {
		headers: {
			"Content-Type": "application/x-ndjson; charset=utf-8",
			"Cache-Control": "public, max-age=3600, s-maxage=86400",
		},
	});
};
