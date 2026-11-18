import styles from './index.module.scss';

interface SkeletonProps {
  width?: string;
  height?: string;
}

/**
 * Placeholder block for content that is loading. Decorative: the container
 * should set `aria-busy` and provide a text alternative such as "Loading devices".
 */
export function Skeleton({ width = '100%', height = '12px' }: SkeletonProps) {
  return <span className={styles.skeleton} style={{ width, height }} aria-hidden="true" />;
}
