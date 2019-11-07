const lodash = require('lodash');

const convertRequestToDecklist = (body) => {
  return body.map((line) => {
    if (lodash.isEqual(line, 'Sideboard')) {
      return false;
    }
    const lineSplit = line.split(' ');
    const cardCount = lodash.toNumber(lineSplit[0]);
    return { count: cardCount, name: lineSplit.slice(1).join(' ') };
  })
};

module.exports = {
  convertRequestToDecklist
};