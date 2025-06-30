exports.getByteLength = (str) => {
  return new TextEncoder().encode(str).length;
};
