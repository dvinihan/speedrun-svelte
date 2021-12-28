<script lang="ts">
	import type { RunSegment, RunSegmentTime, SegmentRow } from 'src/types';

	import { getDisplayTime } from '../util/helpers';
	import OverUnder from './OverUnder.svelte';

	export let segment: SegmentRow;
	export let currentSegmentId: number;
	export let bestSegmentTimes: RunSegmentTime[];
	export let runSegments: RunSegment[];
	export let activeSegmentStartedAtTime: number;
	export let activeSegmentTime: number;
	export let runId: number;

	let bestSegmentTime = bestSegmentTimes.find((s) => s.segmentId === segment.id)?.time;
	let runSegment = runSegments.find((r) => r.segmentId === currentSegmentId && r.runId === runId);

	$: isActive = currentSegmentId === segment.id;
	$: shouldCollapse = !runSegment?.isCompleted && !isActive;
	$: timeToShow =
		isActive && activeSegmentStartedAtTime ? activeSegmentTime : runSegment?.segmentTime;

	let containerClass = '';
	containerClass += isActive ? ' active' : '';
	containerClass += shouldCollapse ? ' collapsed' : '';
</script>

<div class={`segment ${containerClass}`}>
	<div class="name">{segment.name}</div>
	<div class="flex-center">
		{#if { bestSegmentTime } && { isActive }}
			<div class="best-time">
				<div class="small-text">Best</div>
				<div>{getDisplayTime(bestSegmentTime)}</div>
			</div>
		{/if}
		{#if runSegment?.isCompleted}
			<OverUnder />
		{/if}
		<div class="time">{getDisplayTime(timeToShow)}</div>
	</div>
</div>

<style>
	.segment {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 10px;
		margin-bottom: 10px;
		padding: 10px;
		height: 64px;
		background-color: lightgray;
	}

	.active {
		border: 5px solid black;
		background-color: lightblue;
	}

	.collapsed {
		height: 20px;
	}

	.name {
		margin-right: 10px;
		font-size: large;
	}

	.flex-center {
		display: flex;
		align-items: center;
	}

	.best-time {
		margin-right: 30px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.small-text {
		font-size: small;
	}

	.time {
		font-weight: 500;
		width: 70px;
		text-align: center;
		font-size: large;
	}
</style>
