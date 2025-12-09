export const processDramas = (data) => {
  if (!Array.isArray(data)) return [];
  const books = [];
  data.forEach((item) => {
    if (item.tagCardVo && Array.isArray(item.tagCardVo.tagBooks)) {
      books.push(...item.tagCardVo.tagBooks);
    } else if (item.bookId) {
      books.push(item);
    }
  });
  return books;
};
