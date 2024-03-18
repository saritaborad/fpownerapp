import React, { Component } from 'react';
import SimpleReactValidator from 'simple-react-validator';
import { PASSWORD_REGEX } from 'helpers/passwordHelper';
import { authService } from '../../services/authService';
import { LoaderContext } from '../../components/common/Loader/Loader';
import './Account.scss';

export class ChangePassword extends Component {
  constructor(props) {
    super(props);
    this.initializeValidator();
    this.state = {
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
      errorMessage: null,
    };
  }

  handleUnauthorizedResponse(error, email) {
    if (error.response.data.error.code === 'TOO_MANY_FAILED_LOGIN_ATTEMPTS') {
      this.showError(error.response.data.error.message);
    } else if (error.response.status === 401) {
      this.tryNewPassword(email);
    }
    this.context.setLoaderVisibility(false);
  }

  onChangeHandler = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  changePasswordClick = (event) => {
    event.preventDefault();
    this.setState({ errorMessage: null }, () => {
      this.validator.hideMessages();
      this.forceUpdate();
      if (this.validator.allValid()) {
        const user = authService.currentUser;
        this.changePassword(user);
      } else {
        this.showMessagesAndUpdate();
      }
    });
  };

  changePassword(user) {
    this.context.setLoaderVisibility(true);
    authService
      .changePassword(user.name, this.state.oldPassword, this.state.newPassword)
      .then(() => {
        this.tryNewPassword(user.name);
      })
      .catch((error) => {
        this.handleUnauthorizedResponse(error, user.name);
      });
  }

  tryNewPassword(email) {
    authService
      .login(email, this.state.newPassword)
      .then(() => {
        this.context.setLoaderVisibility(false);
        window.location.reload();
      })
      .catch(() => {
        this.showError(this.props.t('wrongPassword'));
        this.context.setLoaderVisibility(false);
      });
  }

  showError(error) {
    this.setState({ errorMessage: error }, () => {
      this.showMessagesAndUpdate();
    });
  }

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
        errorMessage: {
          rule: () => this.state.errorMessage === null,
        },
        password: {
          message: this.props.t('common:passwordRegex'),
          rule: (val, params, validator) =>
            validator.helpers.testRegex(val, PASSWORD_REGEX) && params.indexOf(val) === -1,
        },
      },
    });
  }

  render() {
    const { t } = this.props;

    return (
      <div className="change-password account-overflow property-overflow">
        <form className="" noValidate>
          <div className="form-group">
            <input
              type="password"
              className="form-control"
              name="oldPassword"
              onChange={this.onChangeHandler}
              value={this.state.oldPassword}
              placeholder={t('oldPassword')}
            />
            {this.validator.message(
              'oldPassword',
              this.state.oldPassword,
              'required|errorMessage',
              {
                messages: {
                  required: t('common:validationRequired', {
                    field: t('oldPassword'),
                  }),
                  errorMessage: this.state.errorMessage,
                },
              }
            )}
          </div>
          <div className="form-group">
            <input
              type="password"
              name="newPassword"
              className="form-control"
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
              className="form-control"
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
          </div>
          <button type="submit" onClick={this.changePasswordClick.bind(this)} className="btn">
            {t('changePassword')}
          </button>
        </form>
      </div>
    );
  }
}
export default ChangePassword;

ChangePassword.contextType = LoaderContext;
