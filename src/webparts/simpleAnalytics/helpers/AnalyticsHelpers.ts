export class AnalyticsHelper {

    public static getCellValue(row: any, key: string): number {
        const cell = row.Cells.filter((c: any) => c.Key === key);
        return cell.length > 0 ? cell[0].Value : 0;
    }

    public static getTextCellValue(row: any, key: string): string {
        const cell = row.Cells.filter((c: any) => c.Key === key);
        return cell.length > 0 ? cell[0].Value : '';
    }

}