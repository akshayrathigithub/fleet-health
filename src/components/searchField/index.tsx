import { useId } from 'react';

import { cx } from '@/utils/cx';

import { Icon } from '../icon';
import styles from './index.module.scss';

interface SearchFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchField({ label, value, onChange, placeholder, className }: SearchFieldProps) {
  const id = useId();

  return (
    <div className={cx(styles.field, className)}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.searchWrap}>
        <Icon name="search" className={styles.searchIcon} />
        <input
          id={id}
          type="search"
          className={cx(styles.control, styles.searchInput)}
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
}
