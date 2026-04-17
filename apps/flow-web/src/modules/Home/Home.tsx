import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { Button } from '@primer/react'
import { useTranslation } from 'react-i18next'
import { useBannerStore } from '@primer-guidy/components-web'
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
  const {
    showBanner: flowShowBanner,
    authError,
    dismissBanner: flowDismissBanner,
    isLoading,
    onLogin,
    onRegister,
  } = flow
  const showBanner = useBannerStore((s) => s.showBanner)
  const dismissBanner = useBannerStore((s) => s.dismissBanner)

  const submitLabel =
    activeTab === AuthTab.Login ? tHome('actions.login') : tHome('actions.register')

  const handleTabChange = (tab: AuthTabValue) => {
    setActiveTab(tab)
  }

  useEffect(() => {
    if (flowShowBanner) {
      showBanner({
        variant: 'warning',
        message: tHome('banner.message'),
        cta: {
          label: tHome('banner.cta'),
          onClick: () => {
            dismissBanner()
            flowDismissBanner()
            handleTabChange(AuthTab.Register)
          },
        },
      })
    }
  }, [flowShowBanner, showBanner, dismissBanner, flowDismissBanner, tHome])

  useEffect(() => {
    if (authError) {
      showBanner({
        variant: 'danger',
        message: tHome(`errors.${authError}`),
      })
    }
  }, [authError, showBanner, tHome])

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.tabBar} role="tablist">
          <Button
            variant="invisible"
            role="tab"
            aria-selected={activeTab === AuthTab.Login}
            className={clsx(styles.tab, {
              [styles.tabActive as string]: activeTab === AuthTab.Login,
            })}
            onClick={() => handleTabChange(AuthTab.Login)}
          >
            {tHome('tabs.login')}
          </Button>
          <Button
            variant="invisible"
            role="tab"
            aria-selected={activeTab === AuthTab.Register}
            className={clsx(styles.tab, {
              [styles.tabActive as string]: activeTab === AuthTab.Register,
            })}
            onClick={() => handleTabChange(AuthTab.Register)}
          >
            {tHome('tabs.register')}
          </Button>
        </div>
        <div className={styles.formContainer}>
          <div className={activeTab === AuthTab.Login ? styles.formPanel : styles.formPanelHidden}>
            <LoginForm onSubmit={onLogin} disabled={isLoading} />
          </div>
          <div
            className={activeTab === AuthTab.Register ? styles.formPanel : styles.formPanelHidden}
          >
            <RegisterForm onSubmit={onRegister} disabled={isLoading} />
          </div>
        </div>
        <div className={styles.submitContainer}>
          <Button
            type="submit"
            variant="primary"
            block
            disabled={isLoading}
            form={AUTH_FORM_ID[activeTab]}
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
