<template>
<div class="circle">
  <GMapCircle  
    :center="center"
    :radius="radius"

    :options="{
      fillColor: fill,
      fillOpacity: 0.5,
      strokeColor: accent,
      strikeOpacity: 1
    }"

  @click="e => $emit('circle-clicked', e)"
  />
  <GMapCircle
    :center="center"
    :radius="radius/50"

    :options="{
      fillColor: accent,
      fillOpacity: 1,
      strokeColor: accent,
      strikeOpacity: 1
    }"
    @click="e => $emit('circle-clicked', e)"
  >

  </GMapCircle>
</div>
</template>
<script>
export default {
    name: "MapCircle",

    props: {
        center: Object,
        radius: Number,
        fill: String,
        accent: String
    },

    emits: ['circle-clicked']
}
</script>