import clsx from 'clsx'
import styles from './ContentSkeleton.module.scss'

export const ContentSkeleton = () => (
  <div className={styles.root}>
    <div className={styles.avatar} />
    <div className={clsx(styles.line, styles.lineWide)} />
    <div className={clsx(styles.line, styles.lineNarrow)} />
    <div className={clsx(styles.line, styles.lineShort)} />
  </div>
)
