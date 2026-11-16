import type { APIRoute } from "astro";
import { getEmDashCollection, getEmDashEntry } from "emdash";

export const GET: APIRoute = async ({ site, url }) => {
	const siteUrl = site ?? new URL(url.origin);

	// 1. جلب كل المسلسلات مع مواسمها (Hierarchical via References API)
	const [moviesRes, tvRes] = await Promise.all([
		getEmDashCollection("movies", { limit: 100, orderBy: { created_at: "desc" } }).catch(() => ({ entries: [] })),
		getEmDashCollection("tv", { limit: 50 }).catch(() => ({ entries: [] })),
	]);

	const movies: any[] = moviesRes.entries ?? [];
	const tvList: any[] = tvRes.entries ?? [];

	const videoUrls: string[] = [];

	// Helper: strip leading "فيلم" or "مسلسل" prefix to avoid duplication
	const stripPrefix = (t: string, prefix: string) =>
		t && t.startsWith(prefix + " ") ? t.slice(prefix.length + 1) : (t ?? "");

	// 2. أفلام → فيديو لكل فيلم
	for (const movie of movies) {
		const m = movie.data;
		const pageLoc = new URL(`/movies/${movie.id}`, siteUrl).href;
		const thumbnail = typeof m.featured_image === "string" ? m.featured_image : m.featured_image?.src ?? "";
		const cleanTitle = stripPrefix(m.title ?? movie.id, "فيلم");
		const title = `مشاهدة فيلم ${cleanTitle} كامل ومترجم`;
		const description = m.excerpt ?? `مشاهدة وتحميل فيلم ${m.title} بجودة فائقة Full HD`;
		const contentLoc = m.video ?? "";
		const duration = ((m.duration ?? 120) * 60); // بالثواني

		videoUrls.push(`  <url>
    <loc>${escapeXml(pageLoc)}</loc>
    <video:video>
      <video:thumbnail_loc>${escapeXml(thumbnail)}</video:thumbnail_loc>
      <video:title>${escapeXml(title)}</video:title>
      <video:description>${escapeXml(description)}</video:description>
      ${contentLoc ? `<video:content_loc>${escapeXml(contentLoc)}</video:content_loc>` : ""}
      <video:duration>${duration}</video:duration>
    </video:video>
  </url>`);
	}

	// 3. مسلسلات → حلقات بشكل هرمي عبر References API
	for (const tvEntry of tvList) {
		// جلب المسلسل مع مواسمه
		const tvRes2 = await getEmDashEntry("tv", tvEntry.id, {
			references: { seasons: { limit: 20 } },
		}).catch(() => null);

		if (!tvRes2?.entry) continue;
		const tv = tvRes2.entry;
		const rawSeasons: any[] = tv.references?.seasons?.entries ?? [];

		for (const season of rawSeasons) {
			// جلب الموسم مع حلقاته
			const seasonRes = await getEmDashEntry("seasons", season.id, {
				references: { episodes: { limit: 100 } },
			}).catch(() => null);

			if (!seasonRes?.entry) continue;
			const fullSeason = seasonRes.entry;
			const seasonNum = fullSeason.data?.season_number ?? 1;
			const rawEpisodes: any[] = (fullSeason.references?.episodes?.entries ?? [])
				.sort((a: any, b: any) => (a.data?.episode_number ?? 0) - (b.data?.episode_number ?? 0));

			for (const ep of rawEpisodes) {
				const epData = ep.data;
				const epNum = epData?.episode_number ?? 1;

				const pageLoc = new URL(
					`/tv/${tv.id}/season-${seasonNum}/episode-${epNum}`,
					siteUrl
				).href;

				const thumbnail =
					(typeof epData?.featured_image === "string"
						? epData.featured_image
						: epData?.featured_image?.src) ??
					(typeof tv.data?.featured_image === "string"
						? tv.data.featured_image
						: tv.data?.featured_image?.src) ??
					"";

				const epTitleExtra =
					epData?.title && epData.title !== `الحلقة ${epNum}`
						? ` - ${epData.title}`
						: "";

				const cleanSeriesTitle = stripPrefix(tv.data?.title ?? "", "مسلسل");
			const title = `مشاهدة مسلسل ${cleanSeriesTitle} الموسم ${seasonNum} الحلقة ${epNum}${epTitleExtra} كاملة ومترجمة`;
				const description =
					epData?.excerpt ??
					`مشاهدة وتحميل الحلقة ${epNum} من الموسم ${seasonNum} لمسلسل ${tv.data?.title ?? ""} بدقة عالية`;
				const contentLoc = epData?.video ?? "";
				const duration = ((epData?.duration ?? 45) * 60); // بالثواني

				videoUrls.push(`  <url>
    <loc>${escapeXml(pageLoc)}</loc>
    <video:video>
      <video:thumbnail_loc>${escapeXml(thumbnail)}</video:thumbnail_loc>
      <video:title>${escapeXml(title)}</video:title>
      <video:description>${escapeXml(description)}</video:description>
      ${contentLoc ? `<video:content_loc>${escapeXml(contentLoc)}</video:content_loc>` : ""}
      <video:duration>${duration}</video:duration>
    </video:video>
  </url>`);
			}
		}
	}

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${videoUrls.join("\n")}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
};

const XML_ESCAPE_PATTERNS = [
	[/&/g, "&amp;"],
	[/</g, "&lt;"],
	[/>/g, "&gt;"],
	[/"/g, "&quot;"],
	[/'/g, "&apos;"],
] as const;

function escapeXml(str: string): string {
	let result = str;
	for (const [pattern, replacement] of XML_ESCAPE_PATTERNS) {
		result = result.replace(pattern, replacement as string);
	}
	return result;
}
