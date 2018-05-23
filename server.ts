import { createServer, ServerResponse } from 'http'
import { ResponseFiller } from './response'
import noble = require('noble')

export const startServer = (communicationCharacteristic: noble.Characteristic) => {
  const server = createServer((request, response) => {
    console.log(`${request.url}`)
    response.setHeader('Content-type', 'application/json')
    const filler = new ResponseFiller(communicationCharacteristic, response)
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
  }).listen(1111, () => {
    console.log('listening...')
  })
}
