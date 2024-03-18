import Axios from 'axios';
import environment from '../environments/environment';

export const getCommission = async (params) => {
  const { data, statusText, request } = await getCommissionRequest(params);

  if (statusText === 'OK') {
    return data;
  }
  console.error(request);

  return {};
};

const getCommissionRequest = ({ propertyId, month, year }) =>
  Axios.get(`${environment.ownerApi}/commission`, {
    params: {
      property_id: propertyId,
      month,
      year,
    },
  });
