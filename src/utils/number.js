const frFloat = (float) => {
    return float.toString().replace('.', ',')
}

const decimal = (number, precision = 2) => {
    return Number(number).toFixed(precision)
}

export default {
    decimal,
    frFloat,
}