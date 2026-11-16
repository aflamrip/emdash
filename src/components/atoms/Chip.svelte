<script lang="ts">
	interface Props {
		href?: string;
		active?: boolean;
		children?: any;
		class?: string;
		[key: string]: any;
	}

	let {
		href,
		active = false,
		children,
		class: className = "",
		...rest
	}: Props = $props();

	const activeClass = active
		? "bg-[var(--color-brand)] text-[var(--color-on-brand)] border-[var(--color-brand)] shadow-sm shadow-[var(--color-brand)]/20 font-bold"
		: "bg-[var(--color-fill)] text-[var(--color-text)] hover:bg-[var(--color-fill-strong)] border-[var(--color-border)] font-medium";
</script>

{#if href}
	<a
		{href}
		class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer shrink-0 {activeClass} {className}"
		{...rest}
	>
		{@render children?.()}
	</a>
{:else}
	<span
		class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium border shrink-0 {activeClass} {className}"
		{...rest}
	>
		{@render children?.()}
	</span>
{/if}
