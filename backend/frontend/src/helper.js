export function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function randColor() {
    return '#'+Math.floor(Math.random()*16777215).toString(16)
}