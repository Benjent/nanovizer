const getZeroedDateUnit = (value) => {
    return value < 10 ? `0${value}` : value
}

const getCalendarDate = (date) => {
    const year = date.getFullYear()
    const month = getZeroedDateUnit(date.getMonth() + 1)
    const day = getZeroedDateUnit(date.getDate())
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return {
        year,
        month,
        day,
        hour,
        minute,
        second,
    }
}

export default {
    getCalendarDate,
}
