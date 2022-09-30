<template>
  <h2>CSS Modules</h2>
  <div class="sfc-css-modules" :class="$style.blueColor">
    &lt;style module&gt; - this should be blue
    <pre>{{ $style }}</pre>
  </div>
  <div class="sfc-css-modules-with-pre" :class="$style.orangeColor">
    CSS - this should be orange
    <pre>{{ $style }}</pre>
  </div>
</template>

<style module>
.blue-color {
  color: blue;
}
</style>
