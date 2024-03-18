import { getFieldName } from '../../helpers/fieldHelper';

export const getDefaultFields = (formData) => {
  const result = {};
  formData.forEach((section) => {
    const sectionCamel = getFieldName(section.name);
    result[sectionCamel] = result[sectionCamel] || {};
    section.fields.forEach(({ type, multipleFields, name, value }) => {
      result[sectionCamel][getFieldName(name)] =
        type === 'checkbox' || type === 'boolean' || multipleFields
          ? Array.isArray(value)
            ? value
            : multipleFields
            ? ['']
            : []
          : type === 'number'
          ? value || 0
          : value || '';
    });
  });

  return result;
};

export const getAdditionalFields = (form) => {
  const result = {};

  form.forEach((section) => {
    // const filledSection = getSectionById(formDataValues, section.id);
    const sectionCamel = getFieldName(section.name);
    result[sectionCamel] = result[sectionCamel] || {};
    section.fields.forEach(({ name, value, multipleFields }) => {
      // const { value } = getFieldById(filledSection?.fields, field.id) || {};
      result[sectionCamel][getFieldName(name)] = multipleFields
        ? Array.isArray(value)
          ? value.length
          : 1
        : 1;
    });
  });

  return result;
};

export const getSectionById = (sections, id) =>
  sections?.find(({ id: sectionId }) => sectionId === id);

// const getFieldById = (fields, id) =>
//   fields?.find(({ id: fieldId }) => fieldId === id);

export const connectFormDataWithTemplate = (formDataFilled, formDataSections) =>
  formDataSections.map((section) => {
    const sectionCamel = getFieldName(section.name);
    const filledSection = formDataFilled[sectionCamel];

    const fields = section.fields.map((field) => {
      const fieldCamel = getFieldName(field.name);
      const filledField = filledSection[fieldCamel];

      return { ...field, value: filledField };
    });

    return { ...section, fields };
  });
