import { useState } from 'react'
import { Button, Flash, Text } from '@primer/react'
import { useTranslation } from 'react-i18next'
import { AuthTab, AUTH_FORM_ID } from './Home.types'
import type { AuthTabValue } from './Home.types'
import { useFlowAuth } from './useFlowAuth'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import styles from './Home.module.scss'

export const Home = () => {
  const { t: tHome } = useTranslation('home')
  const [activeTab, setActiveTab] = useState<AuthTabValue>(AuthTab.Login)
  const flow = useFlowAuth()

  const submitLabel =
    activeTab === AuthTab.Login ? tHome('actions.login') : tHome('actions.register')

  const handleTabChange = (tab: AuthTabValue) => {
    setActiveTab(tab)
  }

  return (
    <div className={styles.root}>
      {flow.showBanner && (
        <div className={styles.banner}>
          <Flash variant="warning">
            <div className={styles.bannerContent}>
              <Text as="span">{tHome('banner.message')}</Text>
              <Button
                variant="primary"
                size="small"
                onClick={() => {
                  flow.dismissBanner()
                  handleTabChange(AuthTab.Register)
                }}
              >
                {tHome('banner.cta')}
              </Button>
            </div>
          </Flash>
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.tabBar} role="tablist">
          <Button
            variant="invisible"
            role="tab"
            aria-selected={activeTab === AuthTab.Login}
            className={`${styles.tab} ${activeTab === AuthTab.Login ? styles.tabActive : ''}`}
            onClick={() => handleTabChange(AuthTab.Login)}
          >
            {tHome('tabs.login')}
          </Button>
          <Button
            variant="invisible"
            role="tab"
            aria-selected={activeTab === AuthTab.Register}
            className={`${styles.tab} ${activeTab === AuthTab.Register ? styles.tabActive : ''}`}
            onClick={() => handleTabChange(AuthTab.Register)}
          >
            {tHome('tabs.register')}
          </Button>
        </div>
        <div className={styles.formContainer}>
          <div className={activeTab === AuthTab.Login ? styles.formPanel : styles.formPanelHidden}>
            <LoginForm onSubmit={flow.onLogin} disabled={flow.isLoading} />
          </div>
          <div
            className={activeTab === AuthTab.Register ? styles.formPanel : styles.formPanelHidden}
          >
            <RegisterForm onSubmit={flow.onRegister} disabled={flow.isLoading} />
          </div>
        </div>
        <div className={styles.submitContainer}>
          {flow.authError && (
            <Flash variant="danger" className={styles.errorFlash}>
              <Text as="p">{tHome(`errors.${flow.authError}`)}</Text>
            </Flash>
          )}
          <Button
            type="submit"
            variant="primary"
            block
            disabled={flow.isLoading}
            form={AUTH_FORM_ID[activeTab]}
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
