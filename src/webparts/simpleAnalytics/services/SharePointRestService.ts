import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { IHubSite } from './../models/IHubsite';

export class SharePointRestService {
  private context: WebPartContext;

  constructor(context: WebPartContext) {
    this.context = context;
  }

  public async getHubSites(): Promise<IHubSite[]> {
    const ctx = this.context;
    const siteUrl = ctx.pageContext.web.absoluteUrl;
    try {
      const response: SPHttpClientResponse = await ctx.spHttpClient.get(
        `${siteUrl}/_api/hubsites`,
        SPHttpClient.configurations.v1
      );
      const data: any = await response.json();
      return data.value;
    } catch (error) {
      console.error('Error at hubsites', error);
      return [];
    }
  }

  public async getSiteAnalytics(
    selectedHubSite: any,
    addQuery: string | undefined
  ): Promise<any> {
    // query the SharePoint REST API to get the site analytics
    // use /_api/search/query?querytext=%27Path:https://[path_to_your_intranet_site]*%20(contentclass=STS_Site%20OR%20contentclass=STS_Web)%27&selectproperties=%27Title,ViewsLast1Days,ViewsLast2Days,ViewsLast3Days,ViewsLast4Days,ViewsLast5Days,ViewsLast6Days,ViewsLast7Days,ViewsRecent,ViewsLastMonths1,ViewsLastMonths2,ViewsLastMonths3,ViewsLifetime,Path%27&orderBy=ViewsRecent&trimDuplicates=false&rowlimit=500
    // to get the analytics data for all the sites in the hub
    console.log("Searching for analytics, with hub site", selectedHubSite.url)
    const ctx = this.context;
    const siteUrl = selectedHubSite ? selectedHubSite.url : '';
    const selectProperties =
      'Title,ViewsLast1Days,ViewsLast2Days,ViewsLast3Days,ViewsLast4Days,ViewsLast5Days,ViewsLast6Days,ViewsLast7Days,ViewsRecent,ViewsLastMonths1,ViewsLastMonths2,ViewsLastMonths3,ViewsLifetime,Path';
    const rowLimit = 500;
    // const additionalQuery = "%20(contentclass=STS_Site%20OR%20contentclass=STS_Web)"
    const additionalQuery =
      '%20(contentclass=STS_Site%20OR%20contentclass=STS_ListItem_WebPageLibrary)';
    const orderBy = 'ViewsRecent';
    const useAddtionalQuery = true;
    try {
      const url: string = `${
        ctx.pageContext.web.absoluteUrl
      }/_api/search/query?querytext=%27Path:${siteUrl}*${
        useAddtionalQuery ? additionalQuery : ''
      }%27&selectproperties=%27${selectProperties}%27&orderBy=${orderBy}&trimDuplicates=false&rowlimit=${rowLimit}`;
      const response: SPHttpClientResponse = await ctx.spHttpClient.get(
        url,
        SPHttpClient.configurations.v1
      );
      const data: any = await response.json();
      console.log('Recieved analytics', data);
      return data;
    } catch (error) {
      console.error('Fail at analytics query', error);
      return [];
    }
  }
}
