<script lang="ts">
	import "@videojs/html/video/player";
	import "@videojs/html/video/skin";

	interface Props {
		src: string;
		poster?: string;
		subtitle?: string;
		title?: string;
	}

	let { src, poster, subtitle, title }: Props = $props();
</script>

<div class="relative w-full my-4">
	<!-- Top Bar with Title & Quality Badge -->
	{#if title}
		<div class="flex items-center justify-between py-2 px-1 text-xs text-[var(--color-text-secondary)]">
			<div class="flex items-center gap-2">
				<span class="w-2 h-2 rounded-full bg-[var(--color-brand)] animate-pulse shadow-sm shadow-[var(--color-brand)]"></span>
				<span class="font-bold text-[var(--color-text)]">{title}</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[var(--color-fill)] text-[var(--color-brand)] border border-[var(--color-border)]">
					FHD 1080p
				</span>
			</div>
		</div>
	{/if}

	<!-- Responsive Video.js Player Container -->
	<div class="video-player-container">
		<video-player>
			<video-skin {poster}>
				<video
					{src}
					controls
					playsinline
					preload="metadata"
					crossorigin="anonymous"
				>
					{#if subtitle}
						<track
							kind="subtitles"
							src={subtitle}
							srclang="ar"
							label="العربية"
							default
						/>
					{/if}
				</video>
			</video-skin>
		</video-player>
	</div>
</div>
