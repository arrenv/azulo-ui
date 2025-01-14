import { Loader, Stepper, Icon, CopyToClipboardBtn } from '@gnosis.pm/safe-react-components'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { ErrorFooter } from 'src/routes/creating/components/Footer'
import { isConfirmationStep, steps } from './steps'

import Button from 'src/components/layout/Button'
import Heading from 'src/components/layout/Heading'
import Img from 'src/components/layout/Img'
import Paragraph from 'src/components/layout/Paragraph'
import { instantiateSafeContracts } from 'src/logic/contracts/safeContracts'
import { EMPTY_DATA } from 'src/logic/wallets/ethTransactions'
import { getWeb3 } from 'src/logic/wallets/getWeb3'
import { mainColor, mainLightColor, border, borderRadius, error, errorBG, successColor, successBGColor } from 'src/theme/variables'
import { providerNameSelector } from 'src/logic/wallets/store/selectors'
import { useSelector } from 'react-redux'
import useSafeActions from 'src/logic/safe/hooks/useSafeActions'

import Modal from 'src/components/Modal'
import ReceiveModal from 'src/components/App/ReceiveModal'
import SuccessSvg from './assets/wallet_success.svg'
import ErrorSvg from './assets/wallet_error.svg'
import TransactionLoading from './assets/wallet_animation.svg'
import { PromiEvent, TransactionReceipt } from 'web3-core'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import { mainStyles } from 'src/theme/PageStyles'
import Grid from '@material-ui/core/Grid'
import InfoOutlined from '@material-ui/icons/InfoOutlined'
import { safeNameSelector } from 'src/logic/safe/store/selectors'
import LinearProgress from '@material-ui/core/LinearProgress'

const useStyles = makeStyles(() => ({
  pageTitleHold: {
    marginTop: '60px',
    marginBottom: '20px'
  },
  pageTitle: {
    marginTop: '15px',
    marginBottom: '15px'
  },
  boxHld: {
    border: `1px solid ${border}`,
    width: '100%',
    maxWidth: '600px',
    borderRadius: borderRadius,
    padding: '25px 45px'
  },
  safeName: {
    fontWeight: 700,
    fontSize: '16px',
  },
  progress: {
    margin: '25px 0 20px',
    width: '100%'
  },
  progressStatus: {
    color: mainColor,
    fontWeight: 600
  },
  infoHld: {
    marginTop: '20px',
    padding: '12px 20px',
    border: `1px solid ${error}`,
    borderRadius: borderRadius,
    background: errorBG,
    '& svg': {
      fill: error
    },
    '& > div > div': {
      color: error,
      marginLeft: '10px'
    }
  },
  boxHldSuc: {
    marginTop: '15px',
    border: `1px solid ${successColor}`
  },
  nextStepAdd: {
    background: mainLightColor,
    padding: '10px 15px',
    borderRadius: borderRadius,
    margin: '12px 0 25px',
    fontWeight: 700,
    color: mainColor,
    '& button': {
      display: 'inline-block !important',
      verticalAlign: 'middle',
      marginTop: '2px !important'
    },
  },
  nextStepHdr: {
    color: successColor,
    fontSize: '16px',
    fontWeight: 700,
    '& svg': {
      fill: successColor,
      marginRight: '10px'
    },
  },
  nextStepP: {
    fontSize: '16px',
    marginBottom: '15px',
    textAlign: 'center',
  },
  unStyledButton: {
    background: 'none',
    color: 'inherit',
    border: 'none',
    padding: 0,
    font: 'inherit',
    cursor: 'pointer',
    outlineColor: border,
    display: 'flex',
    alignItems: 'center',
    width: '24px',
    minWidth: '24px',
    margin: '0 0 0 10px'
  }
}));

const BorderLinearProgress = withStyles((theme) => ({
  root: {
    height: 18,
    borderRadius: 25,
  },
  colorPrimary: {
    backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
  },
  bar: {
    borderRadius: 25,
    backgroundColor: mainColor,
  },
}))(LinearProgress);

interface FullParagraphProps {
  inversecolors: string
  stepIndex: number
}

type Props = {
  creationTxHash?: string
  submittedPromise?: PromiEvent<TransactionReceipt>
  onRetry: () => void
  onSuccess: (createdSafeAddress: string) => void
  onCancel: () => void
}

export const SafeDeployment = ({
  creationTxHash,
  onCancel,
  onRetry,
  onSuccess,
  submittedPromise,
}: Props): React.ReactElement => {
  const [loading, setLoading] = useState(true)
  const [stepIndex, setStepIndex] = useState(0)
  const [safeCreationTxHash, setSafeCreationTxHash] = useState('')
  const [createdSafeAddress, setCreatedSafeAddress] = useState('')

  const [error, setError] = useState(false)
  const [intervalStarted, setIntervalStarted] = useState(false)
  const [waitingSafeDeployed, setWaitingSafeDeployed] = useState(false)
  const [continueButtonDisabled, setContinueButtonDisabled] = useState(false)
  const provider = useSelector(providerNameSelector)
  const safeName = useSelector(safeNameSelector) ?? 'Progress of your new Trust'
  const mainClasses = mainStyles()
  const classes = useStyles()
  const { safeActionsState, onShow, onHide } = useSafeActions()

  const onReceiveShow = () => onShow('Receive')
  const onReceiveHide = () => onHide('Receive')

  const confirmationStep = isConfirmationStep(stepIndex)

  const navigateToSafe = () => {
    setContinueButtonDisabled(true)
    onSuccess(createdSafeAddress)
  }

  const onError = (error) => {
    setIntervalStarted(false)
    setWaitingSafeDeployed(false)
    setContinueButtonDisabled(false)
    setError(true)
    console.error(error)
  }

  // discard click event value
  const onRetryTx = () => {
    setStepIndex(0)
    setError(false)
    onRetry()
  }

  const getImage = () => {
    if (error) {
      return ErrorSvg
    }

    if (stepIndex <= 4) {
      return TransactionLoading
    }

    return SuccessSvg
  }

  useEffect(() => {
    const loadContracts = async () => {
      await instantiateSafeContracts()
      setLoading(false)
    }

    if (provider) {
      loadContracts()
    }
  }, [provider])

  // creating safe from from submission
  useEffect(() => {
    if (submittedPromise === undefined) {
      return
    }

    setStepIndex(0)
    submittedPromise
      .once('transactionHash', (txHash) => {
        setSafeCreationTxHash(txHash)
        setStepIndex(1)
        setIntervalStarted(true)
      })
      .on('error', onError)
  }, [submittedPromise])

  // recovering safe creation from txHash
  useEffect(() => {
    if (creationTxHash === undefined) {
      return
    }
    setSafeCreationTxHash(creationTxHash)
    setStepIndex(1)
    setIntervalStarted(true)
  }, [creationTxHash])

  useEffect(() => {
    if (!intervalStarted) {
      return
    }

    const isTxMined = async (txHash) => {
      const web3 = getWeb3()

      const txResult = await web3.eth.getTransaction(txHash)
      if (txResult.blockNumber === null) {
        return false
      }

      const receipt = await web3.eth.getTransactionReceipt(txHash)
      if (!receipt.status) {
        throw Error('TX status reverted')
      }

      return true
    }

    const interval = setInterval(async () => {
      if (stepIndex < 4) {
        setStepIndex(stepIndex + 1)
      }

      // safe created using the form
      if (submittedPromise !== undefined) {
        submittedPromise.then(() => {
          setStepIndex(4)
          setWaitingSafeDeployed(true)
          setIntervalStarted(false)
        })
      }

      // safe pending creation recovered from storage
      if (creationTxHash !== undefined) {
        try {
          const res = await isTxMined(creationTxHash)
          if (res) {
            setStepIndex(4)
            setWaitingSafeDeployed(true)
            setIntervalStarted(false)
          }
        } catch (error) {
          onError(error)
        }
      }
    }, 3000)

    return () => {
      clearInterval(interval)
    }
  }, [creationTxHash, submittedPromise, intervalStarted, stepIndex, error])

  useEffect(() => {
    let interval

    const awaitUntilSafeIsDeployed = async (safeCreationTxHash: string) => {
      try {
        const web3 = getWeb3()
        const receipt = await web3.eth.getTransactionReceipt(safeCreationTxHash)

        let safeAddress

        if (receipt.events) {
          safeAddress = receipt.events.ProxyCreation.returnValues.proxy
        } else {
          // get the address for the just created safe
          const events = web3.eth.abi.decodeLog(
            [
              {
                type: 'address',
                name: 'ProxyCreation',
              },
            ],
            receipt.logs[0].data,
            receipt.logs[0].topics,
          )
          safeAddress = events[0]
        }

        setCreatedSafeAddress(safeAddress)

        interval = setInterval(async () => {
          const code = await web3.eth.getCode(safeAddress)
          if (code !== EMPTY_DATA) {
            setStepIndex(5)
          }
        }, 1000)
      } catch (error) {
        onError(error)
      }
    }

    if (!waitingSafeDeployed) {
      return
    }

    if (typeof safeCreationTxHash === 'string') {
      awaitUntilSafeIsDeployed(safeCreationTxHash)
    }

    return () => {
      clearInterval(interval)
    }
  }, [safeCreationTxHash, waitingSafeDeployed])

  if (loading || stepIndex === undefined) {
    return (
      <>
        <img
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '60px',
            height: 'auto',
            transform: 'translate(-50%, -50%)',
          }}
          src="/resources/azulo_icon_loader.svg"
        />
      </>
    )
  }

  let FooterComponent
  if (error) {
    FooterComponent = ErrorFooter
  } else if (steps[stepIndex].footerComponent) {
    FooterComponent = steps[stepIndex].footerComponent
  }

  return (
    <>
      <Grid container direction="column" justify="center" alignItems="center">
        <Grid item xs={12} className={`${mainClasses.pageTitleHold} ${classes.pageTitleHold}`}>
          <div><Img alt="Status" height={92} src={getImage()} /></div>
          <div className={`${mainClasses.pageTitle} ${classes.pageTitle}`}>Trust creation & validation</div>
        </Grid>
      </Grid>
      <Grid container direction="column">
        <Grid item sm={12}>
          <Grid container direction="row" justify="center" alignItems="center">
            <Grid item className={classes.boxHld}>
              <Grid container direction="column" justify="center" alignItems="center">
                <Grid item className={classes.safeName}>{safeName}</Grid>
                <Grid item className={classes.progress}>
                  <BorderLinearProgress variant="determinate" value={((stepIndex + 1) / steps.length) * 100} />
                </Grid>
                <Grid item className={classes.progressStatus}>{steps[stepIndex].description || steps[stepIndex].label}</Grid>
                {steps[stepIndex].instruction && (
                  <Grid item className={classes.infoHld}>
                    <Grid container direction="row" justify="center" alignItems="center">
                      <InfoOutlined />
                      <Grid item>{error ? 'You can Cancel or Retry the Trust creation process.' : steps[stepIndex].instruction}</Grid>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </Grid>
            { createdSafeAddress ? (
              <>
                <Grid item className={`${classes.boxHld} ${classes.boxHldSuc}`}>
                  <Grid container direction="column" justify="center" alignItems="center">
                    <Grid item>
                      <Grid container className={classes.nextStepHdr} direction="row" justify="center" alignItems="center">
                        <InfoOutlined />
                        <Grid item>This is your new trust wallet address.</Grid>
                      </Grid>
                      <Grid item container className={classes.nextStepAdd} direction="row" justify="center" alignItems="center">
                        <Grid item>{createdSafeAddress}</Grid>
                        <Grid item>
                          <Button className={classes.unStyledButton} onClick={onReceiveShow}>
                            <Icon size="sm" type="qrCode" tooltip="Show QR" />
                          </Button>
                          <CopyToClipboardBtn className={classes.unStyledButton} textToCopy={createdSafeAddress} />
                        </Grid>
                      </Grid>
                      <Grid container direction="row" justify="center" alignItems="center">
                        <Grid item>
                          <Paragraph className={classes.nextStepP} noMargin size="lg">
                            You can now start sending compatible ERC20 and ERC721 assets to this address. Click 'Access trust' below to view and manage the trust.
                          </Paragraph>
                          <Paragraph className={classes.nextStepP} noMargin size="lg">
                            Be sure to copy and keep a record so you can access the trust again in the future, also share the address with other trustees.
                          </Paragraph>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </>
            ) : null }
          </Grid>
        </Grid>
      </Grid>
      <Grid container direction="column" justify="center" alignItems="center">
        {FooterComponent ? (
          <FooterComponent
            continueButtonDisabled={continueButtonDisabled}
            onCancel={onCancel}
            onClick={onRetryTx}
            onContinue={navigateToSafe}
            onRetry={onRetryTx}
            safeCreationTxHash={safeCreationTxHash}
          />
        ) : null}
      </Grid>

      {createdSafeAddress && safeName && (
        <Modal
          description="Receive Tokens Form"
          handleClose={onReceiveHide}
          open={safeActionsState.showReceive}
          paperClassName="receive-modal"
          title="Receive Tokens"
        >
          <ReceiveModal onClose={onReceiveHide} safeAddress={createdSafeAddress} safeName={"New trust"} />
        </Modal>
      )}
      {/* <Stepper activeStepIndex={stepIndex} error={error} orientation="horizontal" steps={steps} />
      <Body>
        <BodyImage>
          <Img alt="Vault" height={92} src={getImage()} />
        </BodyImage>

        <BodyDescription>
          <CardTitle>{steps[stepIndex].description || steps[stepIndex].label}</CardTitle>
        </BodyDescription>

        {steps[stepIndex].instruction && (
          <BodyInstruction>
            <FullParagraph
              color="primary"
              inversecolors={confirmationStep.toString()}
              noMargin
              size="md"
              stepIndex={stepIndex}
            >
              {error ? 'You can Cancel or Retry the Trust creation process.' : steps[stepIndex].instruction}
            </FullParagraph>
          </BodyInstruction>
        )}

        <BodyFooter>
          {FooterComponent ? (
            <FooterComponent
              continueButtonDisabled={continueButtonDisabled}
              onCancel={onCancel}
              onClick={onRetryTx}
              onContinue={navigateToSafe}
              onRetry={onRetryTx}
              safeCreationTxHash={safeCreationTxHash}
            />
          ) : null}
        </BodyFooter>
      </Body>

      {stepIndex !== 0 && (
        <BackButton color="primary" minWidth={140} onClick={onCancel} data-testid="safe-creation-back-btn">
          Back
        </BackButton>
      )} */}
    </>
  )
}
