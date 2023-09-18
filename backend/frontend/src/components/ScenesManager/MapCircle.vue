<template>
    <ol-vector-layer>
      <ol-source-vector>
        <ol-feature>
          <ol-geom-circle :center="center" :radius="radius"></ol-geom-circle>
          <ol-style>
            <ol-style-stroke color="red" :width="3"></ol-style-stroke>
            <ol-style-fill color="rgba(255,200,0,0.2)"></ol-style-fill>
          </ol-style>
        </ol-feature>

        <ol-feature>
          <ol-geom-circle :center="center" :radius="0.0025"></ol-geom-circle>
          <ol-style>
            <ol-style-stroke color="red" :width="3"></ol-style-stroke>
            <ol-style-fill color="red"></ol-style-fill>
          </ol-style>
        </ol-feature>
      </ol-source-vector>
    </ol-vector-layer>
</template>

<script>
export default {
    name: "MapCircle",

    props: {
        center: Array,
        radius: Number,
    }
}
</script>