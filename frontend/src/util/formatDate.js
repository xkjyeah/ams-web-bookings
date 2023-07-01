export function formatDateYMD(date) {
  return date &&
    [
      (date.getUTCFullYear()).toString().padStart(4, '0'),
      (date.getUTCMonth() + 1).toString().padStart(2, '0'),
      (date.getUTCDate()).toString().padStart(2, '0'),
    ].join('-');
}

export function parseDateMDY(s) {
  if (!s) {
    return null;
  } else {
    let dateMatch = s.trim().match(/^([0-9]{1,2})[.-\/]([0-9]{1,2})[.-\/]([0-9]{2,4})$/)

    if (!dateMatch) {
      return null;
    }

    const yearInt = parseInt(dateMatch[3])
    const year = yearInt < 100 ? 2000 + yearInt : yearInt

    return new Date(Date.UTC(
      year,
      parseInt(dateMatch[2]) - 1,
      parseInt(dateMatch[1])
    ))
  }
}
