import noble = require('noble')
import { communication } from './anova'
import { startServer } from './server'

// Anova commands come from https://github.com/erikcw/pycirculate 
var connectedPeripheral: noble.Peripheral | null

console.log(`started ${__filename} ${Date()} `)

process.on('SIGINT', () => {
  if (connectedPeripheral !== null) {
    console.log(`connected peripheral to be disconnected: ${connectedPeripheral.uuid}`)
    connectedPeripheral.disconnect()
  }
  process.exit()
})

const connectToAnova = () => {
  communication('f0c77fd982d4', (peripheral, characteristic) => {
    console.log(`connected to device: ${peripheral.uuid}, char: ${characteristic.uuid}`)
    connectedPeripheral = peripheral
    startServer(characteristic)
  })
}

connectToAnova()