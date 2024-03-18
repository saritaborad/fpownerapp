/* eslint-disable jsx-a11y/label-has-for */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { getFieldName } from '../../../helpers/fieldHelper';

import './Checkbox.scss';

const Checkbox = ({ index, fieldState, name, field, handleChange, disabled }) => {
  const { t } = useTranslation('form');

  return (
    <div className="checkbox form-group">
      <label>{`${index}. ${t(name)}`}</label>
      {field.options.map((option, i) => (
        <div className="form-check" key={`${index}-${t(name)}-${option.key}`}>
          <input
            className="form-check-input"
            name={name}
            type="checkbox"
            onChange={handleChange}
            id={`${name}${i}`}
            value={option.key}
            checked={fieldState.some((f) => f === option.key)}
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

export default Checkbox;
