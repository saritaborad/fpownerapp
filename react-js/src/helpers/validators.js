export const formatValidators = (t) => ({
  swift: {
    message: t('validationFieldError', { field: t('swift') }),
    rule: (val, params, validator) =>
      validator.helpers.testRegex(val, /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/i) &&
      params.indexOf(val) === -1,
  },
  iban: {
    message: t('validationFieldError', { field: t('iban') }),
    rule: (val, params, validator) =>
      validator.helpers.testRegex(
        val,
        /^([A-Z]{2}[ -]?[0-9]{2})(?=(?:[ -]?[A-Z0-9]){9,30}$)((?:[ -]?[A-Z0-9]{3,5}){2,7})([ -]?[A-Z0-9]{1,3})?$/i
      ) && params.indexOf(val) === -1,
  },
  phone: {
    message: t('validationFieldError', { field: t('phone') }),
    rule: (val, params, validator) =>
      validator.helpers.testRegex(val, /^[ +0-9]+$/g) && params.indexOf(val) === -1,
  },
});
