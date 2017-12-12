import Network from '../utils/networkUtils'

export const sync = store => {
  const net = new Network()
  net.connect()

  window.net = net

  net.on('message', (peer, msg) => {
    store.dispatch(Object.assign({}, msg, {
      type: `REMOTE_${msg.type}`,
    }))
  })

  return next => action => {

    switch (action.type) {
      case 'CHANGE_DIMENSIONS':
      // case 'DRAW_CELL':
      case 'SET_DRAWING':
      case 'SET_CELL_SIZE':
      // case 'SET_RESET_GRID':
      // case 'NEW_PROJECT':
        net.broadcast(action)
    }

    return next(action);
  }
}
