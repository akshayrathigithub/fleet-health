import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';

import { SELECT_TYPEAHEAD_MS, SELECT_VIEWPORT_MARGIN_PX } from '@/constants';
import { cx } from '@/utils/cx';

import { Icon } from '../icon';
import styles from './index.module.scss';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string> {
  label: string;
  value: T;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}

function optionDomId(listId: string, index: number) {
  return `${listId}-option-${index}`;
}

/**
 * Labelled dropdown drawn by us, so it looks the same on every operating
 * system. The button keeps focus while the menu is open and points at the
 * highlighted option with aria-activedescendant.
 */
export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: SelectProps<T>) {
  const labelId = useId();
  const buttonId = useId();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const typedRef = useRef('');
  const typedTimer = useRef(0);

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const highlighted =
    options.length === 0 ? 0 : Math.min(Math.max(activeIndex, 0), options.length - 1);
  const selectedLabel = options.find((option) => option.value === value)?.label ?? '';

  useEffect(() => () => window.clearTimeout(typedTimer.current), []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  useLayoutEffect(() => {
    const menu = listRef.current;
    const anchor = anchorRef.current;
    if (!open || !menu || !anchor) return;

    const place = () => {
      menu.style.left = '0';
      menu.style.right = 'auto';
      const overflowsRight =
        anchor.getBoundingClientRect().left + menu.offsetWidth >
        window.innerWidth - SELECT_VIEWPORT_MARGIN_PX;
      if (overflowsRight) {
        menu.style.left = 'auto';
        menu.style.right = '0';
      }
    };

    const revealActive = () => {
      const active = menu.querySelector<HTMLElement>('[data-active="true"]');
      if (!active) return;
      const top = active.offsetTop;
      const bottom = top + active.offsetHeight;
      if (top < menu.scrollTop) menu.scrollTop = top;
      else if (bottom > menu.scrollTop + menu.clientHeight) {
        menu.scrollTop = bottom - menu.clientHeight;
      }
    };

    place();
    revealActive();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [open, options, highlighted]);

  const openAt = (index: number) => {
    const last = Math.max(0, options.length - 1);
    setActiveIndex(Math.min(Math.max(index, 0), last));
    setOpen(true);
  };

  const commit = (index: number) => {
    const option = options[index];
    if (option && option.value !== value) onChange(option.value);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const rememberTyped = (char: string) => {
    window.clearTimeout(typedTimer.current);
    typedRef.current = (typedRef.current + char).toLowerCase();
    typedTimer.current = window.setTimeout(() => {
      typedRef.current = '';
    }, SELECT_TYPEAHEAD_MS);
    return typedRef.current;
  };

  const findTyped = (query: string, from: number) => {
    if (options.length === 0) return -1;
    // A single new character cycles; a longer prefix stays on the current match.
    const start = query.length === 1 ? from + 1 : from;
    for (let step = 0; step < options.length; step += 1) {
      const index = (start + step) % options.length;
      const option = options[index];
      if (option?.label.toLowerCase().startsWith(query)) return index;
    }
    return -1;
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (options.length === 0) return;
    const { key } = event;

    if (key === 'Tab') {
      setOpen(false);
      return;
    }

    if (key === 'Escape') {
      if (!open) return;
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      if (open) commit(highlighted);
      else openAt(selectedIndex);
      return;
    }

    if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Home' || key === 'End') {
      event.preventDefault();
      if (!open) {
        const initial = key === 'Home' ? 0 : key === 'End' ? options.length - 1 : selectedIndex;
        openAt(initial);
        return;
      }
      if (key === 'Home') setActiveIndex(0);
      else if (key === 'End') setActiveIndex(options.length - 1);
      else if (key === 'ArrowDown') setActiveIndex((highlighted + 1) % options.length);
      else setActiveIndex((highlighted - 1 + options.length) % options.length);
      return;
    }

    if (key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
      const match = findTyped(rememberTyped(key), open ? highlighted : selectedIndex);
      if (match < 0) return;
      event.preventDefault();
      const option = options[match];
      if (!option) return;
      if (open) setActiveIndex(match);
      else if (option.value !== value) onChange(option.value);
    }
  };

  const onTriggerClick = (event: MouseEvent<HTMLButtonElement>) => {
    // Keyboard activation is handled in onKeyDown. Those clicks report detail 0.
    if (event.detail === 0) return;
    if (open) setOpen(false);
    else openAt(selectedIndex);
  };

  return (
    <div ref={rootRef} className={cx(styles.field, open && styles.open, className)}>
      <label id={labelId} htmlFor={buttonId} className={styles.label}>
        {label}
      </label>
      <div ref={anchorRef} className={styles.anchor}>
        <button
          ref={buttonRef}
          id={buttonId}
          type="button"
          role="combobox"
          className={styles.trigger}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-labelledby={labelId}
          aria-activedescendant={open ? optionDomId(listId, highlighted) : undefined}
          disabled={options.length === 0}
          onClick={onTriggerClick}
          onKeyDown={onTriggerKeyDown}
        >
          <span className={styles.value}>{selectedLabel}</span>
          <Icon name="chevron" size={16} className={styles.chevron} />
        </button>
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          hidden={!open}
          className={styles.menu}
        >
          {options.map((option, index) => {
            const selected = option.value === value;
            return (
              <li
                key={option.value}
                id={optionDomId(listId, index)}
                role="option"
                aria-selected={selected}
                data-active={index === highlighted ? 'true' : undefined}
                tabIndex={-1}
                className={styles.option}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => commit(index)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    commit(index);
                  }
                }}
              >
                <span>{option.label}</span>
                {selected && <Icon name="tick" size={14} />}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
