import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import orderBy from 'lodash/orderBy';
import swal from 'sweetalert';
import { toSpaceSeparated } from '../../helpers/numberHelper';
import { LoaderContext } from '../../components/common/Loader/Loader';
import { getPropertyCurrency } from '../../services/propertyService';
import { statementsService } from '../../services/statementsService';
import { documentsService } from '../../services/documentsService';
import Navigation from '../_PrivateLayout/Navigation';
import { StatementDetails } from './StatementDetails';
import './Documents.scss';
import { dateService } from '../../services/dateService';

export class Documents extends Component {
  constructor(props) {
    super(props);
    this.state = {
      statementsDownloaded: false,
      furnishingDownloaded: false,
      statementsAndFurnishing: [],
      maintenance: [],
      maintenanceDownloaded: false,
      propertyId: props.match.params.propertyId,
      currency: null,
    };
    this.props.setBackVisibility(false);
    this.props.setPageTitle(this.props.t('common:documents'));
  }

  componentDidMount() {
    document.addEventListener('backbutton', this.backClick);
    this.props.setBackVisibility(false);
    this.props.onRef(this);
    this.getPropertyBasicData();
    this.context.setLoaderVisibility(true);
    this.getDataFromApi();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.action !== this.props.match.params.action) {
      this.getDataFromApi();
    }
  }

  componentWillUnmount() {
    document.removeEventListener('backbutton', this.backClick);
    this.props.onRef(undefined);
  }

  onStatementClick(statement) {
    this.props.history.push(
      `/documents/statements/${statement.property_id}/${statement.year}/${statement.month}`
    );
  }

  onStatementPdfClick(statement, event) {
    event.stopPropagation();

    const { month, year, property_nickname: title } = statement;
    documentsService.getMaintenanceInvoice(statement.property_pdf, title, year, month).then(() => {
      this.setDocumentAsRead(year, month);
    });
  }

  onNavClick(action) {
    this.props.history.push(`/documents/${action}/${this.state.propertyId}`);
  }

  onOtherDocumentPdfClick(element, event) {
    event.stopPropagation();
    const year = element.invoice_year || element.statement_year;
    const month = element.invoice_month || element.statement_month;
    documentsService.getMaintenanceInvoice(element.pdf, element.title, year, month).then(() => {
      this.setDocumentAsRead(year, month);
    });
  }

  getDataFromApi() {
    switch (this.props.match.params.action) {
      case 'statements':
        this.getStatementsAndFurnishingInvoices();
        break;
      case 'maintenance':
        this.getMaintenanceInvoicesList();
        break;
      default:
    }
  }

  getStatementsAndFurnishingInvoices() {
    this.context.setLoaderVisibility(true);
    Promise.all([this.getStatementList(), this.getFurnishingInvoicesList()])
      .then(() => {
        this.setState((prevState) => ({
          statementsAndFurnishing: orderBy(
            prevState.statementsAndFurnishing,
            (sof) => [sof.year || sof.statement_year, sof.month || sof.statement_month],
            'desc'
          ),
        }));
        this.context.setLoaderVisibility(false);
      })
      .catch(() => {
        this.context.setLoaderVisibility(false);
      });
  }

  getPropertyBasicData() {
    getPropertyCurrency(this.state.propertyId)
      .then((response) => {
        this.setState({ currency: response.currency });
      })
      .catch(() => {
        swal(this.props.t('properties:propertyNotFoundError')).then(() => {
          window.location.replace('/#/properties');
        });
      });
  }

  getStatementList() {
    if (this.state.statementsDownloaded) {
      return;
    }
    const { setLoaderVisibility } = this.context;
    setLoaderVisibility(true);

    const getStatementListPromise = statementsService.getStatementList(this.state.propertyId);
    getStatementListPromise
      .then((statements) => {
        this.setState((prevState) => ({
          statementsAndFurnishing: [...prevState.statementsAndFurnishing, ...statements],
          statementsDownloaded: true,
        }));
        setLoaderVisibility(false);
      })
      .catch(() => {
        this.setState({
          propertyId: null,
        });
        setLoaderVisibility(false);
      });

    return getStatementListPromise;
  }

  getMaintenanceInvoicesList() {
    if (this.state.maintenanceDownloaded) {
      return;
    }
    const { setLoaderVisibility } = this.context;
    setLoaderVisibility(true);

    const promise = documentsService.getMaintenanceInvoicesList(this.state.propertyId);

    promise
      .then((response) => {
        setLoaderVisibility(false);
        this.setState({
          maintenance: response,
          maintenanceDownloaded: true,
        });
      })
      .catch(() => {
        setLoaderVisibility(false);
      });

    return promise;
  }

  getFurnishingInvoicesList() {
    if (this.state.furnishingDownloaded) {
      return;
    }

    const promise = documentsService.getFurnishingInvoicesList(this.state.propertyId);

    promise.then((response) => {
      this.setState((prevState) => ({
        statementsAndFurnishing: [...prevState.statementsAndFurnishing, ...response],
        furnishingDownloaded: true,
      }));
    });

    return promise;
  }

  setDocumentAsRead(year, month) {
    const { action } = this.props.match.params;
    if (action === 'statements') {
      const statementsAndFurnishing = [...this.state.statementsAndFurnishing];
      const itemIndex = statementsAndFurnishing.findIndex(
        (statement) => statement.year === year && statement.month === month
      );
      if (itemIndex > -1) {
        const newItem = { ...statementsAndFurnishing[itemIndex] };
        newItem.is_read = '1';
        statementsAndFurnishing[itemIndex] = newItem;
        this.setState({ statementsAndFurnishing });
      }
    }
    if (action === 'maintenance') {
      const maintenance = [...this.state.maintenance];
      const itemIndex = maintenance.findIndex(
        (item) => item.invoice_year === year && item.invoice_month === month
      );
      if (itemIndex > -1) {
        const newItem = { ...maintenance[itemIndex] };
        newItem.is_read = '1';
        maintenance[itemIndex] = newItem;
        this.setState({ maintenance });
      }
    }
  }

  backClick = () => {
    if (this.props.match.params.year && this.props.match.params.month) {
      this.props.history.push(`/documents/statements/${this.state.propertyId}`);
      this.props.setPageTitle(this.props.t('common:documents'));
      this.props.setBackVisibility(false);
      this.props.setNotificationsVisibility(true);
      this.setDocumentAsRead(this.props.match.params.year, this.props.match.params.month);
    } else {
      this.props.history.push(`/properties`);
    }
  };

  goBack() {
    this.backClick();
  }

  render() {
    const { currency } = this.state;
    const { action } = this.props.match.params;

    return (
      <div className="container statements-container">
        <ul className="documents-selector">
          <li
            onClick={this.onNavClick.bind(this, 'statements')}
            className={action === 'statements' ? 'active' : ''}
          >
            <div>{this.props.t('common:statements')}</div>
          </li>
          <li
            onClick={this.onNavClick.bind(this, 'maintenance')}
            className={action === 'maintenance' ? 'active' : ''}
          >
            <div>{this.props.t('common:maintenance')}</div>
          </li>
        </ul>
        {this.state.propertyId ? null : <Redirect to="/properties" />}
        <StatementDetails {...this.props} currency={currency} />

        {action === 'statements' && (
          <>
            {this.state.statementsAndFurnishing.map((sof) => {
              const isStatement = sof.furnishing_id === undefined;

              return isStatement ? (
                <div
                  onClick={this.onStatementClick.bind(this, sof)}
                  className={`statement-item${sof.is_read === '1' ? '' : ' unread'}`}
                  key={`${sof.property_id}-${sof.year}-${sof.month_name}`}
                >
                  <div
                    className="statement-pdf-overlay"
                    onClick={this.onStatementPdfClick.bind(this, sof)}
                  />
                  <div className="statement-header">
                    {`${sof.year} ${this.props.t(`common:${sof.month_name.toLowerCase()}`)}`}
                  </div>
                  <div className="statement-income">
                    {`${currency} `}
                    {toSpaceSeparated(sof.net_amount)}
                  </div>

                  <div className="column-arrow statement-pdf-preview">
                    <i className="icon icon-statements" />
                    <i className="icon icon-arrow" />
                  </div>
                </div>
              ) : (
                <div
                  onClick={this.onOtherDocumentPdfClick.bind(this, sof)}
                  className="statement-item"
                  key={`${sof.statement_year}-${sof.statement_month}`}
                >
                  <div className="statement-pdf-overlay other-pdf-overlay" />
                  <div className="statement-header">
                    <span className="uppercase">{this.props.t('common:furnishing')}</span>
                    {`- ${sof.statement_year} `}
                    <span className="capitalize">
                      {this.props.t(
                        `common:${dateService.getMonthNameByNumber(sof.statement_month)}`
                      )}
                    </span>
                  </div>
                  <div className="statement-income">
                    {`${currency} `}
                    {toSpaceSeparated(
                      parseFloat(sof.fp_expenses) +
                        parseFloat(sof.fp_fee) +
                        parseFloat(sof.non_fp_expenses) -
                        parseFloat(sof.total_received)
                    )}
                  </div>

                  <div className="column-arrow statement-pdf-preview">
                    <i className="icon icon-statements" />
                    <i className="icon icon-arrow" />
                  </div>
                </div>
              );
            })}
          </>
        )}

        {action === 'maintenance' &&
          this.state.maintenance.map((other) => (
            <div
              onClick={this.onOtherDocumentPdfClick.bind(this, other)}
              className={`statement-item ${other.is_read === '1' ? '' : ' unread'}`}
              key={other.invoice_number}
            >
              <div className="statement-pdf-overlay other-pdf-overlay" />
              <div className="statement-header">{other.invoice_number || other.title}</div>
              <div className="statement-income">
                {`${currency} `}
                {other.total_expenses !== undefined
                  ? toSpaceSeparated(other.total_expenses)
                  : toSpaceSeparated(
                      parseFloat(other.fp_expenses) +
                        parseFloat(other.fp_fee) +
                        parseFloat(other.non_fp_expenses) -
                        parseFloat(other.total_received)
                    )}
              </div>

              <div className="column-arrow statement-pdf-preview">
                <i className="icon icon-statements" />
                <i className="icon icon-arrow" />
              </div>
            </div>
          ))}
        <Navigation selected="documents" propertyId={this.state.propertyId} />
      </div>
    );
  }
}

export default withTranslation('statements')(Documents);

Documents.contextType = LoaderContext;
