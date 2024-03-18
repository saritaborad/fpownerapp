/* eslint-disable jsx-a11y/label-has-for */
import React from 'react';
import { useTranslation } from 'react-i18next';

import './Textarea.scss';

const Textarea = ({ index, fieldState, name, handleChange, disabled }) => {
  const { t } = useTranslation('form');

  return (
    <div className="textbox form-group">
      <label>{`${index}. ${t(name)}`}</label>

      <textarea
        className="form-control"
        name={name}
        id={name}
        value={fieldState}
        onChange={handleChange}
        rows={3}
        disabled={disabled}
      />
    </div>
  );
};

export default Textarea;
