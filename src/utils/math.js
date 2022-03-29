const sort = (array, sortBy, orderBy = 'ASC') => {
    const copy = [...array]
    return copy.sort((a, b) => orderBy === 'ASC' ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy])
}

export default {
    sort,
}
