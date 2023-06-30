const dateformat = require('dateformat');

module.exports = (s, u) => {
  if (typeof s === 'string') {
    const match = s.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})/)

    if (match) {
      return dateformat(new Date(
        parseInt(match[1]),
        parseInt(match[2]) - 1,
        parseInt(match[3]),
        parseInt(match[4]),
        parseInt(match[5]),
        parseInt(match[6])
      ), u);
    }

    const match2 = s.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})/)

    if (!match2) {
      throw new Error("Invalid date: " + s)
    } else {
      return dateformat(new Date(
        parseInt(match2[1]),
        parseInt(match2[2]) - 1,
        parseInt(match2[3])
      ), u);
    }
  }

  return dateformat(s, u)
};
