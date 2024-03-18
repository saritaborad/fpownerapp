/* eslint-disable camelcase */
export interface UseSurvey {
  (): UseSurveyResult;
}

export interface UseSurveyResult {
  getSurveySummary: (params: GetSurveySummaryParams) => Promise<GetSurveySummaryResult>;
  mapSurveyForSummary: (surveyData: GetSurveySummaryResult) => SurveySummary;
}

export interface GetSurveySummaryParams {
  propertyId: string;
  // ownerId: string;
}

export interface GetSurveySummaryResult {
  property: Property;
  propertyBankAccount?: PropertyBankAccount;
  details?: PropertyDetailsFinancial;
  success: boolean;
}

export interface PropertyDetailsFinancial {
  expenses?: PropertyDetailsExpenses[];
}

export interface PropertyDetailsExpenses {
  account_number: string;
  charge: string;
  expenseId: string;
  expenseName: string | 'Du' | 'DEWA';
  expense_list_id: string;
  id: string;
  paid_by: string;
  propertyId: string;
  utility: string;
  value: string;
}

export interface PropertyBankAccount {
  account_address: string;
  account_bank_name: string;
  account_currency: string;
  account_data: string;
  account_iban: string;
  account_owner_name: string;
  account_route_code: string;
  account_sort_code: string;
  account_swift: string;
  id: string;
  owner_id: string;
  property_id: string;
  transfer_payout: string;
}

export interface Owner {
  account_address: string;
  account_bank_name: string;
  account_iban: string;
  account_owner_name: string;
  account_swift: string;
  address: string;
  country_id: string;
  date_updated: string;
  email: string;
  email_guesty: string;
  first_name: string;
  guesty_id: string;
  id: string;
  invite: string;
  is_del: string;
  is_forgot: string;
  is_hidden_on_statements: string;
  last_name: string;
  notes: string;
  phone: string;
  property: string;
  reset: string;
  statement_notes: string;
  sync_date: string;
}

export interface Property {
  accommodates: string;
  accountId: string;
  address: string;
  address_2?: string;
  bedrooms: string;
  city: string;
  country_id: string;
  currency: string;
  date_added: string;
  date_updated: string;
  deal_id: string;
  dtcm_unique_code: string;
  expiresAt: string;
  house_rules_additional_notes: string;
  id: string;
  is_active: string;
  last_calendar_update: string;
  last_reservations_update: string;
  lat: string;
  lng: string;
  mail_to_security: string;
  merged_listings: string;
  nickname: string;
  notes: string;
  parking: string;
  passports_portal_name: string;
  permit_expires_at: string;
  permit_file: string;
  picture: string;
  property_code: string;
  property_id: string;
  sync_date: string;
  tags: string;
  title: string;
  wifi_name: string;
  wifi_pass: string;
}

export interface SurveyData {
  isCompleted: boolean;
  isRussian: boolean;
  isSaved: boolean;
  sections: Section[];
}

export interface Section {
  bankData: boolean;
  description: string;
  id: number;
  name: string;
  propertyDetails: boolean;
  fields: Field[];
}

export interface Field {
  id: number;
  name: string;
  type: 'radio' | 'textbox' | 'boolean';
  validation: string;
  value: null | string;
  options?: Option;
  showIf?: ObjectReference;
  requiredIf?: ObjectReference;
}

export interface Option {
  key: string;
  value: string;
}

export interface ObjectReference {
  hasValue: string;
  id: number;
}

export interface SurveySummary extends UtilitiesDetails, PropertyDetails {
  bankData: BankDetails;
}

export interface BankDetails {
  accountName?: string | null;
  bankName?: string | null;
  iban?: string | null;
  accountNumber?: string | null;
  swift?: string | null;
}

export interface UtilitiesDetails {
  dewa?: string | null;
  du?: string | null;
}

export interface PropertyDetails {
  nickname?: string | null;
  address?: string | null;
  address_2?: string | null;
  parkingNumber?: string | null;
  permit?: string | null;
  wifiName?: string | null;
  wifiPass?: string | null;
}
