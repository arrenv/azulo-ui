import { createStyles, makeStyles } from '@material-ui/core'
import {
  background,
  boldFont,
  border,
  error,
  fontColor,
  lg,
  md,
  secondaryText,
  sm,
  smallFontSize,
  xl,
} from 'src/theme/variables'

export const useStyles = makeStyles(
  createStyles({
    title: {
      padding: lg,
      paddingBottom: 0,
    },
    hide: {
      '&:hover': {
        backgroundColor: '#f7f5f5',
      },
      '&:hover $actions': {
        visibility: 'initial',
      },
    },
    actions: {
      justifyContent: 'flex-end',
      visibility: 'hidden',
    },
    noBorderBottom: {
      '& > td': {
        borderBottom: 'none',
      },
    },
    annotation: {
      paddingLeft: lg,
    },
    ownersText: {
      color: secondaryText,
      '& b': {
        color: fontColor,
      },
    },
    container: {
      padding: lg,
    },
    actionButton: {
      fontWeight: boldFont,
      marginRight: sm,
    },
    buttonRow: {
      marginTop: '30px'
    },
    modifyBtn: {
      height: xl,
      fontSize: smallFontSize,
    },
    removeModuleIcon: {
      marginLeft: lg,
      cursor: 'pointer',
    },
    modalHeading: {
      boxSizing: 'border-box',
      justifyContent: 'space-between',
      height: '74px',
      padding: `${sm} ${lg}`,
    },
    modalContainer: {
      minHeight: '369px',
    },
    modalManage: {
      fontSize: lg,
    },
    modalClose: {
      height: '35px',
      width: '35px',
    },
    modalButtonRow: {
      height: '84px',
      justifyContent: 'center',
    },
    modalButtonRemove: {
      color: '#fff',
      backgroundColor: error,
      height: '42px',
    },
    modalName: {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
    },
    modalUserName: {
      whiteSpace: 'nowrap',
    },
    modalOwner: {
      backgroundColor: background,
      padding: md,
      alignItems: 'center',
    },
    modalUser: {
      justifyContent: 'left',
    },
    modalDescription: {
      padding: md,
    },
    modalOpen: {
      paddingLeft: sm,
      width: 'auto',
      '&:hover': {
        cursor: 'pointer',
      },
    },
    amountInput: {
      width: '100% !important',
    },
    gasCostsContainer: {
      backgroundColor: background,
      padding: `0 ${lg}`,
    },
  }),
)
