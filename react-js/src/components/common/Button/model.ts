import { ButtonHTMLAttributes, DetailedHTMLProps, ReactElement } from 'react';

export interface ButtonProps
  extends Omit<
    DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
    'prefix'
  > {
  variant: 'outline' | 'filled';
  prefix?: ReactElement;
  postfix?: ReactElement;
  size?: 'normal' | 'big';
}
