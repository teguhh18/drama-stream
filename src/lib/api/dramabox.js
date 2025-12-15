const BASE_URL = "/api";

const convertToWebp = (url) => {
  if (!url) return "";
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&output=webp`;
};

const mapBook = (book) => ({
  bookId: book.book_id,
  bookName: book.book_name,
  coverWap: convertToWebp(book.thumb_url),
  thumb_url: book.thumb_url,
  author: book.author,
  chapterCount: book.serial_count,
  intro: book.abstract,
});

export const getLatestDramas = async () => {
  const response = await fetch(`${BASE_URL}/melolo/latest`);
  const data = await response.json();
  return data.books ? data.books.map(mapBook) : [];
};

export const getTrendingDramas = async () => {
  const response = await fetch(`${BASE_URL}/melolo/trending`);
  const data = await response.json();
  return data.books ? data.books.map(mapBook) : [];
};

export const searchDramas = async (query, limit = 10, offset = 0) => {
  const response = await fetch(
    `${BASE_URL}/melolo/search?query=${encodeURIComponent(
      query
    )}&limit=${limit}&offset=${offset}`
  );
  const res = await response.json();
  if (res.data && Array.isArray(res.data.search_data)) {
    return res.data.search_data
      .flatMap((item) => item.books || [])
      .map(mapBook);
  }
  return [];
};

export const getDramaDetail = async (bookId) => {
  const response = await fetch(`${BASE_URL}/melolo/detail/${bookId}`);
  return await response.json();
};

export const getStreamLink = async (vid) => {
  const response = await fetch(`${BASE_URL}/melolo/stream/${vid}`);
  return await response.json();
};
