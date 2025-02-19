const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  blue: "\x1b[34m"
};

const colorful = (color, text) => color + text + '\x1b[0m';

module.exports = { colors, colorful };
