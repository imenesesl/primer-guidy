import { useState } from 'react'
import { Button } from '@primer/react'
import { useTranslation } from 'react-i18next'
import { AuthTab, AUTH_FORM_ID } from './Home.types'
import type { AuthTabValue } from './Home.types'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import styles from './Home.module.scss'

export const Home = () => {
  const { t: tHome } = useTranslation('home')
  const [activeTab, setActiveTab] = useState<AuthTabValue>(AuthTab.Login)

  const submitLabel =
    activeTab === AuthTab.Login ? tHome('actions.login') : tHome('actions.register')

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.tabBar} role="tablist">
          <Button
            variant="invisible"
            role="tab"
            aria-selected={activeTab === AuthTab.Login}
            className={`${styles.tab} ${activeTab === AuthTab.Login ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(AuthTab.Login)}
          >
            {tHome('tabs.login')}
          </Button>
          <Button
            variant="invisible"
            role="tab"
            aria-selected={activeTab === AuthTab.Register}
            className={`${styles.tab} ${activeTab === AuthTab.Register ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(AuthTab.Register)}
          >
            {tHome('tabs.register')}
          </Button>
        </div>
        <div className={styles.formContainer}>
          <div className={activeTab === AuthTab.Login ? styles.formPanel : styles.formPanelHidden}>
            <LoginForm onSubmit={() => undefined} />
          </div>
          <div
            className={activeTab === AuthTab.Register ? styles.formPanel : styles.formPanelHidden}
          >
            <RegisterForm onSubmit={() => undefined} />
          </div>
        </div>
        <div className={styles.submitContainer}>
          <Button type="submit" variant="primary" block form={AUTH_FORM_ID[activeTab]}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
