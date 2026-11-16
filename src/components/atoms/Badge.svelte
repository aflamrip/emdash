<script lang="ts">
	interface Props {
		variant?: "brand" | "quality" | "gold" | "muted";
		children?: any;
		class?: string;
	}

	let {
		variant = "brand",
		children,
		class: className = "",
	}: Props = $props();

	const variantStyles = {
		brand: "bg-[var(--color-brand)] text-[var(--color-on-brand)]",
		quality: "bg-[var(--color-fill)] text-[var(--color-text)] border border-[var(--color-border)]",
		gold: "bg-[#f5c518] text-black font-bold",
		muted: "bg-[var(--color-fill-strong)] text-[var(--color-text-secondary)] border border-[var(--color-border)]",
	};
</script>

<span
	class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wider {variantStyles[
		variant
	]} {className}"
>
	{@render children?.()}
</span>
