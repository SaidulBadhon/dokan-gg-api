// Sort products by store ID and create a nested array
const sortProductsForOrder = (products) => {
  return products.reduce((acc, product) => {
    const storeId = product.store;

    // Check if the store ID already exists in the accumulator
    const storeIndex = acc.findIndex((item) => item[0].store === storeId);

    if (storeIndex !== -1) {
      // Store ID already exists, push the product into the existing store's array
      acc[storeIndex].push(product);
    } else {
      // Store ID doesn't exist, create a new store with the product as the first item
      acc.push([product]);
    }

    return acc;
  }, []);
};

module.exports = sortProductsForOrder;
