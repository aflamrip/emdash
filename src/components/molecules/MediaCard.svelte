<script lang="ts">
	interface Props {
		title: string;
		slug: string;
		type: "movie" | "tv";
		image?: string | { src?: string; alt?: string };
		release?: string;
		duration?: number;
		quality?: string;
	}

	let {
		title,
		slug,
		type,
		image,
		release,
		duration,
		quality = "FHD",
	}: Props = $props();

	const href = type === "movie" ? `/movies/${slug}` : `/tv/${slug}`;

	const imageUrl =
		typeof image === "string"
			? image
			: image?.src ||
				"https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=1200&fit=crop";

	const altText = (typeof image === "object" && image?.alt) ? image.alt : title;
	const typeLabel = type === "movie" ? "فيلم" : "مسلسل";
</script>

<div class="group relative flex flex-col w-full text-right select-none">
	<a
		{href}
		class="relative aspect-[2/3] w-full rounded-xl overflow-hidden skeleton-shimmer border border-[var(--color-border)] transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-2xl group-hover:shadow-[var(--color-brand)]/20 group-hover:border-[var(--color-brand)]/60 focus:outline-none"
	>
		<!-- Poster Image with skeleton loader background -->
		<img
			src={imageUrl}
			alt={altText}
			loading="lazy"
			decoding="async"
			class="w-full h-full object-cover relative z-10 transition-transform duration-500 group-hover:scale-105"
		/>

		<!-- Gradient Overlay -->
		<div
			class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity z-20 pointer-events-none"
		></div>

		<!-- Top Badges -->
		<div class="absolute top-2.5 inset-x-2.5 flex justify-between items-center z-30 pointer-events-none">
			<span class="bg-[var(--color-brand)] text-[var(--color-on-brand)] text-[11px] font-bold px-2 py-0.5 rounded shadow shadow-[var(--color-brand)]/30">
				{typeLabel}
			</span>
			<span class="bg-black/60 backdrop-blur-md text-gray-200 border border-white/10 text-[10px] font-semibold px-1.5 py-0.5 rounded">
				{quality}
			</span>
		</div>

		<!-- Center Play Hover Icon -->
		<div
			class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 z-30 pointer-events-none"
		>
			<div class="w-12 h-12 rounded-full bg-[var(--color-brand)] text-[var(--color-on-brand)] flex items-center justify-center shadow-lg shadow-[var(--color-brand)]/50">
				<svg class="w-6 h-6 mr-0.5 fill-current" viewBox="0 0 24 24">
					<path d="M8 5v14l11-7z" />
				</svg>
			</div>
		</div>

		<!-- Bottom Quick Meta Info inside Card (No rating) -->
		<div class="absolute bottom-2.5 inset-x-2.5 z-30 pointer-events-none">
			<div class="flex items-center gap-2 text-[11px] text-gray-300 font-medium">
				{#if release}
					<span class="text-white font-semibold">{release}</span>
				{/if}
				{#if duration}
					<span>•</span>
					<span>{duration} دقيقة</span>
				{/if}
			</div>
		</div>
	</a>

	<!-- Title under Card -->
	<a {href} class="mt-2 group/title focus:outline-none">
		<h3
			class="text-sm font-semibold text-[var(--color-text)] line-clamp-1 group-hover/title:text-[var(--color-brand)] transition-colors"
			title={title}
		>
			{title}
		</h3>
	</a>
</div>
