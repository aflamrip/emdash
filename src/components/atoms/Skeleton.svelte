<script lang="ts">
	interface Props {
		type?: "card" | "text" | "video" | "avatar";
		class?: string;
	}

	let { type = "text", class: className = "" }: Props = $props();
</script>

{#if type === "card"}
	<div
		class="skeleton-shimmer rounded-xl aspect-[2/3] w-full {className}"
	></div>
{:else if type === "video"}
	<div
		class="skeleton-shimmer rounded-xl aspect-video w-full {className}"
	></div>
{:else if type === "avatar"}
	<div
		class="skeleton-shimmer rounded-full w-12 h-12 {className}"
	></div>
{:else}
	<div
		class="skeleton-shimmer rounded h-4 w-full {className}"
	></div>
{/if}
