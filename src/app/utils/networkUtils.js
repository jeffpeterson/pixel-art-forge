import EventEmitter from 'events'

import IPFS from 'ipfs'
import Room from 'ipfs-pubsub-room'


export default class Network extends EventEmitter {
  constructor() {
    super()

    const ipfs = new IPFS({
      repo: 'ipfs/pubsub-demo/' + Math.random(),
      EXPERIMENTAL: {
        pubsub: true
      },
      config: {
        "Addresses": {
          "API": "",
          "Gateway": "",
          "Swarm": [
            "/ip4/0.0.0.0/tcp/0",
        ]}}
    })

    this.Peers = {}
    this.ipfs = ipfs
    this.selfInfo = null
    this.connected = false
    this.ready = false
    this.broadcastQueue = []
  }

  connect() {
    if (this.connected) throw "network already connected - disconnect first"

    this.ipfs.once('ready', () => this.ipfs.id((err, info) => {
      if (err) { throw err }
      console.log('IPFS node ready with address ' + info.id)
      this.ready = true
      this.selfInfo = info

      this.room = Room(this.ipfs, 'pixel-forge-experiment')

      this.broadcastQueue.forEach(x => this.broadcast(x))
      this.broadcastQueue = []

      this.room.on('peer joined', (peer) => { this.peerJoined(peer)} )
      this.room.on('peer left', (peer) => { this.peerLeft(peer) } )
      this.room.on('message', (message) => { this.message(message)} )
    }))

    this.connected = true
  }

  peerJoined(peer) {
    console.log('peer ' + peer + ' joined')
    if (peer == this.selfInfo.id) { return }

    this.Peers[peer] = true
  }

  peerLeft(peer) {
    console.log('peer ' + peer + ' left')
    delete this.Peers[peer]
  }

  broadcast(msg) {
    if (this.ready) {
      this.room.broadcast(JSON.stringify(msg))
    } else {
      this.broadcastQueue.push(msg)
    }
  }

  message(message) {
    console.log('Automerge.Connection> receive ' + message.from + ': ' + message.data.toString())
    let contents = JSON.parse(message.data.toString());
    this.emit("message", message.from, contents)
  }

  disconnect() {
    if (this.connected == false) throw "network already disconnected - connect first"
    console.log("NETWORK DISCONNECT")
    this.ipfs.stop()
    this.connected = false
  }
}
