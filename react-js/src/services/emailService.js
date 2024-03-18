import Axios from 'axios';
import environment from '../environments/environment';

export function sendEmail(user, subject, body) {
  const postData = prepareSendEmailData(user, subject, body);

  return new Promise((resolve, reject) =>
    sendEmailPost(postData)
      .then((response) => {
        if (response.data.flag === 1) {
          resolve(response.data);
        } else {
          reject(response.data);
        }
      })
      .catch((error) => {
        reject(error);
      })
  );
}

function prepareSendEmailData(user, subject, body) {
  return `full_name=${
    user.fullName
  }&subject=${subject}&message=${body}&owner_email_id=${user.name.replace('+', '%2B')}`;
}

function sendEmailPost(data) {
  return Axios.post(`${environment.ownerApi}/send_contact_mail`, data, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
}
