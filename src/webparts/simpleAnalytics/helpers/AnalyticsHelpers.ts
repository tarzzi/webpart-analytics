export class AnalyticsHelper {

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

}