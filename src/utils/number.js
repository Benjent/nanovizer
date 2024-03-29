const formatNumber = (number, options) => {
    return new Intl.NumberFormat('en-EN', options).format(number)
}

const formatPercentage = (number) => {
    return new Intl.NumberFormat('en-EN', { style: 'unit', unit: 'percent', maximumFractionDigits: 2 }).format(number)
}

export default {
    formatNumber,
    formatPercentage,
}
