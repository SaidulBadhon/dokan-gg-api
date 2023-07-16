function combineObjectsWithReplacement(obj1, obj2) {
  // Iterate over obj2 and update obj1 with matching keys
  for (const key in obj2) {
    if (obj1.hasOwnProperty(key)) {
      obj1[key] = obj2[key];
    }
  }
}

module.exports = combineObjectsWithReplacement;
