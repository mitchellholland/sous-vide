import { ServerResponse } from 'http'
import { responseFromWriteCallback, writeToCharacterisitc } from './anova'
import noble = require('noble')

export class ResponseFiller {
  communicationCharacteristic: noble.Characteristic
  serverResponse: ServerResponse

  constructor(communicationCharacteristic: noble.Characteristic, serverResponse: ServerResponse) {
    this.communicationCharacteristic = communicationCharacteristic
    this.serverResponse = serverResponse
  }

  respondWithTemperature = () => {
    responseFromWriteCallback(this.communicationCharacteristic, new Buffer('read temp\r'), (anovaResponse) => {
      this.serverResponse.writeHead(200)
      const j = { temperature: parseFloat(anovaResponse.toString().trim()) }
      this.serverResponse.write(JSON.stringify(j))
      this.serverResponse.end()
    })
  }

  respondWithSetTemperature = () => {
    responseFromWriteCallback(this.communicationCharacteristic, new Buffer('read set temp\r'), (anovaResponse) => {
      this.serverResponse.writeHead(200)
      const j = { setTemperature: parseFloat(anovaResponse.toString().trim()) }
      this.serverResponse.write(JSON.stringify(j))
      this.serverResponse.end()
    })
  }

  respondWithStatus = () => {
    responseFromWriteCallback(this.communicationCharacteristic, new Buffer('status\r'), (anovaResponse) => {
      this.serverResponse.writeHead(200)
      const j = { status: anovaResponse.toString().trim() }
      this.serverResponse.write(JSON.stringify(j))
      this.serverResponse.end()
    })
  }

  respondWithUnit = () => {
    responseFromWriteCallback(this.communicationCharacteristic, new Buffer('read unit\r'), (anovaResponse) => {
      this.serverResponse.writeHead(200)
      const j = { unit: anovaResponse.toString().trim() }
      this.serverResponse.write(JSON.stringify(j))
      this.serverResponse.end()
    })
  }

  respondWithTimer = () => {
    responseFromWriteCallback(this.communicationCharacteristic, new Buffer('read timer\r'), (anovaResponse) => {
      this.serverResponse.writeHead(200)
      const j = { timer: anovaResponse.toString().trim() }
      this.serverResponse.write(JSON.stringify(j))
      this.serverResponse.end()
    })
  }

  respondWithStart = () => {
    responseFromWriteCallback(this.communicationCharacteristic, new Buffer('start\r'), (anovaResponse) => {
      this.serverResponse.writeHead(200)
      const j = { start: anovaResponse.toString().trim() }
      this.serverResponse.write(JSON.stringify(j))
      this.serverResponse.end()
    })
  }

  respondWithStop = () => {
    responseFromWriteCallback(this.communicationCharacteristic, new Buffer('stop\r'), (anovaResponse) => {
      this.serverResponse.writeHead(200)
      const j = { stop: anovaResponse.toString().trim() }
      this.serverResponse.write(JSON.stringify(j))
      this.serverResponse.end()
    })
  }

  respondWithChangeSetTemperature = (temperature: number) => {
    responseFromWriteCallback(this.communicationCharacteristic, new Buffer(`set temp ${temperature}\r`), (anovaResponse) => {
      this.serverResponse.writeHead(200)
      const j = { temperature: anovaResponse.toString().trim() }
      this.serverResponse.write(JSON.stringify(j))
      this.serverResponse.end()
    })
  }

  respondWithChangeUnit = (celsius: boolean) => {
    const unit = celsius ? 'c' : 'f'
    responseFromWriteCallback(this.communicationCharacteristic, new Buffer(`set unit ${unit}\r`), (anovaResponse) => {
      this.serverResponse.writeHead(200)
      const j = { unit: anovaResponse.toString().trim() }
      this.serverResponse.write(JSON.stringify(j))
      this.serverResponse.end()
    })
  }

  respondWithStartTimer = () => {
    writeToCharacterisitc(this.communicationCharacteristic, new Buffer('start time\r'))
    this.serverResponse.writeHead(200)
    this.serverResponse.end()
  }

  respondWithStopTimer = () => {
    writeToCharacterisitc(this.communicationCharacteristic, new Buffer('stop time\r'))
    this.serverResponse.writeHead(200)
    this.serverResponse.end()
  }

  respondWithSetTimer = (minutes: number) => {
    responseFromWriteCallback(this.communicationCharacteristic, new Buffer(`set time ${minutes}\r`), (anovaResponse) => {
      this.serverResponse.writeHead(200)
      const j = { timer: anovaResponse.toString().trim() }
      this.serverResponse.write(JSON.stringify(j))
      this.serverResponse.end()
    })
  }
}