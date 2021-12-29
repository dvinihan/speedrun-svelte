<script lang="ts">
	import type { RunsApiResponse } from 'src/types';
	import { getDisplayTime } from '../util/helpers';
	import axios from 'axios';
	import type { RunType } from 'src/constants';

	export let runsData: RunsApiResponse = undefined;
	export let isRunning: boolean;
	export let runningTime: number;
	export let isFinished: boolean;
	export let isOnLastSegment: boolean;
	export let activeSegmentStartedAtTime: number;
	export let runId: number = undefined;
	export let currentSegmentId: number = undefined;
	export let activeSegmentTime: number;
	export let runType: RunType;

	export let addTimerInterval: () => void;
	export let removeTimerInterval: () => void;

	const start = () => {
		isRunning = true;
		activeSegmentStartedAtTime = Date.now();
		addTimerInterval();
	};
	const stop = () => {
		isRunning = false;
		performSplit({ isCompleted: false });
		removeTimerInterval();
	};
	const resume = () => {
		isRunning = true;
		activeSegmentStartedAtTime = Date.now();
		addTimerInterval();
	};
	const finish = () => {};
	const split = () => {};
	const reset = () => {};

	const performSplit = async ({ isCompleted }: { isCompleted: boolean }) => {
		const newRunSegment = {
			runId,
			segmentId: currentSegmentId!,
			segmentTime: activeSegmentTime,
			isCompleted
		};

		activeSegmentStartedAtTime = Date.now();
		const runSegmentIndex = runsData.latestRunSegments.findIndex(
			(r) => r.segmentId === currentSegmentId
		);
		if (runSegmentIndex === undefined) {
			runsData.latestRunSegments.push(newRunSegment);
		} else {
			runsData.latestRunSegments[runSegmentIndex] = newRunSegment;
		}

		const { data } = await axios.post<RunsApiResponse>(`/split?runType=${runType}`, newRunSegment);
		runsData = data;
	};
</script>

<div class="flex-vertical">
	<div class="flex">
		{#if isRunning}
			<button class="large-button stop-button" on:click={stop}>Stop</button>
		{:else}
			<button
				class="large-button start-button"
				disabled={isFinished}
				on:click={runningTime ? resume : start}
			>
				{runningTime ? 'Resume' : 'Start'}
			</button>
		{/if}
		<button
			class="large-button"
			style={`background-color: ${isRunning ? 'lightgreen' : ''} `}
			disabled={!isRunning}
			on:click={isOnLastSegment ? finish : split}
		>
			{isOnLastSegment ? 'Finish' : 'Split'}
		</button>
	</div>
	{#if isFinished}
		<div class="big-text">Done!</div>
	{/if}
	<div class="big-text">{getDisplayTime(runningTime)}</div>
	<button class="medium-button" disabled={isRunning} on:click={reset}> Reset </button>
</div>

<style>
	.large-button {
		margin-right: 15px;
		margin-left: 15px;
		padding: 25px;
		font-size: x-large;
	}

	.start-button {
		background-color: lightgreen;
	}

	.stop-button {
		background-color: salmon;
	}

	.flex-vertical {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
	}

	.flex {
		display: flex;
	}

	.big-text {
		display: flex;
		justify-content: center;
		margin: 30px;
		font-size: xx-large;
	}

	.medium-button {
		margin-right: 5px;
		margin-left: 5px;
		padding: 10px;
		font-size: medium;
	}
</style>
