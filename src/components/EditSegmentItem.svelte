<script>
	import axios from 'axios';

	export let fetchSegments;
	export let isNew = false;
	export let segment;
	export let runType;
	export let showEdit = false;
	export let handleDiscard = undefined;

	const performSave = async () => {
		await axios.post(`/saveSegment?runType=${runType}`, {
			...segment,
			name: segment.name
		});
		showEdit = false;
		await fetchSegments();
	};
	const handleDelete = async () => {
		await axios.delete(`/deleteSegment?runType=${runType}&id=${segment.id}`);
		showEdit = false;
		await fetchSegments();
	};
</script>

<div class="segment">
	{#if showEdit}
		<input class="name-input" bind:value={segment.name} />
		<button class="medium-button" on:click={performSave}>Save</button>
		{#if isNew}
			<button class="medium-button" on:click={handleDiscard}>Discard</button>
		{:else}
			<button class="medium-button" on:click={handleDelete}>Delete</button>
		{/if}
	{:else}
		<div class="name">{segment.name}</div>
		<button class="medium-button" on:click={() => (showEdit = true)}>Edit</button>
	{/if}
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

	.name {
		margin-right: 10px;
		font-size: large;
	}

	.name-input {
		margin-right: 10px;
		font-size: medium;
		width: 100%;
	}

	.medium-button {
		margin-right: 5px;
		margin-left: 5px;
		padding: 10px;
		font-size: medium;
	}
</style>
