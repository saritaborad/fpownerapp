import React from 'react';
import { useTranslation } from 'react-i18next';

import './Textbox.scss';

const Textbox = ({ index, fieldState, name, handleChange, disabled }) => {
  const { t } = useTranslation('form');
  const description = t(`${name}Description`, { defaultValue: null });

  return (
    <div className="textbox form-group">
      <label htmlFor={name}>{`${index}. ${t(name)}`}</label>
      {description ? <p className="textbox__description">{description}</p> : null}
      <input
        className="form-control"
        name={name}
        id={name}
        value={fieldState}
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
};

export default Textbox;
