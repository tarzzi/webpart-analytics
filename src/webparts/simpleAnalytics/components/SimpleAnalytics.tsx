import * as React from 'react';
import styles from './SimpleAnalytics.module.scss';
import type { ISimpleAnalyticsProps } from './ISimpleAnalyticsProps';
import { DefaultButton, Dropdown, IDropdownOption, Stack, TextField } from '@fluentui/react';
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

    this.state = {
      title: '',
      query: '',
      additionalQuery: '',
      views: [],
      expandedIndex: -1,
      sortBy: 'Name',
      sortByName: false,
      sortByRecent: false,
      sortByLifetime: false,
      isAscending: false,
      hubsites: [],
      selectedHubSite: undefined
    };

    this._getSiteAnalytics = this._getSiteAnalytics.bind(this);
    this._sortViewsByRecent = this._sortViewsByRecent.bind(this);
    this._sortViewsByLifetime = this._sortViewsByLifetime.bind(this);
    this._sortByName = this._sortByName.bind(this);

  }

  public componentDidMount(): void {
    this._getHubSites();
  }

  private _getHubSites(): void {
    this.SPRestService.getHubSites().then((data: any) => {
      console.log('Received hub sites', data);
      const hubsites: IHubSite[] = [];
      data.value.forEach((hub: any) => {
        hubsites.push({
          title: hub.Title,
          url: hub.SiteUrl,
          id: hub.ID,
        });
      });
      this.setState({ hubsites: hubsites, selectedHubSite: hubsites.length > 0 ? hubsites[0] : undefined });
      this._getSiteAnalytics();
    }).catch((error: any) => {
      console.error("Error at hubsites", error);
    });
  }



  private _getSiteAnalytics(): void {
    const { selectedHubSite, additionalQuery } = this.state;
    this.SPRestService.getSiteAnalytics(selectedHubSite, additionalQuery).then((data: any) => {
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
      this.setState({ views: views });
    }).catch((error: any) => {
      console.error("Error at views", error);
    });

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
    this.setState({ selectedHubSite: selectedHubSite });
    this._getSiteAnalytics();
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
    const { sortByLifetime, sortByRecent, sortByName, hubsites, selectedHubSite, sortBy, expandedIndex, additionalQuery, isAscending, views } = this.state;
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
          <Stack horizontal tokens={{ childrenGap: 10 }}>
            <span>Statistics about: </span>
            <Dropdown options={hubSiteOptions}
              className={styles.dropdown}
              defaultSelectedKey={hubsites.length > 0 ? hubsites[0].url : undefined}
              selectedKey={selectedHubSite ? selectedHubSite.url : undefined}
              onChange={this._selectHubSite} />
            <span> with additional query of: </span>
            <TextField value={additionalQuery} onChange={(ev, newValue) => this.setState({ additionalQuery: newValue })} />
          </Stack>
          <Stack horizontal tokens={{ childrenGap: 10 }}>
            <span>Sorted by </span>
            <Dropdown defaultSelectedKey={sortOptions[0].key} selectedKey={sortBy} options={sortOptions} className={styles.dropdown} onChange={(ev, item) => {
              if (!item) return;
              switch (item.key) {
                case 'Name':

                  this._sortByName();
                  break;
                case 'Recent':
                  this._sortViewsByRecent();
                  break;
                case 'Lifetime':
                  this._sortViewsByLifetime();
                  break;
              }
            }} />
            <DefaultButton text={isAscending ? "Desc ↓" : "Asc ↑"} onClick={this._toggleSortOrder} />
          </Stack>
        </Stack>
        <div>
          <div style={{ display: 'grid' }}>
            {views.map((view, index) => {
              return (
                <div key={index} style={{ display: 'flex', flexDirection: 'column' }}>
                  <h4 className={styles.siteheader}>{view.title}</h4>
                  <span>Path: {view.path}</span>
                  <span className={sortByRecent ? styles.bold : ''}>Recent views: {view.viewsRecent}</span>
                  <span className={sortByLifetime ? styles.bold : ''}>Lifetime views: {view.viewsLifetime}</span>
                  <DefaultButton text={expandedIndex !== index ? 'Expand' : 'Close'} style={{ maxWidth: "100px" }} onClick={() => {
                    if (expandedIndex === index) {
                      this.setState({ expandedIndex: -1 });
                      return;
                    }
                    this.setState({ expandedIndex: index })
                  }
                  }>Expand</DefaultButton>
                  {this.state.expandedIndex === index && (<>

                    <span className={sortByName ? styles.bold : ''}>Content Class: {view.contentclass}</span>
                    <table>
                      <thead>
                        <tr>
                          <th>Days</th>
                          <th>Views</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Last 1 Day</td>
                          <td>{view.viewsLast1Days}</td>
                        </tr>
                        <tr>
                          <td>Last 2 Days</td>
                          <td>{view.viewsLast2Days}</td>
                        </tr>
                        <tr>
                          <td>Last 3 Days</td>
                          <td>{view.viewsLast3Days}</td>
                        </tr>
                        <tr>
                          <td>Last 4 Days</td>
                          <td>{view.viewsLast4Days}</td>
                        </tr>
                        <tr>
                          <td>Last 5 Days</td>
                          <td>{view.viewsLast5Days}</td>
                        </tr>
                        <tr>
                          <td>Last 6 Days</td>
                          <td>{view.viewsLast6Days}</td>
                        </tr>
                        <tr>
                          <td>Last 7 Days</td>
                          <td>{view.viewsLast7Days}</td>
                        </tr>
                        <tr>
                          <td>Last Month</td>
                          <td>{view.viewsLastMonths1}</td>
                        </tr>
                        <tr>
                          <td>Last 2 Months</td>
                          <td>{view.viewsLastMonths2}</td>
                        </tr>
                        <tr>
                          <td>Last 3 Months</td>
                          <td>{view.viewsLastMonths3}</td>
                        </tr>
                      </tbody>
                    </table>
                  </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }
}
