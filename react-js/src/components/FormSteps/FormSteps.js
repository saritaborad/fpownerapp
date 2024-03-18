import React, { useCallback, useEffect, useRef, useState, Fragment } from 'react';
import './FormSteps.scss';
import debounce from 'lodash/debounce';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { getFieldName } from 'helpers/fieldHelper';
import { useTranslation } from 'react-i18next';
import getPageList from '../../helpers/paginationHelper';

const FormSteps = ({ maxStep, currentStep, onStepClick, sections }) => {
  const { t } = useTranslation('form');
  const containerRef = useRef(null);

  const [steps, setSteps] = useState(
    Array(...Array(maxStep)).map((_, i) => ({
      step: i + 1,
      visible: true,
    }))
  );

  const onStepClickHandler = (step, previousStep) => {
    onStepClick(step, previousStep);
  };

  const handleResize = useCallback(
    debounce(() => {
      const width = containerRef.current?.offsetWidth;
      const stepWidth = 37 + 6;
      const maxSteps = Math.floor(width / stepWidth) - 1;
      const stepsToHide = maxStep - maxSteps;

      if (stepsToHide > 0) {
        const newSteps = getPageList(steps, currentStep, maxSteps);

        setSteps(newSteps);
      } else {
        const newSteps = steps.map(({ step }) => ({ step, visible: true }));
        setSteps(newSteps);
      }
    }, 100),
    [currentStep]
  );

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    handleResize();
  }, [handleResize, currentStep]);

  return (
    <div>
      <ul className="list-container" ref={containerRef}>
        {steps.map(({ step, visible }, index) => {
          const visited = currentStep > step;
          const nextVisited = currentStep >= step + 1;
          const showMore = !visible && steps[index - 1]?.visible;
          const section = sections[index];
          const sectionCamelName = `${getFieldName(section.name)}Header`;

          return (
            <Fragment key={step}>
              <li
                className={classNames({
                  visited,
                  hidden: !visible,
                  active: currentStep === step,
                  filled: section.filled,
                })}
                onClick={() => onStepClickHandler(step, currentStep)}
              >
                <div className="circle-header">
                  <div>{t(sectionCamelName)}</div>
                </div>
                <div className="circle">{step}</div>
              </li>
              {showMore ? (
                <li className="show-more">
                  <FontAwesomeIcon icon={faChevronRight} />
                  <div className="show-more__dots">. . .</div>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </li>
              ) : null}
              {step < steps.length && visible && steps[index + 1]?.visible ? (
                <div
                  className={classNames('list-line', {
                    visited: nextVisited,
                  })}
                />
              ) : null}
            </Fragment>
          );
        })}
      </ul>
    </div>
  );
};

export default FormSteps;
