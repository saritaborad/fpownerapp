import React, { useCallback, useEffect, useState } from 'react';

import './EditProfile.scss';
import classNames from 'classnames';
import swal from 'sweetalert';
import cloneDeep from 'lodash/cloneDeep';
import CustomForm from 'components/CustomForm/CustomForm';
import { getSurvey, saveSurvey } from 'services/surveyService';
import { authService } from 'services/authService';
import { useLoader } from 'components/common/Loader/Loader';
import { useTranslation } from 'react-i18next';
import { hasDataBeenChanged, prepareFormToSave } from './helpers';
import ThankYouPage from './ThankYouPage/ThankYouPage';

const EditProfile = (props) => {
  const {
    initializeProfile,
    setPageTitle,
    setBackVisibility,
    personalDetails,
    match: {
      params: { step, propertyId },
    },
  } = props;
  const [formData, setFormData] = useState(null);
  const [currentPage, setCurrentPage] = useState(step ? parseInt(step, 10) : 1);
  const [showThankYouPage, setShowThankYouPage] = useState(false);
  const [currentSectionType, setCurrentSectionType] = useState(null);
  const [formDataDownloaded, setFormDataDownloaded] = useState(false);
  const [isRussian, setIsRussian] = useState(false);
  const [property, setProperty] = useState(null);
  const { setLoaderVisibility } = useLoader();
  const { t } = useTranslation();

  useEffect(() => {
    try {
      swal.close();
    } catch (err) {
      //
    }
  }, []);

  useEffect(() => {
    setBackVisibility(true);
    if (initializeProfile) {
      setPageTitle(t('form:onboardingFrom'));
    }
  }, [initializeProfile, t]);

  const getFormData = useCallback(async () => {
    setLoaderVisibility(true);
    const getSurveyResult = await getSurvey({
      ownerId: authService.currentUser.userId,
      propertyId,
    });

    setProperty(getSurveyResult?.property);
    setFormData({
      sections: getSurveyResult?.surveyData.sections,
    });
    setIsRussian(getSurveyResult?.surveyData?.isRussian);

    setLoaderVisibility(false);
    setFormDataDownloaded(true);
  }, [propertyId, setLoaderVisibility]);

  useEffect(() => {
    getFormData();
  }, [getFormData]);

  const updateFormData = (updatedSections) => {
    const [updatedSection] = updatedSections;
    const newSections = formData.sections.map((section) => {
      if (section.id === updatedSection.id) {
        return cloneDeep(updatedSection);
      }

      return cloneDeep(section);
    });

    setFormData({ sections: newSections });
  };

  const submitCurrentSection = async (form, lastStep, canBeChanged, finished) => {
    const sections = prepareFormToSave(form);
    const [section] = sections;

    if (initializeProfile) {
      await submitSection(form, lastStep, finished);
      if (lastStep) {
        setShowThankYouPage(true);
      }

      return true;
    }

    if (canBeChanged && hasDataBeenChanged(section, formData)) {
      if (section.bankData) {
        const swalVal = await swal({
          title: t('form:bankDataChanged'),
          text: t('form:bankDataChangedText'),
          icon: 'warning',
          buttons: {
            cancel: t('form:noCancel'),
            confirm: t('yes'),
          },
          dangerMode: true,
        });

        if (swalVal) {
          await bankDataChangeAccepted(form, lastStep);

          return true;
        }

        return false;
      }
      await submitSection(form, lastStep, finished);
      updateFormData(form);
      if (lastStep) {
        window.location.reload();
      }
    } else if (lastStep) {
      if (finished) {
        await submitSection(form, lastStep, finished);
        updateFormData(form);
      }
      window.location.reload();

      return false;
    }

    return true;
  };

  const bankDataChangeAccepted = async (form, lastStep) => {
    await submitSection(form, lastStep);
    updateFormData(form);

    if (lastStep) {
      if (initializeProfile) {
        setShowThankYouPage(true);
      } else {
        window.location.reload();
      }
    }

    return true;
  };

  const submitSection = async (form, lastStep, finished) => {
    setLoaderVisibility(true);

    const sections = prepareFormToSave(form);
    const saveResult = await saveSurvey({
      ownerId: authService.currentUser.userId,
      propertyId,
      sections,
      ...(finished ? { completed: finished } : {}),
    });

    setLoaderVisibility(false);

    return saveResult;
  };

  const onPageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className={classNames('edit-profile account-overflow property-overflow')}>
      {!isRussian || personalDetails ? (
        <>
          {!showThankYouPage ? (
            <>
              {currentSectionType && (
                <h1 className="edit-profile-header">
                  <span
                    className={classNames('edit-profile-header__title', {
                      property: currentSectionType === 'propertyDetails' && property,
                    })}
                  >
                    {t(`form:${currentSectionType}`)}
                  </span>
                  {property && currentSectionType === 'propertyDetails' && (
                    <div className="edit-profile-header__property-name">{property.nickname}</div>
                  )}
                </h1>
              )}

              {currentPage === 1 && initializeProfile ? (
                <div className="edit-profile__heading">
                  <p>{t('user:editProfile1stLine')}</p>
                  <p>{t('user:editProfile2ndLine')}</p>
                  <p>{t('user:editProfile3rdLine')}</p>
                </div>
              ) : null}
              {formDataDownloaded ? (
                <CustomForm
                  {...props}
                  sectionTypeChanged={(section) => setCurrentSectionType(section)}
                  formData={formData}
                  initPage={currentPage}
                  pageChange={onPageChange}
                  submitCurrentSection={submitCurrentSection}
                />
              ) : null}
            </>
          ) : null}
          {showThankYouPage && initializeProfile ? <ThankYouPage /> : null}
        </>
      ) : (
        /* TEMPORARY SOLUTION - there will be another form */
        <div className="thank-you-page">
          <h1 className="edit-profile-header">{t('comingSoon')}</h1>
          <p>{t('comingSoonText')}</p>
        </div>
      )}
    </div>
  );
};

export default EditProfile;
