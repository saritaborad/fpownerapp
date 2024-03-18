import React, { Component } from 'react';
import sum from 'lodash/sum';
import { documentsService } from 'services/documentsService';
import environment from '../../environments/environment';
import { toSpaceSeparated } from '../../helpers/numberHelper';
import { dateService } from '../../services/dateService';
import { LoaderContext } from '../../components/common/Loader/Loader';
import { statementsService } from '../../services/statementsService';
import './Documents.scss';

export class StatementDetails extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      statement: null,
      propertyId: this.props.match.params.propertyId,
      year: props.match.params.year,
      month: props.match.params.month,
    };

    this.getStatementDetails();
  }

  componentDidUpdate() {
    if (
      this.props.match.params.year !== this.state.year ||
      this.props.match.params.month !== this.state.month ||
      this.props.match.params.propertyId !== this.state.propertyId
    ) {
      this.setState(
        {
          year: this.props.match.params.year,
          month: this.props.match.params.month,
          propertyId: this.props.match.params.propertyId,
        },
        () => {
          this.getStatementDetails();
        }
      );
    }
  }

  getStatementDetails() {
    const { setLoaderVisibility } = this.context;
    if (!this.state.month || !this.state.year) {
      if (this.state.statement) {
        this.setState({
          statement: null,
        });
      }

      return;
    }

    setLoaderVisibility(true);
    statementsService
      .getStatement(this.props.match.params.propertyId, this.state.month, this.state.year)
      .then((statement) => {
        this.setState({
          statement,
        });
        this.props.setBackVisibility(true);
        this.props.setNotificationsVisibility(false);
        this.props.setPageTitle(
          `${this.props.t(
            `common:${dateService.getMonthNameByNumber(this.state.statement.month)}`
          )} ${statement.year}`
        );
        setLoaderVisibility(false);
      })
      .catch(() => {
        setLoaderVisibility(false);
      });
  }

  downloadPdf() {
    documentsService.getStatementFile(
      `${environment.ownerApi}/${this.state.statement.property_pdf}`,
      this.state.statement.property,
      this.state.statement.year,
      this.state.statement.month
    );
  }

  render() {
    const { t } = this.props;
    const { currency } = this.props;

    return this.state.month && this.state.year && this.state.statement ? (
      <div className="selected-statement-container property-overflow">
        <div className="statement-header flex-row">
          <span>{t('totalReservations')}</span>
          {/* <span>{this.state.statement.reservations.length}</span> */}
        </div>
        <div className="round-separator">
          <div className="circle" />
        </div>
        <div className="rows">
          {this.state.statement.reservations.map((reservation) => (
            <div
              key={`${reservation.guest_name}-${reservation.gross_revenue}`}
              className="reservation-row flex-row"
            >
              <span>{reservation.guest_name}</span>
              <span className="price">{toSpaceSeparated(reservation.gross_revenue)}</span>
            </div>
          ))}
        </div>
        <div className="round-separator separator-grayed">
          <div className="circle" />
        </div>
        <div className="statement-header flex-row total-header">
          <span>{t('totalEarnings')}</span>
          <span className="price">
            {`${currency} ${toSpaceSeparated(this.state.statement.gross_revenue)}`}
          </span>
        </div>
        <div className="round-separator separator-grayed">
          <div className="circle" />
        </div>
        <div className="reservation-row flex-row">
          <span>{t('managementFee')}</span>
          <span className="price">{`-${toSpaceSeparated(this.state.statement.mgm_fee)}`}</span>
        </div>
        <div className="reservation-row flex-row">
          <span>{t('statements:deductions')}</span>
          <span className="price">{`-${toSpaceSeparated(this.state.statement.all_expenses)}`}</span>
        </div>
        <div className="reservation-row flex-row">
          <span>{t('statements:additions')}</span>
          <span className="price">
            {toSpaceSeparated(
              sum(this.state.statement.refunds_data.map((x) => parseFloat(x.amount)))
            )}
          </span>
        </div>

        <div className="flex-row summary">
          <span>{t('statements:netAmount')}</span>
          <span className="price">
            {`${currency} ${toSpaceSeparated(this.state.statement.net_amount)}`}
          </span>
        </div>
        <button type="button" onClick={this.downloadPdf.bind(this)} className="btn ">
          {t('download')}
        </button>
      </div>
    ) : null;
  }
}

export default StatementDetails;

StatementDetails.contextType = LoaderContext;
