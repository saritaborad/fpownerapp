import { Field } from 'hooks/useSurvey/models';
import camelCase from 'lodash/camelCase';

export const getFieldName = (fieldName: string) => camelCase(fieldName);

export const fieldsArrayToObject = (fields: Field[]) =>
  fields.reduce((previous, { name, ...field }) => {
    const result = Object.assign(previous, {});

    result[name] = { ...field };

    return result;
  }, {}) as Record<string, Omit<Field, 'name'>>;
