/* eslint-disable jsx-a11y/label-has-for */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { getFieldName } from '../../../helpers/fieldHelper';

import './Radio.scss';

const Radio = ({ index, fieldState, name, handleChange, field, disabled }) => {
  const { t } = useTranslation('form');

  return (
    <div className="radio form-group">
      <label>{`${index}. ${t(name)}`}</label>
      {field.options.map((option, i) => (
        <div className="form-check" key={`${index}-${t(name)}-${option.key}`}>
          <input
            className="form-check-input"
            name={name}
            type="radio"
            onChange={handleChange}
            id={`${name}${i}`}
            value={option.key}
            checked={fieldState === option.key}
            disabled={disabled}
          />
          <label htmlFor={`${name}${i}`} className="form-check-label">
            {t(getFieldName(option.value))}
          </label>
        </div>
      ))}
    </div>
  );
};

export default Radio;
