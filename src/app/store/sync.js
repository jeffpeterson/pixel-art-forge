import Network from '../utils/networkutils'

window.Network = Network

window.net = new Network()
net.connect()

export const sync = store => next => action => {

  // console.log('ACTION', action)

  switch (action.type) {
    case 'CHANGE_DIMENSIONS':
    case 'DRAW_CELL':
    case 'SET_DRAWING':
    case 'SET_CELL_SIZE':
    case 'SET_RESET_GRID':
    case 'NEW_PROJECT':

  }

  return next(action);
}
