import EventEmitter from 'events'

import IPFS from 'ipfs'
import Room from 'ipfs-pubsub-room'
// import Automerge from 'automerge'

export default class Network extends EventEmitter {
  constructor(docSet) {
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
    this.peerMetadata = {}

    this.selfInfo = null;
    this.name = 'Unset Name'

    this.ipfs = ipfs

    this.docSet = docSet

    this.connected = false
  }

  connect() {
    if (this.connected) throw "network already connected - disconnect first"

    this.ipfs.once('ready', () => this.ipfs.id((err, info) => {
      if (err) { throw err }
      console.log('IPFS node ready with address ' + info.id)
      this.selfInfo = info

      this.room = Room(this.ipfs, 'ampl-experiment')
      this.room.on('peer joined', (peer) => { this.peerJoined(peer)} )
      this.room.on('peer left', (peer) => { this.peerLeft(peer) } )
      this.room.on('message', (message) => { this.message(message)} )
    }))

    this.connected = true
  }

  peerJoined(peer) {
    console.log('peer ' + peer + ' joined')
    if (peer == this.selfInfo.id) { return }
    if (!this.Peers[peer]) {
      this.Peers[peer] = true
      // this.Peers[peer] = new Automerge.Connection(this.docSet, msg => {
      //   console.log('Automerge.Connection> send to ' + peer + ':', msg)
      //   this.room.sendTo(peer, JSON.stringify(msg))
      // })

      // this.Peers[peer].open()
    }

    return this.Peers[peer]
  }

  peerLeft(peer) {
    console.log('peer ' + peer + ' left')
    delete this.Peers[peer]
  }

  message(message) {
    console.log('Automerge.Connection> receive ' + message.from + ': ' + message.data.toString())
    let contents = JSON.parse(message.data.toString());
    if (contents.metadata) {
      this.receivePeerMetadata()
    }
    // we'll send this message to automerge too, just in case there are clocks or deltas included with it
    // this.Peers[message.from].receiveMsg(contents)
  }

  generatePeerMetadata() {
    return { metadata: {
      name: this.name,
      // xxx: todo: docid
    }}
  }

  setName(name) {
    this.name = name
  }

  broadcastPeerMetadata() {
    this.room.broadcast(JSON.stringify(this.generatePeerMetadata()))
  }

  sendPeerMetadata(peer) {
    this.room.sendTo(peer, JSON.stringify(this.generatePeerMetadata()))
  }

  receivePeerMetadata(message, contents) {
    console.log("Received a peer metadata update from ", message.from)
    // TODO: input validation...
    this.peerMetadata[message.from] = contents
  }

  broadcastActiveDocId(docId) {
    // todo: this.webRTCSignaler.broadcastActiveDocId(docId)
  }

  getPeerDocs() {
    // todo: return this.webRTCSignaler.getPeerDocs()
  }

  disconnect() {
    if (this.connected == false) throw "network already disconnected - connect first"
    console.log("NETWORK DISCONNECT")
    this.ipfs.stop()
    this.connected = false
  }
}
