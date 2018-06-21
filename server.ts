import noble = require('noble')
import { createServer, ServerResponse, IncomingMessage } from 'http'
import { ResponseFiller } from './response'
import { AddressInfo } from 'net';
import { communication } from './anova'

// Anova commands come from https://github.com/erikcw/pycirculate 
var connectedPeripheral: noble.Peripheral | null // keeping this global so it can be disconnected correctly on application exit
var communicationCharacteristic: noble.Characteristic | null // global instead of rediscovering it from the peripheral each time

export const startServer = () => {

  // passing in `communicationCharacteristic` even though its in scope, so it doesn't have to be responsible for checking
  // or re-connecting to the device. `fillResponse` should be free to not worry about the connectivity of the device
  const fillResponse = (request: IncomingMessage, response: ServerResponse, characteristic: noble.Characteristic) => {
    console.log(`${request.url} ${characteristic.uuid}`)
    response.setHeader('Content-type', 'application/json')
    const filler = new ResponseFiller(characteristic, response)
    if (request.method === 'GET') {
      switch (request.url) {
        case '/temperature':
          filler.respondWithTemperature()
          break
        case '/setTemperature':
          filler.respondWithSetTemperature()
          break
        case '/status':
          filler.respondWithStatus()
          break
        case '/unit':
          filler.respondWithUnit()
          break
        case '/timer':
          filler.respondWithTimer()
          break
        default:
          response.writeHead(404)
          response.end()
          break
      }
    } else if (request.method === 'POST') {

      let body = ''
      request.on('data', data => {
        body += data.toString()
      })
      request.on('end', () => {
        var json: any = {}
        if (body !== '') {
          json = JSON.parse(body)
          console.log(`body: ${body}`)
        }
        switch (request.url) {
          case '/start':
            filler.respondWithStart()
            break
          case '/stop':
            filler.respondWithStop()
            break
          case '/temperature':
            filler.respondWithChangeSetTemperature(json.temperature)
            break
          case '/unit':
            filler.respondWithChangeUnit(json.celsius)
            break
          case '/setTimer':
            filler.respondWithSetTimer(json.timerMinutes)
            break
          case '/timer':
            json.timer ? filler.respondWithStartTimer() : filler.respondWithStopTimer()
            break
          default:
            response.writeHead(404)
            response.end()
            break
        }
      })
    } else {
      response.writeHead(405)
      response.end()
    }
  }

  const server = createServer((request, response) => {
    if (connectedPeripheral == null || communicationCharacteristic == null) {
      console.log(`createServer: needs reconnecting`)
      // if not connected to device, reconnect then fill response
      communication('f0c77fd982d4', (peripheral, characteristic) => {
        console.log(`connected to device: ${peripheral.uuid}, char: ${characteristic.uuid}`)
        connectedPeripheral = peripheral
        communicationCharacteristic = characteristic

        // wait for device to stablise before getting data
        setTimeout(() => {
          fillResponse(request, response, characteristic)
        }, 1000)
      })
    } else {
      console.log(`createServer: (connected) ${connectedPeripheral.uuid}, ${communicationCharacteristic.uuid}`)
      fillResponse(request, response, communicationCharacteristic)
    }
  })

  server.on('listening', () => {
    const address = server.address() as AddressInfo
    console.log(`listening... (${address.family} ${address.address}:${address.port})`)
  })

  server.listen(5555, () => {
    console.log('listen started...')
  })
}

process.on('SIGINT', () => {
  if (connectedPeripheral != null) {
    console.log(`connected peripheral to be disconnected: ${connectedPeripheral.uuid}`)
    connectedPeripheral.disconnect(() => {
      console.log(`disconnected from peripheral`)
    })
  }
  process.exit(0)
})