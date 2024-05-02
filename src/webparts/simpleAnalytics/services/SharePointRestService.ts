import { WebPartContext } from "@microsoft/sp-webpart-base";
import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";
import { IHubSite } from "./../models/IHubsite"
import { AnalyticsHelper } from "../helpers/AnalyticsHelpers";
import { IAnalyticsStat } from "../models/IAnalyticsStat";

export class SharePointRestService {
    private context: WebPartContext;

    constructor(context: WebPartContext) {
        this.context = context;
        
    }
    
    public async getHubSites(): Promise<IHubSite[]> {
        const ctx = this.context;
        const siteUrl = ctx.pageContext.web.absoluteUrl;
        try {
          const response: SPHttpClientResponse = await ctx.spHttpClient.get(`${siteUrl}/_api/hubsites`, SPHttpClient.configurations.v1);
          const data: any = await response.json();
          console.log("Received hub sites", data);
          const hubsites: IHubSite[] = [];
          data.value.forEach((hub: any) => {
            hubsites.push({
              title: hub.Title,
              url: hub.SiteUrl,
              id: hub.ID
            });
          });
          return hubsites;
        } catch (error) {
          console.error("Error at hubsites", error);
          return [];
        }
    }

    
public async getSiteAnalytics(selectedHubSite: any): Promise<IAnalyticsStat[]> {

    // query the SharePoint REST API to get the site analytics
    // use /_api/search/query?querytext=%27Path:https://[path_to_your_intranet_site]*%20(contentclass=STS_Site%20OR%20contentclass=STS_Web)%27&selectproperties=%27Title,ViewsLast1Days,ViewsLast2Days,ViewsLast3Days,ViewsLast4Days,ViewsLast5Days,ViewsLast6Days,ViewsLast7Days,ViewsRecent,ViewsLastMonths1,ViewsLastMonths2,ViewsLastMonths3,ViewsLifetime,Path%27&orderBy=ViewsRecent&trimDuplicates=false&rowlimit=500
    // to get the analytics data for all the sites in the hub

    const ctx = this.context;
    const siteUrl = selectedHubSite ? selectedHubSite.url : "";
    const selectProperties = "Title,ViewsLast1Days,ViewsLast2Days,ViewsLast3Days,ViewsLast4Days,ViewsLast5Days,ViewsLast6Days,ViewsLast7Days,ViewsRecent,ViewsLastMonths1,ViewsLastMonths2,ViewsLastMonths3,ViewsLifetime,Path"
    const rowLimit = 500;
    // const additionalQuery = "%20(contentclass=STS_Site%20OR%20contentclass=STS_Web)"
    const additionalQuery = "%20(contentclass=STS_Site%20OR%20contentclass=STS_ListItem_WebPageLibrary)"
    const orderBy = "ViewsRecent";
    const useAddtionalQuery = true;
    try {
        const url: string = `${ctx.pageContext.web.absoluteUrl}/_api/search/query?querytext=%27Path:${siteUrl}*${useAddtionalQuery ? additionalQuery : ""}%27&selectproperties=%27${selectProperties}%27&orderBy=${orderBy}&trimDuplicates=false&rowlimit=${rowLimit}`;
        const response: SPHttpClientResponse = await ctx.spHttpClient.get(url, SPHttpClient.configurations.v1);
        const data: any = await response.json();
        console.log("Recieved analytics", data);
        const views: IAnalyticsStat[] = [];
        data.PrimaryQueryResult.RelevantResults.Table.Rows.forEach((row: any) => {
            const stat = {
                title: AnalyticsHelper.getTextCellValue(row, "Title"),
                path: AnalyticsHelper.getTextCellValue(row, "Path"),
                viewsLifetime: AnalyticsHelper.getCellValue(row, "ViewsLifetime"),
                viewsRecent: AnalyticsHelper.getCellValue(row, "ViewsRecent"),
                contentclass: AnalyticsHelper.getTextCellValue(row, "contentclass"),
                viewsLast1Days: AnalyticsHelper.getCellValue(row, "ViewsLast1Days"),
                viewsLast2Days: AnalyticsHelper.getCellValue(row, "ViewsLast2Days"),
                viewsLast3Days: AnalyticsHelper.getCellValue(row, "ViewsLast3Days"),
                viewsLast4Days: AnalyticsHelper.getCellValue(row, "ViewsLast4Days"),
                viewsLast5Days: AnalyticsHelper.getCellValue(row, "ViewsLast5Days"),
                viewsLast6Days: AnalyticsHelper.getCellValue(row, "ViewsLast6Days"),
                viewsLast7Days: AnalyticsHelper.getCellValue(row, "ViewsLast7Days"),
                viewsLastMonths1: AnalyticsHelper.getCellValue(row, "ViewsLastMonths1"),
                viewsLastMonths2: AnalyticsHelper.getCellValue(row, "ViewsLastMonths2"),
                viewsLastMonths3: AnalyticsHelper.getCellValue(row, "ViewsLastMonths3")
            };
            if (stat.viewsRecent > 0 && stat.viewsLifetime > 0) {
                views.push(stat);
            }
        });
        return views;
    } catch (error) {
        console.error("Fail at analytics query", error);
        return [];
    }

}

}