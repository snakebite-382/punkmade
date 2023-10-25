<template>
    <input class="tw-bg-grey tw-p-1 thin-border tw-leading-tight" :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)">
</template>

<script>
export default {
    name: 'StyledInput',
    props: ['modelValue'],
    emits: ['update:modelValue']
}
</script>

<style scoped>
input {
    outline: none !important;
}
</style>