import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import { makeStyles } from '@material-ui/core/styles'
import React, { ReactElement, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Button from 'src/components/layout/Button'
import Link from 'src/components/layout/Link'
import { COOKIES_KEY } from 'src/logic/cookies/model/cookie'
import { openCookieBanner } from 'src/logic/cookies/store/actions/openCookieBanner'
import { cookieBannerOpen } from 'src/logic/cookies/store/selectors'
import { loadFromCookie, saveCookie } from 'src/logic/cookies/utils'
import { mainFontFamily, nm, md, primary, screenSm } from 'src/theme/variables'
import { loadGoogleAnalytics } from 'src/utils/googleAnalytics'
import { closeIntercom, isIntercomLoaded, loadIntercom } from 'src/utils/intercom'
import AlertRedIcon from './assets/alert-red.svg'
import IntercomIcon from './assets/intercom.png'

const isDesktop = process.env.REACT_APP_BUILD_FOR_DESKTOP

const useStyles = makeStyles({
  container: {
    backgroundColor: '#fff',
    bottom: '0',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'center',
    left: '0',
    minHeight: '200px',
    padding: '30px',
    position: 'fixed',
    width: '100%',
    maxWidth: '450px',
    zIndex: '999',
  },
  content: {
    maxWidth: '100%',
  },
  text: {
    color: primary,
    fontFamily: mainFontFamily,
    fontSize: nm,
    fontWeight: 'normal',
    lineHeight: '1.38',
    margin: '0 auto 15px',
    textAlign: 'center',
    maxWidth: '810px',
  },
  form: {
    columnGap: '15px',
    display: 'grid',
    gridTemplateColumns: '1fr',
    paddingBottom: '20px',
    rowGap: '15px',
    margin: '0 auto',
    [`@media (min-width: ${screenSm}px)`]: {
      gridTemplateColumns: '1fr 1fr',
      paddingBottom: '10px',
      rowGap: '5px',
    },
  },
  formItem: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
  },
  link: {
    textDecoration: 'underline',
    '&:hover': {
      textDecoration: 'none',
    },
  },
  intercomAlert: {
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'center',
    padding: '0 0 13px 0',
    svg: {
      marginRight: '5px',
    },
  },
  intercomImage: {
    position: 'fixed',
    cursor: 'pointer',
    height: '80px',
    width: '80px',
    bottom: '8px',
    right: '10px',
    zIndex: '1000',
    boxShadow: '1px 2px 10px 0 var(rgba(40, 54, 61, 0.18))',
  },
} as any)

interface CookiesBannerFormProps {
  alertMessage: boolean
}

const CookiesBanner = (): ReactElement => {
  const classes = useStyles()
  const dispatch = useRef(useDispatch())

  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showIntercom, setShowIntercom] = useState(false)
  const [localNecessary, setLocalNecessary] = useState(true)
  const [localAnalytics, setLocalAnalytics] = useState(false)
  const [localIntercom, setLocalIntercom] = useState(false)

  const showBanner = useSelector(cookieBannerOpen)

  useEffect(() => {
    async function fetchCookiesFromStorage() {
      const cookiesState = await loadFromCookie(COOKIES_KEY)
      if (!cookiesState) {
        dispatch.current(openCookieBanner({ cookieBannerOpen: true }))
      } else {
        const { acceptedIntercom, acceptedAnalytics, acceptedNecessary } = cookiesState
        if (acceptedIntercom === undefined) {
          const newState = {
            acceptedNecessary,
            acceptedAnalytics,
            acceptedIntercom: acceptedAnalytics,
          }
          const expDays = acceptedAnalytics ? 365 : 7
          await saveCookie(COOKIES_KEY, newState, expDays)
          setLocalIntercom(newState.acceptedIntercom)
          setShowIntercom(newState.acceptedIntercom)
        } else {
          setLocalIntercom(acceptedIntercom)
          setShowIntercom(acceptedIntercom)
        }
        setLocalAnalytics(acceptedAnalytics)
        setLocalNecessary(acceptedNecessary)

        if (acceptedAnalytics && !isDesktop) {
          loadGoogleAnalytics()
        }
      }
    }
    fetchCookiesFromStorage()
  }, [showAnalytics, showIntercom])

  const acceptCookiesHandler = async () => {
    const newState = {
      acceptedNecessary: true,
      acceptedAnalytics: !isDesktop,
      acceptedIntercom: true,
    }
    await saveCookie(COOKIES_KEY, newState, 365)
    setShowAnalytics(!isDesktop)
    setShowIntercom(true)
    dispatch.current(openCookieBanner({ cookieBannerOpen: false }))
  }

  const closeCookiesBannerHandler = async () => {
    const newState = {
      acceptedNecessary: true,
      acceptedAnalytics: localAnalytics,
      acceptedIntercom: localIntercom,
    }
    const expDays = localAnalytics ? 365 : 7
    await saveCookie(COOKIES_KEY, newState, expDays)
    setShowAnalytics(localAnalytics)
    setShowIntercom(localIntercom)
    if (!localIntercom && isIntercomLoaded()) {
      closeIntercom()
    }
    dispatch.current(openCookieBanner({ cookieBannerOpen: false }))
  }

  if (showIntercom) {
    loadIntercom()
  }

  const CookiesBannerForm = (props: CookiesBannerFormProps) => {
    const { alertMessage } = props
    return (
      <div className={classes.container}>
        <div className={classes.content}>
          {alertMessage && (
            <div className={classes.intercomAlert}>
              <img src={AlertRedIcon} />
              You attempted to open the customer support chat. Please accept the customer support cookie.
            </div>
          )}
          <p className={classes.text}>
            Cookies are used to provide you with the best experience.
            Please read our{' '}
            <Link className={classes.link} to="/cookies">
              Cookie Policy
            </Link>{' '}
            for more information. By clicking &quot;Accept all&quot;, you agree to the storing of cookies on your device
            to enhance site navigation, features, analyze site usage and provide customer support.
          </p>
          <div className={classes.form}>
            <div className={classes.formItem}>
              <FormControlLabel
                checked={localNecessary}
                control={<Checkbox disabled />}
                disabled
                label="Necessary"
                name="Necessary"
                onChange={() => setLocalNecessary((prev) => !prev)}
                value={localNecessary}
              />
            </div>
            {/* <div className={classes.formItem}>
              <FormControlLabel
                control={<Checkbox checked={localIntercom} />}
                label="Customer support"
                name="Customer support"
                onChange={() => setLocalIntercom((prev) => !prev)}
                value={localIntercom}
              />
            </div> */}
            <div className={classes.formItem}>
              <FormControlLabel
                control={<Checkbox checked={localAnalytics} />}
                label="Analytics"
                name="Analytics"
                onChange={() => setLocalAnalytics((prev) => !prev)}
                value={localAnalytics}
              />
            </div>
          </div>
          <div className={classes.form}>
            <div className={classes.formItem}>
              <Button
                color="primary"
                component={Link}
                minWidth={170}
                onClick={() => closeCookiesBannerHandler()}
                variant="outlined"
              >
                Accept selected
              </Button>
            </div>
            <div className={classes.formItem}>
              <Button
                color="primary"
                component={Link}
                minWidth={170}
                onClick={() => acceptCookiesHandler()}
                variant="contained"
              >
                Accept all
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* {!isDesktop && !showIntercom && (
        <img
          className={classes.intercomImage}
          src={IntercomIcon}
          onClick={() => dispatch.current(openCookieBanner({ cookieBannerOpen: true, intercomAlertDisplayed: true }))}
        />
      )} */}
      {!isDesktop && showBanner?.cookieBannerOpen && (
        <CookiesBannerForm alertMessage={showBanner?.intercomAlertDisplayed} />
      )}
    </>
  )
}

export default CookiesBanner
