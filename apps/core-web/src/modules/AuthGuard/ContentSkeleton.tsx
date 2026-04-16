import styles from './ContentSkeleton.module.scss'

export const ContentSkeleton = () => (
  <div className={styles.root}>
    <div className={styles.avatar} />
    <div className={`${styles.line} ${styles.lineWide}`} />
    <div className={`${styles.line} ${styles.lineNarrow}`} />
    <div className={`${styles.line} ${styles.lineShort}`} />
  </div>
)
