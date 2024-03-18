export default class DateService {
  monthTranslationsNames = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ];

  getMonthNameByNumber(number) {
    return number > 0 && number <= 12 ? this.monthTranslationsNames[number - 1] : null;
  }
}

export const dateService = new DateService();
