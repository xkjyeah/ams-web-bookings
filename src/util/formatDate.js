const leftPad = require('left-pad');

module.exports = {
  formatDate(date) {
    return date &&
      [
        leftPad(date.getFullYear(), 4, '0'),
        leftPad(date.getMonth() + 1, 2, '0'),
        leftPad(date.getDate(), 2, '0'),
      ].join('-');
  },

  parseDate(s) {
    if (!s) {
      return null;
    } else {
      let match = s.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})/)

      if (!match) {
        return null;
      }

      return new Date(
        parseInt(match[1]),
        parseInt(match[2]) - 1,
        parseInt(match[3])
      )
    }
  }
};
