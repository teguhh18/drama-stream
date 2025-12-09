const BASE_URL = "/api";

export const getLatestDramas = async () => {
  const response = await fetch(`${BASE_URL}/dramabox/latest`);
  return await response.json();
};

export const getTrendingDramas = async () => {
  const response = await fetch(`${BASE_URL}/dramabox/trending`);
  return await response.json();
};

export const searchDramas = async (query) => {
  const response = await fetch(
    `${BASE_URL}/dramabox/search?query=${encodeURIComponent(query)}`
  );
  return await response.json();
};

export const getStreamLink = async (bookId, episode) => {
  const response = await fetch(
    `${BASE_URL}/dramabox/stream?bookId=${bookId}&episode=${episode}`
  );
  return await response.json();
};
