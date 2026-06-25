// Turns a shop name into a clean, URL-safe slug.
// "Sarah's Bakery" -> "sarahs-bakery"
const generateSlug = (shopName) => {
  return shopName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // remove special characters like apostrophes
    .trim()
    .replace(/\s+/g, '-'); // replace spaces with hyphens
};

module.exports = generateSlug;