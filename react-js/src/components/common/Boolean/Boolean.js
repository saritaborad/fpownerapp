/* eslint-disable jsx-a11y/label-has-for */
import React from 'react';
import { useTranslation } from 'react-i18next';

import './Boolean.scss';

const Boolean = ({ index, fieldState, name, handleChange, disabled }) => {
  const { t } = useTranslation('form');

  return (
    <div className="boolean form-group">
      <label>{`${index}. ${t(name)}`}</label>
      <div className="form-check">
        <label htmlFor={`boolean-${name}-${index}`} className="switch switch-pill switch-primary">
          <input
            id={`boolean-${name}-${index}`}
            type="checkbox"
            className="switch-input"
            name={name}
            checked={fieldState.filter((f) => f).length > 0}
            value
            onChange={handleChange}
            disabled={disabled}
          />
          <span className="switch-slider" />
        </label>
      </div>
    </div>
  );
};

export default Boolean;
