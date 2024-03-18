/* eslint-disable no-return-assign */
import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import clone from 'lodash/clone';
import classNames from 'classnames';
import { defaultValidation, initializeValidator } from 'helpers/validationHelper';
import cloneDeep from 'lodash/cloneDeep';
import Checkbox from '../common/Checkbox';
import Numberbox from '../common/Numberbox';
import Radio from '../common/Radio';
import Textbox from '../common/Textbox';
import Textarea from '../common/Textarea';
import './CustomForm.scss';
import {
  connectFormDataWithTemplate,
  getAdditionalFields,
  getDefaultFields,
  getSectionById,
} from './helpers';
import { getFieldName } from '../../helpers/fieldHelper';
import FormSteps from '../FormSteps';
import Boolean from '../common/Boolean';

const CustomForm = ({
  formData,
  personalDetails,
  propertyDetails,
  pageChange,
  initPage,
  initializeProfile,
  sectionTypeChanged,
  submitCurrentSection,
}) => {
  const { t } = useTranslation('form');

  const formDataSections = useMemo(
    () =>
      cloneDeep(
        formData.sections.filter(
          (section) =>
            initializeProfile ||
            ((personalDetails ? section.personalDetails : true) &&
              (propertyDetails ? section.propertyDetails : true))
        )
      ),
    [formData, personalDetails, propertyDetails, initializeProfile]
  );

  const initForm = useMemo(() => getDefaultFields(formDataSections), [formDataSections]);

  const additionalFieldsInit = useMemo(
    () => getAdditionalFields(formDataSections),
    [formDataSections]
  );

  const [form, setForm] = useState(initForm);
  const [update, setUpdate] = useState(0);
  const [validators] = useState(initializeValidator(formDataSections, t));
  const [currentSection, setCurrentSection] = useState(initPage);
  const [additionalFields, setAdditionalFields] = useState(additionalFieldsInit);
  const [editAvailable, setEditAvailable] = useState(false);

  const formDataSectionsFull = useMemo(() =>
    formDataSections.map((section) => ({
      ...section,
      filled: validators[getFieldName(section.name)].allValid(),
    }))
  );

  const filledItems = useMemo(
    () => formDataSectionsFull.filter((section) => section.filled).length
  );

  const inputDisabled = () => !editAvailable && !initializeProfile;

  const getCurrentSection = () => {
    const section = formDataSections[currentSection - 1];
    if (section) {
      const sectionType = section.personalDetails
        ? 'personalDetails'
        : section.propertyDetails
        ? 'propertyDetails'
        : null;

      return sectionType;
    }

    return null;
  };

  useEffect(() => {
    pageChange(currentSection);

    const section = getCurrentSection();
    if (section) {
      sectionTypeChanged(section);
    }
  }, [currentSection, pageChange, formDataSections]);

  const handleChange = ({ target: { name, value, type, checked } }, sectionCamelName, index) => {
    let newValue = value;
    if (type === 'checkbox') {
      newValue = form[sectionCamelName][name] || [];
      if (checked) {
        newValue.push(value);
      } else {
        const newIndex = newValue.indexOf(value);
        if (newIndex > -1) {
          newValue.splice(newIndex, 1);
        }
      }
    }

    if (index >= 0) {
      newValue = clone(form[sectionCamelName][name]);
      newValue[index] = value;
    }

    setForm({
      ...form,
      [sectionCamelName]: {
        ...form[sectionCamelName],
        [name]: newValue,
      },
    });
  };

  const addAdditionalField = (additionalField, section, field) => {
    const copy = clone(additionalFields);
    copy[section][field] = additionalField + 1;
    setAdditionalFields(copy);

    const newValue = clone(form[section][field]);
    newValue.push('');

    setForm({
      ...form,
      [section]: {
        ...form[section],
        [field]: newValue,
      },
    });
  };

  const onPrevClick = () => {
    setEditAvailable(false);
    setCurrentSection(currentSection - 1);
  };

  const onStepClick = (step, previousStep) => {
    const prevSectionCamel = getFieldName(formDataSections[previousStep - 1].name);
    onNextClick(prevSectionCamel, step);
  };

  const validPersonal = (section) =>
    (personalDetails &&
      validators[`${section}Format`].allValid() &&
      validators[`${section}`].allValid()) ||
    !editAvailable;

  const validProperty = (section) =>
    (propertyDetails && validators[`${section}Format`].allValid()) || !editAvailable;

  const onNextClick = async (section, nextStep) => {
    const nextPage = nextStep || currentSection + 1;
    const lastStep = currentSection === formDataSections.length;

    if (validProperty(section) || validPersonal(section)) {
      const currentSectionObj = formDataSections[currentSection - 1];
      const next = await submitCurrentSection(
        connectFormDataWithTemplate(form, [currentSectionObj]),
        lastStep,
        editAvailable,
        formDataSectionsFull.every(({ filled }) => filled)
      );
      if (next) {
        setEditAvailable(false);
        setCurrentSection(nextPage);
      }
    } else {
      validators[`${section}Format`].showMessages();
      if (personalDetails) {
        validators[`${section}`].showMessages();
      }
      setUpdate(update + 1);
    }
  };

  const checkIfRequired = (requiredIf, sectionId) => {
    const section = getSectionById(formDataSections, sectionId);
    if (section) {
      const field = section.fields.find((item) => item.id === requiredIf.id);
      if (field) {
        const formField = form[getFieldName(section.name)][getFieldName(field.name)];

        if (field.type === 'textbox') {
          return requiredIf.hasValue ? formField?.length : !formField?.length;
        }

        if (formField === requiredIf.hasValue) {
          return true;
        }
      }
    }

    return false;
  };

  const checkIfIsVisible = (showIf, sectionId) => {
    const section = getSectionById(formDataSections, sectionId);
    if (section) {
      const field = section.fields.find((item) => item.id === showIf.id);
      if (field) {
        const formField = form[getFieldName(section.name)][getFieldName(field.name)];

        if (formField === showIf.hasValue) {
          return true;
        }
      }
    }

    return false;
  };

  const onSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <form className="edit-profile-form" onSubmit={onSubmit} noValidate>
      {getCurrentSection() !== 'personalDetails' || initializeProfile ? (
        <FormSteps
          maxStep={formDataSectionsFull.length}
          currentStep={currentSection}
          onStepClick={onStepClick}
          sections={formDataSectionsFull}
        />
      ) : null}
      {propertyDetails ? (
        <div className="finshed-steps-summary">
          {filledItems}
          {'/'}
          {formDataSectionsFull.length}
          {'  '}
          {t('complete')}
        </div>
      ) : null}
      {formDataSectionsFull.map((section, sectionIndex) => {
        let fieldNumber = 0;
        const sectionCamelName = getFieldName(section.name);
        const isCurrentSection = currentSection === sectionIndex + 1;
        validators[sectionCamelName].purgeFields();
        validators[`${sectionCamelName}Format`].purgeFields();

        return (
          <div key={`section-${section.id}`} className={isCurrentSection ? '' : 'hidden-section'}>
            <div className="section-header">
              <div>
                <h3 className="section-name">{t(sectionCamelName)}</h3>
                <p className="section-description">{t(section.description)}</p>
              </div>
              {!initializeProfile ? (
                <div>
                  <button
                    type="button"
                    className="btn btn-edit"
                    onClick={() => setEditAvailable(true)}
                  >
                    edit
                  </button>
                </div>
              ) : null}
            </div>
            {section.fields.map((field, index) => {
              const camelName = getFieldName(field.name);
              const fieldState = form[sectionCamelName][camelName];
              const additionalField = additionalFields[sectionCamelName][camelName];
              const {
                validation,
                requiredIf,
                showIf,
                customValidationMessage,
                multipleFields,
                customMultipleName,
                name,
                type,
              } = field;

              if (showIf && !checkIfIsVisible(showIf, section.id)) {
                return null;
              }

              const formatRules = validation
                ?.split('|')
                .filter((x) => x !== 'required' && !requiredIf)
                .join('|');

              const requiredRules = validation
                ?.split('|')
                .filter(
                  (val) =>
                    !(val === 'required' && requiredIf && !checkIfRequired(requiredIf, section.id))
                )
                .filter((x) => x === 'required' || requiredIf)
                .concat(multipleFields ? ['array'] : [])
                .join('|');

              return (
                <div key={section.id + name}>
                  {type === 'textbox' ? (
                    <>
                      {multipleFields ? (
                        <>
                          {Array.from(Array(additionalField)).map((_, i) => (
                            <Textbox
                              key={camelName + fieldNumber}
                              index={(fieldNumber += 1)}
                              fieldState={fieldState[i]}
                              name={camelName}
                              handleChange={(e) => handleChange(e, sectionCamelName, i)}
                              disabled={inputDisabled(section)}
                            />
                          ))}
                          <p
                            className="textbox-add-new"
                            onClick={() =>
                              addAdditionalField(additionalField, sectionCamelName, camelName)
                            }
                          >
                            {`+ ${customMultipleName || name}`}
                          </p>
                        </>
                      ) : (
                        <Textbox
                          index={(fieldNumber += 1)}
                          fieldState={fieldState}
                          name={camelName}
                          handleChange={(e) => handleChange(e, sectionCamelName)}
                          disabled={inputDisabled(section)}
                        />
                      )}
                    </>
                  ) : type === 'textarea' ? (
                    <Textarea
                      index={(fieldNumber += 1)}
                      fieldState={fieldState}
                      field={field}
                      name={camelName}
                      handleChange={(e) => handleChange(e, sectionCamelName)}
                      disabled={inputDisabled(section)}
                    />
                  ) : type === 'radio' ? (
                    <Radio
                      index={(fieldNumber += 1)}
                      fieldState={fieldState}
                      field={field}
                      name={camelName}
                      handleChange={(e) => handleChange(e, sectionCamelName)}
                      disabled={inputDisabled(section)}
                    />
                  ) : type === 'checkbox' ? (
                    <Checkbox
                      index={(fieldNumber += 1)}
                      fieldState={fieldState}
                      field={field}
                      name={camelName}
                      handleChange={(e) => handleChange(e, sectionCamelName)}
                      disabled={inputDisabled(section)}
                    />
                  ) : type === 'number' ? (
                    <Numberbox
                      index={(fieldNumber += 1)}
                      fieldState={fieldState}
                      field={field}
                      name={camelName}
                      handleChange={(e) => handleChange(e, sectionCamelName)}
                      disabled={inputDisabled(section)}
                    />
                  ) : type === 'boolean' ? (
                    <>
                      {(!section.fields[index - 1] ||
                        section.fields[index - 1]?.type !== 'boolean') && (
                        <div className="bool-header">
                          <div className="bool-spacer" />
                          <div className="bool-label">{t('noyes')}</div>
                        </div>
                      )}
                      <Boolean
                        index={(fieldNumber += 1)}
                        fieldState={fieldState}
                        field={field}
                        name={camelName}
                        handleChange={(e) => handleChange(e, sectionCamelName)}
                        disabled={inputDisabled(section)}
                      />
                    </>
                  ) : null}
                  {isCurrentSection && formatRules?.length > 0
                    ? defaultValidation(
                        validators[`${sectionCamelName}Format`],
                        fieldState,
                        camelName,
                        formatRules,
                        {
                          ...(customValidationMessage || {}),
                        },
                        t
                      )
                    : null}
                  {requiredRules?.length > 0
                    ? defaultValidation(
                        validators[`${sectionCamelName}`],
                        fieldState,
                        camelName,
                        requiredRules,
                        null,
                        t
                      )
                    : null}
                </div>
              );
            })}
            <div className="buttons">
              <div>
                <button
                  type="button"
                  className={`btn btn-prev ${currentSection < 2 ? 'btn-hidden' : ''}`}
                  onClick={() => onPrevClick(sectionCamelName)}
                >
                  {t('previous')}
                </button>
              </div>
              <div>
                <button
                  type="submit"
                  className={classNames('btn btn-next', {
                    finish: currentSection === formDataSections.length,
                  })}
                  onClick={() => onNextClick(sectionCamelName)}
                >
                  {currentSection < formDataSections.length ? t('next') : t('save')}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </form>
  );
};

export default CustomForm;
