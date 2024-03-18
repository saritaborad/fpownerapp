import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import SimpleReactValidator from 'simple-react-validator';
import { authService } from '../../../services/authService';
import { LoaderContext } from '../../../components/common/Loader/Loader';
import './ResetPassword.scss';

class ResetPassword extends Component {
  constructor(props) {
    super(props);
    this.initializeValidator();
    this.state = {
      email: '',
      errorMessage: '',
      success: false,
    };
  }

  componentDidMount() {
    document.addEventListener('backbutton', this.backClick);
  }

  componentWillUnmount() {
    document.removeEventListener('backbutton', this.backClick);
  }

  onLoginClick() {
    this.props.history.push(`/login`);
  }

  onChangeHandler = (event) => {
    this.setState({
      [event.target.name]: event.target.value?.trim(),
    });
    this.setState({ errorMessage: '' });
  };

  backClick = () => {
    this.props.history.push(`/login`);
  };

  resetPasswordClick = (event) => {
    event.preventDefault();
    this.validator.hideMessages();
    this.forceUpdate();
    this.validateAndResetPassword();
  };

  showMessagesAndUpdate() {
    this.validator.showMessages();
    this.forceUpdate();
  }

  validateAndResetPassword() {
    if (this.validator.allValid()) {
      const { setLoaderVisibility } = this.context;
      setLoaderVisibility(true);
      authService
        .resetPassword(this.state.email)
        .then((response) => {
          if (!response.error) {
            this.setState({ success: true });
            setTimeout(() => {
              this.props.history.push(`/login`);
            }, 3000);
          } else {
            this.resetPasswordErrorCallback(this.props.t('common:anErrorOccured'));
          }
          setLoaderVisibility(false);
        })
        .catch(() => {
          this.resetPasswordErrorCallback(this.props.t('common:anErrorOccured'));
          setLoaderVisibility(false);
        });
    } else {
      this.showMessagesAndUpdate();
    }
  }

  resetPasswordErrorCallback(error) {
    if (!error) {
      return;
    }
    this.setState({ errorMessage: error }, () => {
      this.showMessagesAndUpdate();
    });
  }

  initializeValidator() {
    this.validator = new SimpleReactValidator({
      className: 'invalid-field',
    });
  }

  render() {
    const { t } = this.props;

    return (
      <div className="reset-password-content">
        <p className="public-header">{t('resetPasswordHeader')}</p>
        <p className="reset-password-desc">{t('resetPasswordDesc')}</p>
        <form className="" noValidate>
          <div className="input-group">
            <input
              type="text"
              className="form-control form-control-lg"
              name="email"
              onChange={this.onChangeHandler}
              value={this.state.email}
              placeholder={t('email')}
            />
            {this.validator.message('email', this.state.email, 'required|email', {
              messages: {
                email: t('common:validationInvalidEmail'),
                required: t('common:validationRequired', {
                  field: t('email'),
                }),
              },
            })}
            {this.state.errorMessage.length ? (
              <div className="invalid-field">{this.state.errorMessage}</div>
            ) : null}
          </div>

          <button type="submit" onClick={this.resetPasswordClick} className="btn submit-button">
            {t('resetPassword')}
          </button>
        </form>

        <div className="round-separator">
          <div className="circle" />
        </div>
        <span className="switch-option" onClick={this.onLoginClick.bind(this)}>
          {t('login')}
        </span>

        {this.state.success ? (
          <div className="alert alert-success" role="alert">
            {t('resetPasswordSuccess')}
          </div>
        ) : null}
      </div>
    );
  }
}

export default withTranslation('user')(ResetPassword);

ResetPassword.contextType = LoaderContext;
