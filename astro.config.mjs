import cloudflare from "@astrojs/cloudflare";
import { cacheCloudflare } from "@astrojs/cloudflare/cache";
import react from "@astrojs/react";
import svelte from "@astrojs/svelte";
import partytown from "@astrojs/partytown";
import tailwindcss from "@tailwindcss/vite";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { defineConfig, fontProviders } from "astro/config";
import emdash from "emdash/astro";
import flyweb from "astro-flyweb";

export default defineConfig({
	output: "server",
	site: "https://ma3ak.top",
	adapter: cloudflare(),
	cache: {
		provider: cacheCloudflare(),
	},
	i18n: {
		defaultLocale: "ar",
		locales: ["ar"],
	},
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	integrations: [
		react(),
		svelte(),
		partytown({
			config: {
				forward: ["dataLayer.push"],
			},
		}),
		emdash({
			database: d1({ binding: "DB", session: "auto", coalesce: true }),
			storage: r2({ binding: "MEDIA" }),
			siteUrl: "https://ma3ak.top",
		}),
		flyweb({
			entity: "معاك سيما",
			type: "entertainment",
			description: "منصة مشاهدة أحدث الأفلام والمسلسلات العربية والأجنبية والحلقات بجودة فائقة Full HD",
			url: "https://ma3ak.top",
			resources: {
				movies: {
					path: "/api/flyweb/movies",
					format: "jsonl",
					fields: ["id", "title", "slug", "overview", "release", "duration", "quality", "genres", "image", "url", "created_at"],
					query: "?limit={limit}&genre={genre}",
					description: "قائمة الأفلام العربية والأجنبية مع البيانات الوصفية والجودة وروابط المشاهدة",
				},
				tv: {
					path: "/api/flyweb/tv",
					format: "jsonl",
					fields: ["id", "title", "slug", "overview", "release", "seasons_count", "genres", "image", "url", "created_at"],
					query: "?limit={limit}",
					description: "دليل المسلسلات مع المواسم والتصنيفات وتفاصيل العمل",
				},
				seasons: {
					path: "/api/flyweb/seasons",
					format: "jsonl",
					fields: ["id", "title", "slug", "series_slug", "series_title", "season_number", "episodes_count", "url"],
					query: "?series={slug}&limit={limit}",
					description: "مواسم المسلسلات المرتبطة بالمسلسل الأب وتعداد حلقاتها",
				},
				episodes: {
					path: "/api/flyweb/episodes",
					format: "jsonl",
					fields: ["id", "title", "slug", "series_slug", "series_title", "season_number", "episode_number", "duration", "url", "created_at"],
					query: "?series={slug}&season={season}&limit={limit}",
					description: "حلقات المسلسلات الفردية مع الترقيم الزمني وروابط المشاهدة المباشرة",
				},
			},
		}),
	],
	vite: {
		plugins: [tailwindcss()],
	},
	fonts: [
		{
			provider: fontProviders.google(),
			name: "Cairo",
			cssVariable: "--font-arabic",
			weights: [400, 500, 600, 700, 800],
			fallbacks: ["system-ui", "sans-serif"],
		},
		{
			provider: fontProviders.google(),
			name: "Inter",
			cssVariable: "--font-body",
			weights: [400, 500, 600, 700],
			fallbacks: ["sans-serif"],
		},
		{
			provider: fontProviders.google(),
			name: "JetBrains Mono",
			cssVariable: "--font-mono",
			weights: [400, 500],
			fallbacks: ["monospace"],
		},
	],
	devToolbar: { enabled: false },
});
