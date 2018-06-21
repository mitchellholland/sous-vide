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
      const j = { temperature: parseFloat(anovaResponse.toString().trim()) }
      this.responseTemplate(j)
    })
  }

  respondWithSetTemperature = () => {
    responseFromWriteCallback(this.communicationCharacteristic, new Buffer('read set temp\r'), (anovaResponse) => {
      const j = { setTemperature: parseFloat(anovaResponse.toString().trim()) }
      this.responseTemplate(j)
    })
  }

  respondWithStatus = () => {
    responseFromWriteCallback(this.communicationCharacteristic, new Buffer('status\r'), (anovaResponse) => {
      const j = { status: anovaResponse.toString().trim() }
      this.responseTemplate(j)
    })
  }

  respondWithUnit = () => {
    responseFromWriteCallback(this.communicationCharacteristic, new Buffer('read unit\r'), (anovaResponse) => {
      const j = { unit: anovaResponse.toString().trim() }
      this.responseTemplate(j)
    })
  }

  respondWithTimer = () => {
    responseFromWriteCallback(this.communicationCharacteristic, new Buffer('read timer\r'), (anovaResponse) => {
      const j = { timer: anovaResponse.toString().trim() }
      this.responseTemplate(j)
    })
  }

  respondWithStart = () => {
    responseFromWriteCallback(this.communicationCharacteristic, new Buffer('start\r'), (anovaResponse) => {
      const j = { start: anovaResponse.toString().trim() }
      this.responseTemplate(j)
    })
  }

  respondWithStop = () => {
    responseFromWriteCallback(this.communicationCharacteristic, new Buffer('stop\r'), (anovaResponse) => {
      const j = { stop: anovaResponse.toString().trim() }
      this.responseTemplate(j)
    })
  }

  respondWithChangeSetTemperature = (temperature: number) => {
    responseFromWriteCallback(this.communicationCharacteristic, new Buffer(`set temp ${temperature}\r`), (anovaResponse) => {
      const j = { temperature: anovaResponse.toString().trim() }
      this.responseTemplate(j)
    })
  }

  respondWithChangeUnit = (celsius: boolean) => {
    const unit = celsius ? 'c' : 'f'
    responseFromWriteCallback(this.communicationCharacteristic, new Buffer(`set unit ${unit}\r`), (anovaResponse) => {
      const j = { unit: anovaResponse.toString().trim() }
      this.responseTemplate(j)
    })
  }

  respondWithStartTimer = () => {
    writeToCharacterisitc(this.communicationCharacteristic, new Buffer('start time\r'))
    this.responseTemplate({})
  }

  respondWithStopTimer = () => {
    writeToCharacterisitc(this.communicationCharacteristic, new Buffer('stop time\r'))
    this.responseTemplate({})
  }

  respondWithSetTimer = (minutes: number) => {
    responseFromWriteCallback(this.communicationCharacteristic, new Buffer(`set time ${minutes}\r`), (anovaResponse) => {
      const j = { timer: anovaResponse.toString().trim() }
      this.responseTemplate(j)
    })
  }

  responseTemplate = (json: object) => {
    this.serverResponse.writeHead(200)
    this.serverResponse.write(JSON.stringify(json))
    this.serverResponse.end()
  }
}