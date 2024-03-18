import SimpleReactValidator from 'simple-react-validator';
import { getFieldName } from './fieldHelper';
import { formatValidators } from './validators';

export const initializeValidator = (sections, t) => {
  const result = {};
  sections.forEach((section) => {
    const sectionCamel = getFieldName(section.name);

    result[sectionCamel] = new SimpleReactValidator({
      className: 'invalid-field',
      validators: {
        array: {
          message: t('fillAtLeastFirstField'),
          rule: (val) => val[0]?.length > 0,
        },
      },
    });

    result[`${sectionCamel}Format`] = new SimpleReactValidator({
      className: 'invalid-field',
      validators: formatValidators(t),
    });
  });

  return result;
};

export const defaultValidation = (
  validator,
  field,
  fieldString,
  validation,
  validationMessages = {},
  t
) =>
  validator.message(fieldString, field, validation, {
    messages: {
      required: t('common:validationRequired', {
        field: t(fieldString),
      }),
      ...validationMessages,
    },
  });
