/* eslint-disable jsx-a11y/label-has-for */
import React from 'react';
import { useTranslation } from 'react-i18next';

import './Numberbox.scss';

const Numberbox = ({ index, fieldState, name, field, handleChange, disabled }) => {
  const { t } = useTranslation('form');

  const onMinusClick = () => {
    if (disabled) {
      return;
    }

    const nextVal = parseInt(fieldState, 10) - 1;
    handleChange({
      target: {
        value: Number.isInteger(field.minValue) ? Math.max(field.minValue, nextVal) : nextVal,
        name,
      },
    });
  };

  const onPlusClick = () => {
    if (disabled) {
      return;
    }

    const nextVal = parseInt(fieldState, 10) + 1;
    handleChange({
      target: {
        value: Number.isInteger(field.maxValue) ? Math.min(field.maxValue, nextVal) : nextVal,
        name,
      },
    });
  };

  return (
    <div className="numberbox form-group">
      <label>{`${index}. ${t(name)}`}</label>
      <div className="plus-minus-container">
        <div className="minus">
          <i className="icon icon-minus" onClick={onMinusClick} />
        </div>
        <div className="curent-value">{fieldState}</div>
        <div className="plus">
          <i className="icon icon-plus" onClick={onPlusClick} />
        </div>
      </div>
    </div>
  );
};

export default Numberbox;
