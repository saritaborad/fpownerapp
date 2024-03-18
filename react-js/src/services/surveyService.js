import Axios from 'axios';
import environment from '../environments/environment';

export const getSurvey = (props) =>
  new Promise((resolve) => {
    getSurveyGet(props)
      .then((item) => {
        if (item.data?.surveyData) {
          resolve({
            surveyData: item.data.surveyData,
            property: item.data.property,
            completedSurveys: item.data.completedSurveys,
          });
        } else {
          resolve({
            surveyData: { sections: [] },
            property: {},
            success: false,
          });
        }
      })
      .catch(() => {
        resolve({
          surveyData: { sections: [] },
          property: {},
          success: false,
        });
      });
  });

export const getSurveySummary = (props) =>
  new Promise((resolve) => {
    getSurveySummaryGet(props)
      .then((item) => {
        if (item.data) {
          resolve({
            property: item.data.property,
            propertyBankAccount: item.data.property_bank_account,
            details: item.data.details,
          });
        } else {
          resolve({
            property: {},
            success: false,
          });
        }
      })
      .catch(() => {
        resolve({
          property: {},
          success: false,
        });
      });
  });

export const saveSurvey = (props) =>
  new Promise((resolve) => {
    surveyPost(props)
      .then((item) => {
        if (item.data.success) {
          resolve(item.data.surveyData);
        } else {
          resolve(null);
        }
      })
      .catch(() => {
        resolve(null);
      });
  });

const getSurveyGet = ({ ownerId, propertyId }) =>
  Axios.get(`${environment.ownerApi}/owner_survey/`, {
    params: { ownerId, propertyId },
  });

const getSurveySummaryGet = ({ propertyId }) =>
  Axios.get(`${environment.ownerApi}/property/`, {
    params: { id: propertyId },
  });

const surveyPost = ({ ownerId, propertyId, sections, completed }) =>
  Axios.post(
    `${environment.ownerApi}/owner_survey/?ownerId=${ownerId}${
      propertyId ? `&propertyId=${propertyId}` : ``
    }`,
    {
      sections,
      completed,
    }
  );
