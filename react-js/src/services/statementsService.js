import Axios from 'axios';
import environment from '../environments/environment';

export default class StatementsService {
  getStatementList(propertyId) {
    // const data = {
    //   property_id: propertyId // uncomment after support json in api
    // };
    const data = `property_id=${propertyId}`; // remove after support json in api

    return new Promise((resolve, reject) => {
      this.getStatementListPost(data)
        .then((response) => {
          if (response.data.flag !== 0 || response.data.flag === 0) {
            resolve(response.data.data);
          } else {
            reject(response.msg);
          }
        })
        .catch((error) => reject(error));
    });
  }

  getStatement(propertyId, month, year) {
    const data = `property_id=${propertyId}&month=${month}&year=${year}`; // remove after support json in api

    return new Promise((resolve, reject) => {
      this.getStatementPost(data)
        .then((response) => {
          // if (response.data.flag !== 0) {
          resolve(response.data?.data);
          // } else {
          //   reject(response.msg);
          // }
        })
        .catch((error) => reject(error));
    });
  }

  getStatementListPost(data) {
    return Axios.post(`${environment.ownerApi}/statements_list`, data, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }); // remove after support json in api
  }

  getStatementPost(data) {
    return Axios.post(`${environment.ownerApi}/statements`, data, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }); // remove after support json in api
  }
}

export const statementsService = new StatementsService();
