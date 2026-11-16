<script lang="ts">
	interface MediaRow {
		title: string;
		type: string;
		release?: string;
		duration?: number;
		genre?: string;
		slug: string;
	}

	interface Props {
		data: MediaRow[];
	}

	let { data = [] }: Props = $props();

	let filterText = $state("");
	let sortColumn = $state<"title" | "release" | "duration">("title");
	let sortAsc = $state(true);

	const filteredData = $derived(
		data
			.filter((row) =>
				filterText
					? row.title.toLowerCase().includes(filterText.toLowerCase()) ||
						row.genre?.toLowerCase().includes(filterText.toLowerCase())
					: true
			)
			.sort((a, b) => {
				const valA = a[sortColumn] ?? "";
				const valB = b[sortColumn] ?? "";
				if (valA < valB) return sortAsc ? -1 : 1;
				if (valA > valB) return sortAsc ? 1 : -1;
				return 0;
			})
	);

	function toggleSort(col: "title" | "release" | "duration") {
		if (sortColumn === col) {
			sortAsc = !sortAsc;
		} else {
			sortColumn = col;
			sortAsc = true;
		}
	}
</script>

<div class="w-full bg-[#12141e] rounded-xl border border-[#1f2438] p-4 text-sm">
	<div class="flex items-center justify-between mb-4 gap-4">
		<input
			type="text"
			bind:value={filterText}
			placeholder="تصفية بالقائمة..."
			class="bg-[#151824] text-white text-xs px-3 py-1.5 rounded-lg border border-[#2d334d] focus:border-[var(--color-brand)] outline-none max-w-xs"
		/>
		<span class="text-xs text-gray-400">
			إجمالي النتائج: {filteredData.length}
		</span>
	</div>

	<div class="overflow-x-auto">
		<table class="w-full text-right text-xs">
			<thead class="bg-[#151824] text-gray-400 border-b border-[#1f2438]">
				<tr>
					<th
						onclick={() => toggleSort("title")}
						class="py-2.5 px-3 cursor-pointer hover:text-white"
					>
						العنوان {sortColumn === "title" ? (sortAsc ? "▲" : "▼") : ""}
					</th>
					<th class="py-2.5 px-3">النوع</th>
					<th
						onclick={() => toggleSort("release")}
						class="py-2.5 px-3 cursor-pointer hover:text-white"
					>
						السنة {sortColumn === "release" ? (sortAsc ? "▲" : "▼") : ""}
					</th>
					<th
						onclick={() => toggleSort("duration")}
						class="py-2.5 px-3 cursor-pointer hover:text-white"
					>
						المدة {sortColumn === "duration" ? (sortAsc ? "▲" : "▼") : ""}
					</th>
					<th class="py-2.5 px-3">التصنيف</th>
					<th class="py-2.5 px-3">رابط المشاهدة</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-[#1f2438]">
				{#each filteredData as row}
					<tr class="hover:bg-[#191c2b] transition-colors">
						<td class="py-2.5 px-3 font-semibold text-white">
							{row.title}
						</td>
						<td class="py-2.5 px-3 text-gray-400">
							<span class="px-2 py-0.5 rounded text-[10px] bg-[#1c2030] text-gray-300">
								{row.type}
							</span>
						</td>
						<td class="py-2.5 px-3 text-gray-300">{row.release || "—"}</td>
						<td class="py-2.5 px-3 text-gray-300">
							{row.duration ? `${row.duration} د` : "—"}
						</td>
						<td class="py-2.5 px-3 text-gray-400">{row.genre || "—"}</td>
						<td class="py-2.5 px-3">
							<a
								href={row.type === "فيلم" ? `/movies/${row.slug}` : `/tv/${row.slug}`}
								class="text-[var(--color-brand)] hover:underline font-medium"
							>
								مشاهدة ▶
							</a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
