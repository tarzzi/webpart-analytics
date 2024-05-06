import { IDateStrings } from '../components/IDateStrings';

export class AnalyticsHelper {

    private localization: string;

    constructor(localization: string) {
        this.localization = localization;
    }
  /**
   * Get cell value from selected row
   * @param row
   * @param key
   * @returns {number} Selected cell value as number
   */
  public static getCellValue(row: any, key: string): number {
    const cell = row.Cells.filter((c: any) => c.Key === key);
    return cell.length > 0 ? cell[0].Value : 0;
  }

  /**
   * Get cell value from selected row
   * @param row
   * @param key
   * @returns {string} Selected cell value as string
   */
  public static getTextCellValue(row: any, key: string): string {
    const cell = row.Cells.filter((c: any) => c.Key === key);
    return cell.length > 0 ? cell[0].Value : '';
  }

  /**
   * Generate date strings for the last 7 days and last 3 months
   * @returns {IDateStrings} Object with date strings
   */
  public generateDateStrings(): IDateStrings {
    const loc = this.localization ? this.localization : 'en-US';
    const today = new Date();
    const last1Day = today.toLocaleDateString(loc, { weekday: 'short' });

    const last2Days = new Date(today);
    last2Days.setDate(today.getDate() - 1);
    const last2Day = last2Days.toLocaleDateString(loc, { weekday: 'short' });

    const last3Days = new Date(today);
    last3Days.setDate(today.getDate() - 2);
    const last3Day = last3Days.toLocaleDateString(loc, { weekday: 'short' });

    const last4Days = new Date(today);
    last4Days.setDate(today.getDate() - 3);
    const last4Day = last4Days.toLocaleDateString(loc);

    const last5Days = new Date(today);
    last5Days.setDate(today.getDate() - 4);
    const last5Day = last5Days.toLocaleDateString(loc);

    const last6Days = new Date(today);
    last6Days.setDate(today.getDate() - 5);
    const last6Day = last6Days.toLocaleDateString(loc);

    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 6);
    const last7Day = last7Days.toLocaleDateString(loc);

    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth());

    const last2Months = new Date(today);
    last2Months.setMonth(today.getMonth() - 1);

    const last3Months = new Date(today);
    last3Months.setMonth(today.getMonth() - 2);

    const lastMonth1 = lastMonth.toLocaleString(loc, { month: 'long' });
    const lastMonth2 = last2Months.toLocaleString(loc, { month: 'long' });
    const lastMonth3 = last3Months.toLocaleString(loc, { month: 'long' });

    return {
      last1Day: last1Day,
      last2Day: last2Day,
      last3Day: last3Day,
      last4Day: last4Day,
      last5Day: last5Day,
      last6Day: last6Day,
      last7Day: last7Day,
      lastMonth1: lastMonth1,
      lastMonth2: lastMonth2,
      lastMonth3: lastMonth3,
    };
  }
}
