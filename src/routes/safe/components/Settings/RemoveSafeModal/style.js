// @flow
import {
  lg, md, sm, error, background,
} from '~/theme/variables'

export const styles = (theme: Object) => ({
  heading: {
    padding: `${sm} ${lg}`,
    justifyContent: 'space-between',
    maxHeight: '75px',
    boxSizing: 'border-box',
  },
  container: {
    minHeight: '369px',
  },
  manage: {
    fontSize: '24px',
  },
  close: {
    height: '35px',
    width: '35px',
  },
  buttonRow: {
    height: '84px',
    justifyContent: 'center',
  },
  buttonRemove: {
    color: '#fff',
    backgroundColor: error,
  },
  name: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  userName: {
    whiteSpace: 'nowrap',
  },
  owner: {
    backgroundColor: background,
    padding: md,
    alignItems: 'center',
  },
  user: {
    justifyContent: 'left',
  },
  description: {
    padding: md,
  },
  open: {
    paddingLeft: sm,
    width: 'auto',
    '&:hover': {
      cursor: 'pointer',
    },
  },
})