<script lang="ts">
	import EpisodeCard from "../molecules/EpisodeCard.svelte";

	interface EpisodeItem {
		id: string;
		slug: string;
		episode_number: number;
		title: string;
		duration?: number;
		featured_image?: any;
	}

	interface SeasonItem {
		id: string;
		slug: string;
		season_number: number;
		title: string;
		episodes?: EpisodeItem[];
	}

	interface Props {
		seasons: SeasonItem[];
		seriesSlug: string;
		initialSeasonNumber?: number;
	}

	let {
		seasons = [],
		seriesSlug,
		initialSeasonNumber = 1,
	}: Props = $props();

	let activeSeasonNumber = $state(
		seasons.length > 0 ? seasons[0].season_number : initialSeasonNumber
	);

	const activeSeason = $derived(
		seasons.find((s) => s.season_number === activeSeasonNumber) || seasons[0]
	);
</script>

<div class="w-full my-8">
	<!-- Seasons Tab Bar -->
	<div class="flex items-center gap-2 overflow-x-auto pb-3 border-b border-[var(--color-border)] scrollbar-none">
		{#each seasons as season}
			<button
				onclick={() => (activeSeasonNumber = season.season_number)}
				class="px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap {activeSeasonNumber ===
				season.season_number
					? 'bg-[var(--color-brand)] text-[var(--color-on-brand)] shadow-lg shadow-[var(--color-brand)]/30'
					: 'bg-[var(--color-fill)] text-[var(--color-text)] hover:bg-[var(--color-fill-strong)] border border-[var(--color-border)]'}"
			>
				{season.title || `الموسم ${season.season_number}`}
			</button>
		{/each}

		{#if activeSeason}
			<a
				href={`/tv/${seriesSlug}/season-${activeSeason.season_number}`}
				class="mr-auto text-xs text-[var(--color-brand)] hover:underline flex items-center gap-1 font-semibold whitespace-nowrap"
			>
				<span>صفحة الموسم الكاملة</span>
				<svg class="w-3.5 h-3.5 fill-current transform rotate-180" viewBox="0 0 24 24">
					<path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
				</svg>
			</a>
		{/if}
	</div>

	<!-- Episodes Text List (بدون صور حلقات) -->
	<div class="mt-6">
		<div class="flex items-center justify-between mb-4">
			<h3 class="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
				<span>🎬</span>
				<span>حلقات {activeSeason?.title || `الموسم ${activeSeasonNumber}`}</span>
			</h3>
			<span class="text-xs text-muted">
				{activeSeason?.episodes?.length || 0} حلقة
			</span>
		</div>

		{#if activeSeason?.episodes && activeSeason.episodes.length > 0}
			<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
				{#each activeSeason.episodes as ep}
					<a
						href={`/tv/${seriesSlug}/season-${activeSeason.season_number}/episode-${ep.episode_number}`}
						class="flex flex-col items-center justify-center p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand)] hover:bg-[var(--color-fill)] hover:shadow-md transition-all group text-center"
					>
						<span class="text-xs text-[var(--color-brand)] font-bold mb-0.5">
							▶
						</span>
						<span class="font-bold text-sm text-[var(--color-text)] group-hover:text-[var(--color-brand)] transition-colors">
							الحلقة {ep.episode_number}
						</span>
						{#if ep.duration}
							<span class="text-[11px] text-muted mt-1">
								{ep.duration} دقيقة
							</span>
						{/if}
					</a>
				{/each}
			</div>
		{:else}
			<div class="p-8 text-center bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] text-muted text-sm">
				قريباً، جاري رفع وتجهيز حلقات هذا الموسم...
			</div>
		{/if}
	</div>
</div>
