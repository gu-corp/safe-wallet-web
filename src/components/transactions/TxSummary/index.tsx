import TxProposalChip from '@/features/proposers/components/TxProposalChip'
import StatusLabel from '@/features/swap/components/StatusLabel'
import useIsExpiredSwap from '@/features/swap/hooks/useIsExpiredSwap'
import { Box } from '@mui/material'
import type { ReactElement } from 'react'
import { type Transaction } from '@safe-global/safe-gateway-typescript-sdk'

import css from './styles.module.css'
import DateTime from '@/components/common/DateTime'
import TxInfo from '@/components/transactions/TxInfo'
import { isMultisigExecutionInfo, isTxQueued } from '@/utils/transaction-guards'
import TxType from '@/components/transactions/TxType'
import classNames from 'classnames'
import { isImitation, isTrustedTx } from '@/utils/transactions'
import MaliciousTxWarning from '../MaliciousTxWarning'
import QueueActions from './QueueActions'
import useIsPending from '@/hooks/useIsPending'
import TxConfirmations from '../TxConfirmations'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'
import TxStatusLabel from '@/components/transactions/TxStatusLabel'

type TxSummaryProps = {
  isConflictGroup?: boolean
  isBulkGroup?: boolean
  item: Transaction
}

const TxSummary = ({ item, isConflictGroup, isBulkGroup }: TxSummaryProps): ReactElement => {
  const hasDefaultTokenlist = useHasFeature(FEATURES.DEFAULT_TOKENLIST)

  const tx = item.transaction
  const isQueue = isTxQueued(tx.txStatus)
  const nonce = isMultisigExecutionInfo(tx.executionInfo) ? tx.executionInfo.nonce : undefined
  const isTrusted = !hasDefaultTokenlist || isTrustedTx(tx)
  const isImitationTransaction = isImitation(tx)
  const isPending = useIsPending(tx.id)
  const executionInfo = isMultisigExecutionInfo(tx.executionInfo) ? tx.executionInfo : undefined
  const expiredSwap = useIsExpiredSwap(tx.txInfo)

  return (
    <Box
      data-testid="transaction-item"
      className={classNames(css.gridContainer, {
        [css.history]: !isQueue,
        [css.conflictGroup]: isConflictGroup,
        [css.bulkGroup]: isBulkGroup,
        [css.untrusted]: !isTrusted || isImitationTransaction,
      })}
      id={tx.id}
    >
      {nonce !== undefined && !isConflictGroup && !isBulkGroup && (
        <Box gridArea="nonce" data-testid="nonce" className={css.nonce}>
          {nonce}
        </Box>
      )}

      {(isImitationTransaction || !isTrusted) && (
        <Box data-testid="warning" gridArea="nonce">
          <MaliciousTxWarning withTooltip={!isImitationTransaction} />
        </Box>
      )}

      <Box gridArea="type" data-testid="tx-type">
        <TxType tx={tx} />
      </Box>

      <Box gridArea="info" data-testid="tx-info">
        <TxInfo info={tx.txInfo} />
      </Box>

      <Box gridArea="date" data-testid="tx-date" className={css.date}>
        <DateTime value={tx.timestamp} />
      </Box>

      {isQueue && executionInfo && (
        <Box gridArea="confirmations">
          {executionInfo.confirmationsSubmitted > 0 || isPending ? (
            <TxConfirmations
              submittedConfirmations={executionInfo.confirmationsSubmitted}
              requiredConfirmations={executionInfo.confirmationsRequired}
            />
          ) : (
            <TxProposalChip />
          )}
        </Box>
      )}

      {isQueue && expiredSwap ? (
        <Box gridArea="status" justifyContent="flex-end" display="flex" className={css.status}>
          <StatusLabel status="expired" />
        </Box>
      ) : !isQueue || isPending ? (
        <Box gridArea="status" justifyContent="flex-end" display="flex" className={css.status}>
          <TxStatusLabel tx={tx} />
        </Box>
      ) : (
        ''
      )}

      {isQueue && !expiredSwap && (
        <Box gridArea="actions">
          <QueueActions tx={tx} />
        </Box>
      )}
    </Box>
  )
}

export default TxSummary
