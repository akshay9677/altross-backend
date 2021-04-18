exports.isEmpty = (value) => {
  return (
    value === undefined ||
    value === null ||
    Number(value) === -1 ||
    (typeof value === "object" && Object.keys(value).length === 0) ||
    (typeof value === "string" && value.trim().length === 0)
  )
}

exports.getId = (value, max) => {
  let userKey = value
  let userUniqueNum = Array.from(userKey)
    .map((letter) => letter.charCodeAt(0))
    .reduce((current, previous) => previous + current)
  let colorIndex = userUniqueNum % max
  return colorIndex
}
