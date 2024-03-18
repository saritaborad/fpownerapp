import classNames from 'classnames';
import React from 'react';

import { ButtonProps } from './model';
import style from './style.module.scss';

const Button = ({
  type = 'button',
  className,
  variant,
  prefix,
  postfix,
  value,
  size = 'normal',
  ...props
}: ButtonProps) => (
  <button
    className={classNames(className, style.button, style[variant], style[size], {
      [style.prefix]: prefix !== undefined,
      [style.postfix]: postfix !== undefined,
    })}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
    // eslint-disable-next-line react/button-has-type
    type={type}
  >
    {prefix ? (
      <div className={classNames(style.prefixContainer, { [style.withSpacer]: size === 'big' })}>
        {prefix}
      </div>
    ) : null}
    <span>{value}</span>
    {postfix ? (
      <div className={classNames(style.postfixContainer, { [style.withSpacer]: size === 'big' })}>
        {postfix}
      </div>
    ) : null}
  </button>
);

export default Button;
