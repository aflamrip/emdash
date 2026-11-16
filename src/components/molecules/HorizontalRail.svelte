<script lang="ts">
	interface Props {
		title: string;
		icon?: string;
		viewAllHref?: string;
		children?: any;
		class?: string;
	}

	let {
		title,
		icon = "🔥",
		viewAllHref,
		children,
		class: className = "",
	}: Props = $props();

	let scrollerElement = $state<HTMLDivElement | null>(null);

	function scrollRight() {
		if (scrollerElement) {
			scrollerElement.scrollBy({ left: -320, behavior: "smooth" });
		}
	}

	function scrollLeft() {
		if (scrollerElement) {
			scrollerElement.scrollBy({ left: 320, behavior: "smooth" });
		}
	}
</script>

<section class="w-full my-6 select-none {className}">
	<!-- Section Header -->
	<div class="flex items-center justify-between mb-3.5">
		<div class="flex items-center gap-2">
			<span class="text-xl">{icon}</span>
			<h2 class="text-lg md:text-xl font-bold text-white tracking-wide">
				{title}
			</h2>
		</div>

		<div class="flex items-center gap-2">
			<!-- Scroll Arrows for Desktop -->
			<div class="hidden sm:flex items-center gap-1.5 ml-2">
				<button
					onclick={scrollRight}
					aria-label="السابق"
					class="w-8 h-8 rounded-full bg-[#1c2030] hover:bg-[#24293d] text-gray-300 hover:text-white flex items-center justify-center transition-colors border border-[#2d334d]"
				>
					<svg class="w-4 h-4 fill-current transform rotate-180" viewBox="0 0 24 24">
						<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
					</svg>
				</button>
				<button
					onclick={scrollLeft}
					aria-label="التالي"
					class="w-8 h-8 rounded-full bg-[#1c2030] hover:bg-[#24293d] text-gray-300 hover:text-white flex items-center justify-center transition-colors border border-[#2d334d]"
				>
					<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
						<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
					</svg>
				</button>
			</div>

			{#if viewAllHref}
				<a
					href={viewAllHref}
					class="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-[var(--color-brand)] hover:opacity-80 bg-[var(--color-brand)]/10 hover:bg-[var(--color-brand)]/20 px-3 py-1.5 rounded-full transition-colors"
				>
					<span>عرض الكل</span>
					<svg class="w-3.5 h-3.5 fill-current transform rotate-180" viewBox="0 0 24 24">
						<path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
					</svg>
				</a>
			{/if}
		</div>
	</div>

	<!-- Scrollable Container -->
	<div
		bind:this={scrollerElement}
		class="horizontal-rail"
	>
		{@render children?.()}
	</div>
</section>
