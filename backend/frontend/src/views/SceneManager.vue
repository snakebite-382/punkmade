<template>
    <div id="Scene-Manager">
        <EnterScene/>
    </div>
</template>

<script>
import EnterScene from '../components/ScenesManager/EnterScene.vue';

export default {
    name: "SceneManager",

    components: {
        EnterScene,
    },
}
</script>