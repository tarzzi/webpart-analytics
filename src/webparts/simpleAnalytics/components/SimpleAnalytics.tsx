import * as React from 'react';
import styles from './SimpleAnalytics.module.scss';
import type { ISimpleAnalyticsProps } from './ISimpleAnalyticsProps';
import { DefaultButton, Dropdown, IDropdownOption, Stack } from '@fluentui/react';
import { ISimpleAnalyticsState } from './ISimpleAnalyticsState';
import { IAnalyticsStat } from '../models/IAnalyticsStat';
import { IHubSite } from '../models/IHubsite';
import { SharePointRestService } from '../services/SharePointRestService';
import { FormEvent } from 'react';
import { AnalyticsHelper } from '../helpers/AnalyticsHelpers';



export default class SimpleAnalytics extends React.Component<ISimpleAnalyticsProps, ISimpleAnalyticsState> {

  private SPRestService: SharePointRestService;

  constructor(props: ISimpleAnalyticsProps) {
    super(props);

    this.SPRestService = new SharePointRestService(props.context);
    const dateStrings = new AnalyticsHelper(props.localization).generateDateStrings();

    this.state = {
      isLoading: false,
      hasError: false,
      title: '',
      query: '',
      additionalQuery: '',
      views: [],
      sortBy: 'Name',
      sortByName: false,
      sortByRecent: false,
      sortByLifetime: false,
      isAscending: false,
      hubsites: [],
      selectedHubSite: undefined,
      dateStrings: dateStrings
    };

    this._getSiteAnalytics = this._getSiteAnalytics.bind(this);
    this._sortViewsByRecent = this._sortViewsByRecent.bind(this);
    this._sortViewsByLifetime = this._sortViewsByLifetime.bind(this);
    this._sortByName = this._sortByName.bind(this);

  }

  public componentDidMount(): void {
    this.setState({ isLoading: true });
    this._getHubSites();
  }

  private _getHubSites(): void {
    this.SPRestService.getHubSites().then((data: any) => {
      console.log('Received hub sites', data);
      const hubsites: IHubSite[] = [];
      data.forEach((hub: any) => {
        hubsites.push({
          title: hub.Title,
          url: hub.SiteUrl,
          id: hub.ID,
        });
      });
      this.setState({ hubsites: hubsites, selectedHubSite: hubsites.length > 0 ? hubsites[0] : undefined });
      this._getSiteAnalytics().catch((error: any) => {
        this.setState({ isLoading: false, hasError: true });
        console.error('Error at fetching data', error);
      });
    }).catch((error: any) => {
      console.error("Error at hubsites", error);
    });
  }



  private async _getSiteAnalytics(dropdownSelect?: any): Promise<void> {
    console.log("Getting analytics");
    const { selectedHubSite, additionalQuery } = this.state;

    if (!selectedHubSite) {
      console.error('No hub site selected');
      return;
    }

    const hub = dropdownSelect ? dropdownSelect : selectedHubSite;

    const stats = await this.SPRestService.getSiteAnalytics(hub, additionalQuery).then((data: any) => {
      return data;
    }).catch((error: any) => {
      console.error("Error at views", error);
    });

    console.log("SimpleaAnalytics.tsx got analytics", stats)
    const views: IAnalyticsStat[] = [];
    this.setState({ isLoading: false });
    stats.PrimaryQueryResult.RelevantResults.Table.Rows.forEach((row: any) => {
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
      views.push(stat);
      // Should make a option to show 0 views?
      /* if (stat.viewsRecent > 0 && stat.viewsLifetime > 0) {
        views.push(stat);
      } else {
        console.log("Skipping", stat);
      } */
    });
    const newViews = [...views];
    this.setState({ views: newViews });
    console.log("Finished getting analytics", views);
    console.log("State is", this.state.views)

  }


  private _sortViewsByRecent(): void {
    const asc = this.state.isAscending;
    if (asc) {
      this.setState({
        views: this.state.views.sort((a, b) => {
          return a.viewsRecent - b.viewsRecent;
        }),
        sortByLifetime: false,
        sortByRecent: true,
        sortByName: false
      });
    } else {
      this.setState({
        views: this.state.views.sort((a, b) => {
          return b.viewsRecent - a.viewsRecent;
        }),
        sortByLifetime: false,
        sortByRecent: true,
        sortByName: false
      });
    }
  }

  private _sortViewsByLifetime(): void {
    const asc = this.state.isAscending;
    const views = this.state.views;

    if (asc) {
      this.setState({
        views: views.sort((a, b) => {
          return a.viewsLifetime - b.viewsLifetime;
        }),
        sortByLifetime: true,
        sortByRecent: false,
        sortByName: false
      });
    } else {
      this.setState({
        views: views.sort((a, b) => {
          return b.viewsLifetime - a.viewsLifetime;
        }),
        sortByLifetime: true,
        sortByRecent: false,
        sortByName: false
      });
    }
  }

  private _sortByName(): void {
    const asc = this.state.isAscending;
    const views = this.state.views;
    if (asc) {
      this.setState({
        views: views.sort((a, b) => {
          return a.title.localeCompare(b.title);
        }),
        sortByLifetime: false,
        sortByRecent: false,
        sortByName: true
      });
    } else {
      this.setState({
        views: views.sort((a, b) => {
          return b.title.localeCompare(a.title);
        }),
        sortByLifetime: false,
        sortByRecent: false,
        sortByName: true
      });
    }
  }

  private _selectHubSite = (event: FormEvent<HTMLDivElement>, option: IDropdownOption, index: number): void => {
    const selectedHubSite = this.state.hubsites.find((hub: IHubSite) => hub.url === option.key);
    this.setState({ selectedHubSite: selectedHubSite, isLoading: true }, () => {
      this._getSiteAnalytics().catch((error: any) => {
        this.setState({ isLoading: false, hasError: true });
        console.error('Error at fetching data', error);
      });
    });
  }

  private _toggleSortOrder = (): void => {
    const { sortByLifetime, sortByRecent, sortByName, isAscending } = this.state;

    this.setState({ isAscending: !isAscending });
    if (sortByLifetime) {
      this._sortViewsByLifetime();
    } else if (sortByRecent) {
      this._sortViewsByRecent();
    } else if (sortByName) {
      this._sortByName();
    }
  }

  public render(): React.ReactElement<ISimpleAnalyticsProps> {
    const { isLoading, dateStrings, sortByLifetime, sortByRecent, hubsites, selectedHubSite, sortBy, isAscending, views } = this.state;
    const hubSiteOptions = hubsites.map((hub: any) => {
      return {
        key: hub.url,
        text: hub.title
      };
    });
    const sortOptions = [
      { key: 'Name', text: 'Name' },
      { key: 'Recent', text: 'Recent Views' },
      { key: 'Lifetime', text: 'Lifetime Views' },
    ];

    return (
      <section className={`${styles.simpleAnalytics}`}>
        <h2>Simple Analytics</h2>
        <Stack tokens={{ childrenGap: 10 }}>
          <Stack horizontal tokens={{ childrenGap: 10 }} className={styles.flexAlign}>
            <span>Statistics about: </span>
            <Dropdown options={hubSiteOptions}
              className={styles.dropdown}
              defaultSelectedKey={hubsites.length > 0 ? hubsites[0].url : undefined}
              selectedKey={selectedHubSite ? selectedHubSite.url : undefined}
              onChange={this._selectHubSite} />
            <span>Sorted by </span>
            <Dropdown defaultSelectedKey={sortOptions[0].key} selectedKey={sortBy} options={sortOptions} className={styles.dropdown} onChange={(ev, item) => {
              if (!item) return;
              switch (item.key) {
                case 'Name':
                  this._sortByName();
                  this.setState({ sortBy: 'Name' });
                  break;
                case 'Recent':
                  this._sortViewsByRecent();
                  this.setState({ sortBy: 'Recent' });
                  break;
                case 'Lifetime':
                  this._sortViewsByLifetime();
                  this.setState({ sortBy: 'Lifetime' });

                  break;
              }
            }} />
            <DefaultButton text={isAscending ? "Desc ↓" : "Asc ↑"} onClick={this._toggleSortOrder} />
            {isLoading && <span>Loading...</span>}
            {!isLoading && <span>Found {views.length} results</span>}
          </Stack>
        </Stack>
        <div style={{marginTop:'15px'}}>
          <div style={{ display: 'grid' }}>
            {views.map((view, index) => {
              return (
                <Stack key={index} className={styles.siteRow} horizontal tokens={{ childrenGap: 20 }} >
                  <div key={index} className={styles.siteInfo}>
                    <h4 className={styles.siteheader}><a href={view.path} target="_blank" rel="noopener noreferrer">{view.title}</a> </h4>
                    <span style={{ fontStyle: 'italic', fontSize: '10px' }}>Url: {view.path.split('sites')[1]}</span>
                    <span className={sortByRecent ? styles.bold : ''}>Recent views: {view.viewsRecent}</span>
                    <span>Three months: {Number(view.viewsLastMonths1) + Number(view.viewsLastMonths2) + Number(view.viewsLastMonths3)} </span>
                    <span style={{ marginBottom: '10px' }} className={sortByLifetime ? styles.bold : ''}>Lifetime views: {view.viewsLifetime}</span>
                  </div>
                  <div style={{overflowX: 'scroll'}}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          {Object.values(dateStrings).map((key) => (
                            <th key={key}>{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{view.viewsLast1Days}</td>
                          <td>{view.viewsLast2Days}</td>
                          <td>{view.viewsLast3Days}</td>
                          <td>{view.viewsLast4Days}</td>
                          <td>{view.viewsLast5Days}</td>
                          <td>{view.viewsLast6Days}</td>
                          <td>{view.viewsLast7Days}</td>
                          <td>{view.viewsLastMonths1}</td>
                          <td>{view.viewsLastMonths2}</td>
                          <td>{view.viewsLastMonths3}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Stack>
              );
            })}
          </div>
        </div>
      </section>
    );
  }
}
