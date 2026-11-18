import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { Outlet } from 'react-router';

import { deviceKeys } from '@/query/deviceKeys';
import { Button, Icon } from '@/components';

import styles from './index.module.scss';

/** Page chrome shared by every route: skip link, header and the main landmark. */
export function AppLayout() {
  const queryClient = useQueryClient();
  const isRefreshing = useIsFetching({ queryKey: deviceKeys.all }) > 0;

  return (
    <>
      {/* First tab stop: lets keyboard users jump past the header. */}
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>

      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.mark}>
            <Icon name="pulse" />
          </span>
          <div>
            <p className={styles.name}>Fleet Health</p>
            <p className={styles.tagline}>IT Operations</p>
          </div>
        </div>

        <Button
          size="sm"
          className={styles.refresh}
          loading={isRefreshing}
          onClick={() => void queryClient.invalidateQueries({ queryKey: deviceKeys.all })}
        >
          {isRefreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
      </header>

      <main id="main-content" tabIndex={-1} className={styles.main}>
        <Outlet />
      </main>
    </>
  );
}
