<script lang="ts">
	import type { RunsApiResponse, SegmentRow } from 'src/types';
	import { RunType } from '../constants';
	import { onMount } from 'svelte';
	import SegmentItem from '../components/SegmentItem.svelte';
	import EditSegmentItem from '../components/EditSegmentItem.svelte';

	let runsData: RunsApiResponse;
	let segments: SegmentRow[] = [];

	let isRunning: boolean = false;
	let activeSegmentStartedAtTime: number;
	let activeSegmentTime: number;
	let runId: number;
	let runType: RunType = RunType.ANY_PERCENT;

	let editSegments = false;
	let newSegment: SegmentRow | undefined;
	let currentSegmentId: number;

	const fetchSegments = async () => {
		const res = await fetch(`/segments?runType=${runType}`);
		segments = await res.json();
		newSegment = undefined;
	};
	const segmentsPromise = fetchSegments();

	const fetchRuns = async () => {
		const res = await fetch(`runs?runType=${runType}`);
		runsData = await res.json();
	};

	const handleRunTypeChange = async (e: any) => {
		runType = e.target.value;
		await fetchSegments();
	};
	const handleAddSegment = () => {
		const maxId =
			segments.length > 0 ? Math.max(...segments.map((segment: SegmentRow) => segment.id)) : 0;
		newSegment = { id: maxId + 1, name: '' };
	};
	const handleDiscard = () => {
		newSegment = undefined;
	};

	onMount(async () => {
		await fetchRuns();
	});
</script>

<div class="container">
	<h1>SMO Speedrun Timer</h1>
	<select bind:value={runType} disabled={isRunning} on:change={handleRunTypeChange}>
		<option value={RunType.WORLD_PEACE}>World Peace</option>
		<option selected value={RunType.ANY_PERCENT}>Any%</option>
	</select>
	<h3>Segments:</h3>
	<div class="flex-wrap">
		<div class="segments-list">
			{#await segmentsPromise}
				<div>Loading...</div>
			{:then}
				{#if editSegments}
					{#each segments as segment}
						<EditSegmentItem {fetchSegments} {segment} {runType} />
					{/each}
					{#if newSegment}
						<EditSegmentItem
							{handleDiscard}
							{fetchSegments}
							showEdit
							isNew
							segment={newSegment}
							{runType}
						/>
					{/if}
				{:else}
					{#each segments as segment}
						<SegmentItem
							{activeSegmentTime}
							{activeSegmentStartedAtTime}
							{currentSegmentId}
							bestSegmentTimes={runsData?.bestSegmentTimes}
							{segment}
							{runId}
							latestRunSegments={runsData?.latestRunSegments}
						/>
					{/each}
				{/if}
				<button class="medium-button" on:click={() => (editSegments = !editSegments)}>
					{#if editSegments}
						Done Editing
					{:else}
						Edit Route
					{/if}
				</button>
				{#if editSegments && !newSegment}
					<button class="medium-button" on:click={handleAddSegment}>Add Segment</button>
				{/if}
			{/await}
		</div>
		<div class="stopwatch">
			<!-- <Stopwatch />
			<Stats /> -->
		</div>
	</div>
</div>

<style>
	.flex-wrap {
		display: flex;
		flex-wrap: wrap;
	}

	.container {
		margin: 20px;
	}

	.segments-list {
		flex: 1;
		min-width: 240px;
		margin-bottom: 40px;
	}

	.stopwatch {
		flex-direction: column;
		flex: 1;
		min-width: 240px;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.medium-button {
		margin-right: 5px;
		margin-left: 5px;
		padding: 10px;
		font-size: medium;
	}
</style>
