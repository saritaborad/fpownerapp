import cloneDeep from 'lodash/cloneDeep';

export const hasDataBeenChanged = (section, formData) => {
  const oldSection = formData.sections.find(({ id }) => id === section.id);

  if (!oldSection) {
    return true;
  }

  return section.fields.some((field) => {
    const oldField = oldSection.fields.find(({ id }) => id === field.id);
    if (!oldField) {
      return true;
    }

    if (Array.isArray(field?.value)) {
      if (!Array.isArray(oldField?.value)) {
        return true;
      }

      return (
        oldField.value?.length !== field.value.length ||
        oldField.value?.some((value, index) => value !== field.value[index])
      );
    }

    return field?.value !== oldField?.value;
  });
};

export const prepareFormToSave = (formData) => {
  const cloned = cloneDeep(formData);

  return cloned.map((section) => ({
    ...section,
    fields: section.fields.map((field) => {
      if (field.multipleFields) {
        field.value = field.value.filter((val) => val?.length);
      }

      return field;
    }),
  }));
};
