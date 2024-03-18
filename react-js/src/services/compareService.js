export default class CompareService {
  compareString(a, b, isAsc) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  compareDate(a, b, isAsc) {
    return a && b ? (a < b ? -1 : 1) * (isAsc ? 1 : -1) : 0;
  }

  compareNumber(a, b, isAsc) {
    return a != null && b != null ? (a < b ? -1 : 1) * (isAsc ? 1 : -1) : 0;
  }

  compareBoolean(a, b, isAsc) {
    return a === b ? 0 : a && isAsc ? 1 : -1;
  }
}

export const compareService = new CompareService();
