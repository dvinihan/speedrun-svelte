<script lang="ts">
	import type { RunsApiResponse, SegmentRow } from 'src/types';
	import { RunType } from '../constants';
	import { onMount } from 'svelte';
	import SegmentItem from '../components/SegmentItem.svelte';
	import EditSegmentItem from '../components/EditSegmentItem.svelte';
	import Stopwatch from '../components/Stopwatch.svelte';
	import { sumBy } from 'lodash';

	let runsData: RunsApiResponse | undefined;
	let segments: SegmentRow[] = [];

	let runningTime = 0;
	let activeSegmentTime = 0;
	let activeSegmentStartedAtTime = 0;
	let isRunning = false;
	let runType = RunType.ANY_PERCENT;

	let editSegments = false;
	let newSegment: SegmentRow | undefined;

	let runId: number;
	let currentSegmentId: number;

	$: isFinished = runsData?.latestRunSegments.every((r) => r.isCompleted);
	$: isOnLastSegment = currentSegmentId === segments[-1]?.id;
	$: latestRunSegments = runsData?.latestRunSegments;
	$: bestSegmentTimes = runsData?.bestSegmentTimes;

	const fetchSegments = async () => {
		const res = await fetch(`/segments?runType=${runType}`);
		segments = await res.json();
		newSegment = undefined;
	};
	const segmentsPromise = fetchSegments();

	const fetchRuns = async () => {
		const res = await fetch(`runs?runType=${runType}`);
		runsData = await res.json();

		if (runsData.latestRunSegments.length === 0) {
			currentSegmentId = 1;
		} else {
			const maxSegmentId = Math.max(...runsData.latestRunSegments.map((r) => r.segmentId));
			currentSegmentId = runsData.latestRunSegments.every((r) => r.isCompleted)
				? maxSegmentId + 1
				: maxSegmentId;
		}

		const currentSegment = runsData.latestRunSegments.find(
			(runSegment) => runSegment.segmentId === currentSegmentId
		);

		runningTime = sumBy(runsData.latestRunSegments, (r) => r.segmentTime);
		runId = runsData?.latestRunSegments?.[0]?.runId;
		activeSegmentTime = currentSegment.segmentTime;
	};

	const handleRunTypeChange = async (e: any) => {
		runType = e.target.value;
		await fetchSegments();
		await fetchRuns();
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

	let interval: NodeJS.Timer | undefined;

	const addTimerInterval = () => {
		const originalRunningTime = runningTime;
		const originalSegmentTime = activeSegmentTime;
		interval = setInterval(() => {
			runningTime = Date.now() - activeSegmentStartedAtTime + originalRunningTime;
			activeSegmentTime = Date.now() - activeSegmentStartedAtTime + originalSegmentTime;
		}, 10);
	};

	const removeTimerInterval = () => {
		if (interval) {
			clearInterval(interval);
		}
	};
</script>

<div class="container">
	<h1>SMO Speedrun Timer</h1>
	<select bind:value={runType} disabled={isRunning} on:change={handleRunTypeChange}>
		<option value={RunType.WORLD_PEACE}>World Peace</option>
		<option selected value={RunType.ANY_PERCENT}>Any%</option>
	</select>
	<h3>Segments:</h3>
	{#await segmentsPromise}
		<div>Loading...</div>
	{:then}
		<div class="flex-wrap">
			<div class="segments-list">
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
							bind:activeSegmentStartedAtTime
							bind:currentSegmentId
							bind:segment
							bind:runId
							bind:latestRunSegments
							bind:bestSegmentTimes
							bind:activeSegmentTime
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
			</div>
			<div class="stopwatch">
				<Stopwatch
					bind:isRunning
					bind:runningTime
					bind:activeSegmentStartedAtTime
					bind:runType
					bind:currentSegmentId
					bind:runId
					bind:runsData
					bind:activeSegmentTime
					{isFinished}
					{isOnLastSegment}
					{addTimerInterval}
					{removeTimerInterval}
				/>
				<!-- <Stats /> -->
			</div>
		</div>
	{/await}
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
