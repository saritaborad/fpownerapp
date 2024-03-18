import Axios from 'axios';
import environment from '../environments/environment';

export const getFaq = async (language) => {
  const url = `${environment.frankPorterApi}/owner/uploads/faq/json.php?file=faq_${language}.json`;
  const res = await Axios.get(url);

  if (res.data) {
    return res.data;
  }
  throw new Error('Error getting FAQ');
};
