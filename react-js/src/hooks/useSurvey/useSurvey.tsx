import { getSurveySummary as getSurveySummaryService } from 'services/surveyService';

import {
  BankDetails,
  GetSurveySummaryParams,
  GetSurveySummaryResult,
  Property,
  PropertyBankAccount,
  PropertyDetails,
  PropertyDetailsFinancial,
  SurveySummary,
  UseSurvey,
  UtilitiesDetails,
} from './models';

export const useSurvey: UseSurvey = () => {
  const getSurveySummary = async ({ propertyId }: GetSurveySummaryParams) => {
    const survey = await getSurveySummaryService({ propertyId });

    return survey as GetSurveySummaryResult;
  };

  const mapBankDetailsObject = (bankData?: PropertyBankAccount): BankDetails => {
    if (!bankData) {
      return {};
    }

    return {
      accountName: bankData.account_owner_name,
      bankName: bankData.account_bank_name,
      iban: bankData.account_iban,
      accountNumber: bankData.account_data,
      swift: bankData.account_swift,
    };
  };

  const mapUtilitiesDetailsObject = (
    details?: PropertyDetailsFinancial
  ): UtilitiesDetails | null => {
    const du = details?.expenses?.find(({ expenseName }) => expenseName === 'Du');
    const dewa = details?.expenses?.find(({ expenseName }) => expenseName === 'DEWA');

    return {
      dewa: dewa?.account_number,
      du: du?.account_number,
    };
  };

  const mapPropertyDetailsObject = (property: Property): PropertyDetails | null => ({
    nickname: property.nickname,
    address: property.address,
    address_2: property.address_2,
    parkingNumber: property.parking,
    permit: property.permit_expires_at,
    wifiName: property.wifi_name,
    wifiPass: property.wifi_pass,
  });

  const mapSurveyForSummary = (data: GetSurveySummaryResult): SurveySummary => ({
    bankData: mapBankDetailsObject(data.propertyBankAccount),
    ...mapUtilitiesDetailsObject(data.details),
    ...mapPropertyDetailsObject(data.property),
  });

  return { getSurveySummary, mapSurveyForSummary };
};
