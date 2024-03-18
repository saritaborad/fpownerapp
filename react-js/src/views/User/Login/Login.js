import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import SimpleReactValidator from 'simple-react-validator';
import { authService } from '../../../services/authService';
import { LoaderContext } from '../../../components/common/Loader/Loader';
import './Login.scss';

class Login extends Component {
  constructor(props) {
    super(props);
    this.initializeValidator();
    this.state = {
      email: '',
      password: '',
      errorMessage: null,
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
  };

  onResetPasswordClick() {
    this.props.history.push(`/reset-password`);
  }

  backClick = () => {
    if (navigator.app) {
      navigator.app.exitApp();
    }
  };

  loginClick = (e) => {
    e.preventDefault();
    this.setState(
      (prevState) => ({ errorMessage: null, email: prevState.email.trim() }),
      () => {
        this.validator.hideMessages();
        this.forceUpdate();
        this.validateAndLogin();
      }
    );
  };

  showMessagesAndUpdate() {
    this.validator.showMessages();
    this.forceUpdate();
  }

  initializeValidator() {
    this.validator = new SimpleReactValidator({
      className: 'invalid-field',
      validators: {
        emailOrPassword: {
          rule: () => this.state.errorMessage === null,
        },
      },
    });
  }

  validateAndLogin() {
    if (this.validator.allValid()) {
      const { setLoaderVisibility } = this.context;
      setLoaderVisibility(true);
      authService
        .login(this.state.email, this.state.password.replace(/[,]/g, ''))
        .then(() => {
          window.location.reload();
          setLoaderVisibility(false);
        })
        .catch((error) => {
          setLoaderVisibility(false);
          this.loginErrorCallback(error);
        });
    } else {
      this.showMessagesAndUpdate();
    }
  }

  loginErrorCallback(error) {
    let errorMessage = this.props.t('common:emailOrPasswordIncorrect');
    if (error.response?.data?.error?.code === 'TOO_MANY_FAILED_LOGIN_ATTEMPTS') {
      errorMessage = error.response.data.error.message;
    }
    this.setState({ errorMessage }, () => {
      this.showMessagesAndUpdate();
    });
  }

  render() {
    const { t } = this.props;

    return (
      <div className="login-content">
        <p className="public-header">{t('signInHeader')}</p>
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
          </div>
          <div className="input-group">
            <input
              type="password"
              name="password"
              className="form-control form-control-lg"
              onChange={this.onChangeHandler}
              value={this.state.password}
              id="inputPassword"
              placeholder={t('password')}
            />
            {this.validator.message('password', this.state.password, 'required|emailOrPassword', {
              messages: {
                required: t('common:validationRequired', {
                  field: t('password'),
                }),
                emailOrPassword: this.state.errorMessage,
              },
            })}
          </div>
          <button type="submit" onClick={this.loginClick} className="btn submit-button">
            {t('login')}
          </button>
        </form>

        <div className="round-separator">
          <div className="circle" />
        </div>
        <span className="switch-option" onClick={this.onResetPasswordClick.bind(this)}>
          {t('forgotPassword')}
        </span>
      </div>
    );
  }
}

export default withTranslation(['user', 'common'])(Login);

Login.contextType = LoaderContext;
