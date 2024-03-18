const getPageList = (pages, page, maxLength) => {
  const totalPages = pages.length;
  if (maxLength < 5) return pages;

  const range = (start, end) => {
    return Array.from(Array(end - start + 1), (_, i) => i + start);
  };

  var sideWidth = maxLength < 9 ? 1 : 2;
  var leftWidth = (maxLength - sideWidth * 2 - 3) >> 1;
  var rightWidth = (maxLength - sideWidth * 2 - 2) >> 1;
  if (totalPages <= maxLength) {
    return range(1, totalPages);
  }
  if (page <= maxLength - sideWidth - 1 - rightWidth) {
    // return range(1, maxLength - sideWidth - 1).concat(
    //   0,
    //   range(totalPages - sideWidth + 1, totalPages)
    // );

    return pages.map(({ step }) => ({
      step,
      visible: step <= maxLength - sideWidth - 1 || step >= totalPages - sideWidth + 1,
    }));
  }
  if (page >= totalPages - sideWidth - 1 - rightWidth) {
    return pages.map(({ step }) => ({
      step,
      visible: step <= sideWidth || step >= totalPages - sideWidth - 1 - rightWidth - leftWidth,
    }));
  }

  return pages.map(({ step }) => ({
    step,
    visible:
      step <= sideWidth ||
      (step >= page - leftWidth && step <= page + rightWidth) ||
      step >= totalPages - sideWidth + 1,
  }));
};

export default getPageList;
