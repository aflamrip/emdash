import type { APIRoute } from "astro";
import { getEmDashCollection, getSiteSettings } from "emdash";

import { getSiteLocale } from "../utils/locale";
import { resolveBlogSiteIdentity } from "../utils/site-identity";

interface FeedItem {
	title: string;
	link: string;
	date: Date;
	description: string;
	category: string;
	image?: string;
	videoUrl?: string;
}

export const GET: APIRoute = async ({ site, url }) => {
	const siteUrl = site ?? new URL(url.origin);
	const settings = await getSiteSettings().catch(() => null);
	const { siteTitle, siteTagline } = resolveBlogSiteIdentity(settings ?? undefined);

	// 1. جلب أحدث الأفلام وأحدث الحلقات والمسلسلات
	const [moviesRes, epRes, tvRes] = await Promise.all([
		getEmDashCollection("movies", { limit: 30, orderBy: { created_at: "desc" } }).catch(() => ({ entries: [] })),
		getEmDashCollection("episodes", { limit: 30, orderBy: { created_at: "desc" } }).catch(() => ({ entries: [] })),
		getEmDashCollection("tv", { limit: 50 }).catch(() => ({ entries: [] })),
	]);

	const movies: any[] = (moviesRes as any).entries || [];
	const rawEpisodes: any[] = (epRes as any).entries || [];
	const tvSeries: any[] = (tvRes as any).entries || [];

	const feedItems: FeedItem[] = [];

	const stripPrefix = (t: string, prefix: string) =>
		t && t.startsWith(prefix + " ") ? t.slice(prefix.length + 1) : (t ?? "");

	// 2. إضافة الأفلام
	for (const movie of movies) {
		const m = movie.data;
		const cleanTitle = stripPrefix(m.title || movie.id, "فيلم");
		const imgUrl = typeof m.featured_image === "string" ? m.featured_image : m.featured_image?.src;
		feedItems.push({
			title: `فيلم ${cleanTitle}`,
			link: new URL(`/movies/${movie.id}`, siteUrl).href,
			date: m.publishedAt ? new Date(m.publishedAt) : (m.created_at ? new Date(m.created_at) : new Date()),
			description: m.excerpt || m.overview || `مشاهدة وتحميل فيلم ${cleanTitle} بجودة عالية Full HD أونلاين على ${siteTitle}`,
			category: "أفلام",
			image: imgUrl || undefined,
			videoUrl: m.video || m.video_url || undefined,
		});
	}

	// 3. إضافة الحلقات مع ربطها التلقائي بمسلسلاتها ومواسمها
	for (const ep of rawEpisodes) {
		const e = ep.data;
		const matchedSeries = tvSeries.find((t: any) => ep.id.startsWith(t.id + "-")) ?? tvSeries[0];
		const seriesSlug = matchedSeries?.id ?? "series";
		const seriesTitle = stripPrefix(matchedSeries?.data?.title ?? "مسلسل", "مسلسل");
		const seasonMatch = ep.id.match(/season-(\d+)/);
		const seasonNumber = seasonMatch ? parseInt(seasonMatch[1], 10) : (e.season_number ?? 1);
		const episodeNumber = e.episode_number ?? 1;
		const epTitle = e.title && !e.title.startsWith("الحلقة") && !e.title.startsWith("حلقة") ? e.title : "";
		const fullEpTitle = `مسلسل ${seriesTitle} — الموسم ${seasonNumber} الحلقة ${episodeNumber}${epTitle ? ` (${epTitle})` : ""}`;
		const epLink = new URL(`/tv/${seriesSlug}/season-${seasonNumber}/episode-${episodeNumber}`, siteUrl).href;

		const epImage = typeof e.featured_image === "string"
			? e.featured_image
			: (e.featured_image?.src || (typeof matchedSeries?.data?.featured_image === "string" ? matchedSeries.data.featured_image : matchedSeries?.data?.featured_image?.src));

		feedItems.push({
			title: fullEpTitle,
			link: epLink,
			date: e.publishedAt ? new Date(e.publishedAt) : (e.created_at ? new Date(e.created_at) : new Date()),
			description: e.excerpt || e.overview || `مشاهدة الحلقة ${episodeNumber} من الموسم ${seasonNumber} لمسلسل ${seriesTitle} بجودة فائقة Full HD`,
			category: "حلقات المسلسلات",
			image: epImage || undefined,
			videoUrl: e.video || e.video_url || undefined,
		});
	}

	// 4. ترتيب العناصر معاً زمنياً من الأحدث إلى الأقدم
	feedItems.sort((a, b) => b.date.getTime() - a.date.getTime());

	const siteLogoUrl = new URL("/favicon.svg", siteUrl).href;

	const itemsXml = feedItems
		.map((item) => {
			const pubDate = item.date.toUTCString();
			const title = escapeXml(item.title);
			const description = escapeXml(item.description);
			const imgUrl = item.image ? escapeXml(item.image) : "";

			const mediaThumbnail = imgUrl
				? `\n      <media:thumbnail url="${imgUrl}" />`
				: "";
			const mediaContent = imgUrl
				? `\n      <media:content url="${imgUrl}" medium="image" />`
				: "";
			const enclosure = item.videoUrl
				? `\n      <enclosure url="${escapeXml(item.videoUrl)}" type="video/mp4" length="0"/>`
				: "";

			return `    <item>
      <title>${title}</title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.link}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(item.category)}</category>
      <description>${description}</description>${mediaThumbnail}${mediaContent}${enclosure}
    </item>`;
		})
		.join("\n");

	const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(siteTitle)} – آخر الأفلام والحلقات المضافة</title>
    <description>${escapeXml(siteTagline)}</description>
    <link>${siteUrl.href}</link>
    <atom:link href="${new URL("/rss.xml", siteUrl).href}" rel="self" type="application/rss+xml"/>
    <language>${getSiteLocale() ?? "ar"}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>60</ttl>
    <generator>EmDash CMS</generator>
    <managingEditor>noreply@ma3ak.top</managingEditor>
    <webMaster>noreply@ma3ak.top</webMaster>
    <image>
      <url>${siteLogoUrl}</url>
      <title>${escapeXml(siteTitle)}</title>
      <link>${siteUrl.href}</link>
    </image>
${itemsXml}
  </channel>
</rss>`;

	return new Response(rss, {
		headers: {
			"Content-Type": "application/rss+xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600, s-maxage=86400",
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
	let result = str ?? "";
	for (const [pattern, replacement] of XML_ESCAPE_PATTERNS) {
		result = result.replace(pattern, replacement);
	}
	return result;
}
