<template>
    <div id="Scene-Manager">
        <CreateScene/>
    </div>
</template>

<script>
import CreateScene from '../components/ScenesManager/CreateScene.vue';

export default {
    name: "SceneManager",

    components: {
        CreateScene,
    },
}
</script>