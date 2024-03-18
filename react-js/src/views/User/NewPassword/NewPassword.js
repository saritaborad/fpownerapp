import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import SimpleReactValidator from 'simple-react-validator';
import { PASSWORD_REGEX } from 'helpers/passwordHelper';
import { authService } from '../../../services/authService';
import { LoaderContext } from '../../../components/common/Loader/Loader';
import './NewPassword.scss';

class NewPassword extends Component {
  constructor(props) {
    super(props);
    this.initializeValidator();
    this.state = {
      newPassword: '',
      confirmNewPassword: '',
      errorMessage: '',
      success: false,
      token: props.match.params.token,
    };
  }

  componentDidMount() {
    document.addEventListener('backbutton', this.backClick);
  }

  componentWillUnmount() {
    document.removeEventListener('backbutton', this.backClick);
  }

  onChangeHandler = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
    this.setState({ errorMessage: '' });
  };

  onLoginClick() {
    this.props.history.push(`/login`);
  }

  backClick = () => {
    this.props.history.push(`/login`);
  };

  setNewPasswordClick = (event) => {
    event.preventDefault();
    this.validator.hideMessages();
    this.forceUpdate();

    if (this.validator.allValid()) {
      this.validateAndSetNewPassword();
    } else {
      this.showMessagesAndUpdate();
    }
  };

  showMessagesAndUpdate() {
    this.validator.showMessages();
    this.forceUpdate();
  }

  initializeValidator() {
    this.validator = new SimpleReactValidator({
      className: 'invalid-field',
      validators: {
        samePasswords: {
          rule: () => this.state.newPassword === this.state.confirmNewPassword,
        },
        password: {
          message: this.props.t('common:passwordRegex'),
          rule: (val, params, validator) =>
            validator.helpers.testRegex(val, PASSWORD_REGEX) && params.indexOf(val) === -1,
        },
      },
    });
  }

  validateAndSetNewPassword() {
    if (this.validator.allValid()) {
      const { setLoaderVisibility } = this.context;
      setLoaderVisibility(true);
      authService
        .setNewPassword(this.state.newPassword, this.state.confirmNewPassword, this.state.token)
        .then(() => {
          this.setState({ success: true });
          setTimeout(() => {
            this.props.history.push(`/login`);
          }, 3000);
          setLoaderVisibility(false);
        })
        .catch(() => {
          this.resetPasswordErrorCallback(this.props.t('common:anErrorOccured'));
          setLoaderVisibility(false);
        });
    } else {
      this.resetPasswordErrorCallback();
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

  render() {
    const { t } = this.props;

    return (
      <div className="new-password-content">
        <p className="public-header">{t('newPasswordHeader')}</p>
        <form className="" noValidate>
          <div className="form-group">
            <input
              type="password"
              name="newPassword"
              className="form-control form-control-lg"
              onChange={this.onChangeHandler}
              value={this.state.newPassword}
              id="inputNewPassword"
              placeholder={t('newPassword')}
            />
            {this.validator.message('newPassword', this.state.newPassword, `required|password`, {
              messages: {
                required: t('common:validationRequired', {
                  field: t('newPassword'),
                }),
              },
            })}
          </div>
          <div className="form-group">
            <input
              type="password"
              name="confirmNewPassword"
              className="form-control form-control-lg"
              onChange={this.onChangeHandler}
              value={this.state.confirmNewPassword}
              id="inputConfirmNewPassword"
              placeholder={t('confirmNewPassword')}
            />
            {this.validator.message(
              'confirmNewPassword',
              this.state.confirmNewPassword,
              'required|samePasswords',
              {
                messages: {
                  required: t('common:validationRequired', {
                    field: t('confirmNewPassword'),
                  }),
                  samePasswords: t('common:passwordAndConfirmPasswordDifferent'),
                },
              }
            )}
            {this.state.errorMessage.length ? (
              <div className="invalid-field">{this.state.errorMessage}</div>
            ) : null}
          </div>

          <button type="submit" onClick={this.setNewPasswordClick} className="btn submit-button">
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
            {t('setPasswordSuccess')}
          </div>
        ) : null}
      </div>
    );
  }
}

export default withTranslation('user')(NewPassword);

NewPassword.contextType = LoaderContext;
