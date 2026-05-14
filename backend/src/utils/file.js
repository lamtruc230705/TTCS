function toPublicFilePath(file) {
  if (!file) return null;
  return file.path.replace(/\\/g, '/').replace(/^src\//, '/');
}

module.exports = { toPublicFilePath };
