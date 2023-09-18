export function roundTo(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}
