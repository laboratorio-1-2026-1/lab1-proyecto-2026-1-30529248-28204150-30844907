const blacklist = new Set();

const addToBlacklist = (token) => {
  blacklist.add(token);
  setTimeout(() => blacklist.delete(token), 2 * 60 * 60 * 1000);
};

const isBlacklisted = (token) => {
  return blacklist.has(token);
};

module.exports = { addToBlacklist, isBlacklisted };