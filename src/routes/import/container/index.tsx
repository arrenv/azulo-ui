import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ETHEREUM_NETWORK } from 'src/config/networks/network.d'

import Layout from 'src/routes/import/components/Layout'
import { FIELD_IMPORT_ADDRESS, FIELD_LOAD_NAME } from '../components/fields'

import Page from 'src/components/layout/Page'
import { getGnosisSafeInstanceAt } from 'src/logic/contracts/safeContracts'
import { saveSafes, loadStoredSafes } from 'src/logic/safe/utils'
import { getNamesFrom, getOwnersFrom } from 'src/routes/create/utils/safeDataExtractor'
import { TRUSTS_ADDRESS } from 'src/routes/routes'
import { buildSafe } from 'src/logic/safe/store/actions/fetchSafe'
import { history } from 'src/store'
import { SafeOwner, SafeRecordProps } from 'src/logic/safe/store/models/safe'
import { List } from 'immutable'
import { checksumAddress } from 'src/utils/checksumAddress'
import { networkSelector, providerNameSelector, userAccountSelector } from 'src/logic/wallets/store/selectors'
import { addOrUpdateSafe } from 'src/logic/safe/store/actions/addOrUpdateSafe'

export const loadSafe = async (
  safeName: string,
  safeAddress: string,
  owners: List<SafeOwner>,
  addSafe: (safe: SafeRecordProps) => void,
): Promise<void> => {
  const safeProps = await buildSafe(safeAddress, safeName)
  safeProps.owners = owners

  const storedSafes = (await loadStoredSafes()) || {}

  storedSafes[safeAddress] = safeProps

  await saveSafes(storedSafes)
  await addSafe(safeProps)
}

interface ReviewSafeCreationValues {
  confirmations: string
  name: string
  owner0Address: string
  owner0Name: string
  safeCreationSalt: number
}

interface LoadForm {
  name: string
  address: string
  threshold: string
  owner0Address: string
  owner0Name: string
}

export type LoadFormValues = ReviewSafeCreationValues | LoadForm

const Load = (): React.ReactElement => {
  const dispatch = useDispatch()
  const provider = useSelector(providerNameSelector)
  const network = useSelector(networkSelector)
  const userAddress = useSelector(userAccountSelector)

  const addSafeHandler = async (safe: SafeRecordProps) => {
    await dispatch(addOrUpdateSafe(safe))
  }
  const onLoadSafeSubmit = async (values: LoadFormValues) => {
    let safeAddress = values[FIELD_IMPORT_ADDRESS]
    // TODO: review this check. It doesn't seems to be necessary at this point
    if (!safeAddress) {
      console.error('failed to add Safe address', JSON.stringify(values))
      return
    }

    try {
      const safeName = values[FIELD_LOAD_NAME]
      safeAddress = checksumAddress(safeAddress)
      const ownerNames = getNamesFrom(values)

      const gnosisSafe = getGnosisSafeInstanceAt(safeAddress)
      const ownerAddresses = await gnosisSafe.methods.getOwners().call()
      const owners = getOwnersFrom(ownerNames, ownerAddresses.slice().sort())

      await loadSafe(safeName, safeAddress, owners, addSafeHandler)

      const url = `${TRUSTS_ADDRESS}/${safeAddress}/assets`
      history.push(url)
    } catch (error) {
      console.error('Error while loading the Trust', error)
    }
  }

  return (
    <Page>
      <Layout
        onLoadSafeSubmit={onLoadSafeSubmit}
        network={ETHEREUM_NETWORK[network]}
        userAddress={userAddress}
        provider={provider}
      />
    </Page>
  )
}

export default Load
