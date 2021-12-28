<script lang="ts">
	import { getDisplayTime } from '../util/helpers';

	let diff = 0;

	$: absoluteValueDiff = Math.abs(diff);
	$: operator = diff > 0 ? '+' : '-';
	const tenSecondsMS = 10 * 1000;
	$: color = diff <= -1 * tenSecondsMS ? 'yellow' : diff < 0 ? 'green' : 'red';
</script>

<div class="container" style="color: {color}">
	{operator}
	{getDisplayTime(absoluteValueDiff)}
</div>

<style>
	.container {
		font-weight: 500;
		margin-right: 30px;
	}
</style>
