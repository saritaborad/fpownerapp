import Axios from 'axios';
import environment from '../environments/environment';

let currency = null;

export function getPropertyCurrency(id) {
  return new Promise((resolve, reject) => {
    if (currency) {
      resolve({ currency });

      return;
    }

    getProperty(id)
      .then((response) => {
        if (!response.data.property) {
          throw new Error('Property not found');
        }
        currency = response.data.property.currency;
        resolve({ currency });
      })
      .catch((error) => reject(error));
  });
}

export function getPropertyBasicInfo(id) {
  return new Promise((resolve, reject) => {
    getProperty(id)
      .then((response) => {
        if (!response.data.property) {
          throw new Error('Property not found');
        }
        currency = response.data.property.currency;
        resolve(response.data.property);
      })
      .catch((error) => reject(error));
  });
}

function getProperty(id) {
  return Axios.get(`${environment.ownerApi}/property?id=${id}`);
}

export function getProperties(ownerId, page) {
  return new Promise((resolve, reject) => {
    getPropertiesRequest(ownerId, page)
      .then((res) => {
        const { properties, totalProperties } = res.data;
        resolve({ properties, totalProperties });
      })
      .catch((error) => reject(error));
  });
}

function getPropertiesRequest(ownerId, page = 1) {
  return Axios.get(`${environment.ownerApi}/properties`, {
    params: {
      ownerId,
      limit: environment.pageSize,
      page,
    },
  });
}
