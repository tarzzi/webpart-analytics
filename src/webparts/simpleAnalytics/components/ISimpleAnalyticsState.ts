import { IAnalyticsStat } from './../models/IAnalyticsStat';
import { IHubSite } from './../models/IHubsite';
import { IDateStrings } from './IDateStrings';

export interface ISimpleAnalyticsState {
  isLoading: boolean;
  hasError: boolean;
  title: string;
  query: string | undefined;
  additionalQuery: string | undefined;
  views: IAnalyticsStat[];
  sortBy: string;
  sortByRecent: boolean;
  sortByLifetime: boolean;
  sortByName: boolean;
  isAscending: boolean;
  hubsites: IHubSite[];
  selectedHubSite: IHubSite | undefined;
  dateStrings: IDateStrings;
}
