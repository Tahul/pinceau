<script lang="ts">
	import { fade, fly } from 'svelte/transition'
	let showLogo = false
	let red = false
	function toggleLogo() {
		showLogo = !showLogo
	}
	function toggleSpan() {
		red = !red
	}
	$: button = showLogo ? 'Hide logo' : 'Show logo'
	$: span = red ? 'Normal' : 'Red'
</script>

<main>
	{#if showLogo}
		<span class:logo={showLogo} in:fly="{{ y: 200, duration: 2000 }}" out:fade></span>
	{/if}

	<slot />

</main>

<style>
	:root {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
		Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
	}
</style>
