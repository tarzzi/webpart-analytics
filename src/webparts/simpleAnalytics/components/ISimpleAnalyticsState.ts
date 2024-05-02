import { IAnalyticsStat } from "./../models/IAnalyticsStat";
import { IHubSite } from  "./../models/IHubsite"


export interface ISimpleAnalyticsState {
    title: string;
    query: string | undefined;
    additionalQuery: string | undefined;
    views: IAnalyticsStat[];
    expandedIndex: number;
    sortBy: string;
    sortByRecent: boolean;
    sortByLifetime: boolean;
    sortByName: boolean;
    isAscending: boolean;
    hubsites: IHubSite[];
    selectedHubSite: IHubSite | undefined;
  }