import noble = require('noble')

export const communication = (targetID: string, callback: (peripheral: noble.Peripheral, communicationCharacteristic: noble.Characteristic) => void) => {

  noble.on('stateChange', state => {
    console.log(`stateChange... ${state}`)
    if (state === 'poweredOn') {
      noble.startScanning()
    } else {
      noble.stopScanning()
    }
  })

  noble.on('scanStart', () => {
    console.log('scanStart...')
  })

  noble.on('scanStop', () => {
    console.log('scanStop...')
  })

  noble.on('discover', peripheral => {
    console.log(`discover... ${peripheral.id}`)
    if (targetID === peripheral.id) {
      noble.stopScanning()
      handlePeripheral(peripheral)
    }
  })

  noble.on('warning', (message: string | null) => {
    console.error(`noble warning: ${message}`)
    process.exit()
  })

  const handlePeripheral = (peripheral: noble.Peripheral) => {

    peripheral.connect((error: string | null) => {
      console.log(`connect started to: ${peripheral.id}`)
      if (error !== null) {
        console.error(`error connect started a peripheral: ${error}`)
      }
    })

    peripheral.once('connect', (error: string | null) => {
      console.log(`connected to: ${peripheral.id}`)
      if (error !== null) {
        console.error(`error connecting to a peripheral: ${error}`)
      }
      peripheral.discoverSomeServicesAndCharacteristics(['ffe0'], ['ffe1'], (error: string | null, services, characteristics) => {
        if (error !== null) {
          console.error(`error: ${error}`)
        }
        characteristics.forEach(characteristic => {
          if (characteristic.uuid == 'ffe1') {
            handleCharacterisitic(peripheral, characteristic)
          }
        })
      })
    })

    peripheral.once('disconnect', (error: string | null) => {
      console.log(`disconnected from: ${peripheral.uuid}`)
      if (error !== null) {
        console.error(`error disconnecting from peripheral: ${error}`)
      }
      process.exit()
    })
  }

  const handleCharacterisitic = (peripheral: noble.Peripheral, characteristic: noble.Characteristic) => {
    console.log(`char: ${characteristic.uuid} ${characteristic}`)
    characteristic.subscribe((error: string | null) => {
      console.log(`${characteristic.uuid} subscribed`)
      if (error !== null) {
        console.error(`subscribe error: ${error}?`)
      }
      callback(peripheral, characteristic)
    })
  }
}

export const writeToCharacterisitc = (characteristic: noble.Characteristic, value: Buffer) => {
  characteristic.write(value, true, (error: string | null) => {
    if (error !== null) {
      console.error(`error writing value to device ${error}`)
    }
  })
}

const responseFromWritePromise = (characteristic: noble.Characteristic, value: Buffer) => {
  writeToCharacterisitc(characteristic, value)
  return new Promise((resolve, reject) => {
    characteristic.once('data', async (data: Buffer, isNotification: boolean) => {
      resolve(data)
    })
  })
}

export const responseFromWriteCallback = (characteristic: noble.Characteristic, value: Buffer, callback: (response: Buffer) => void) => {
  writeToCharacterisitc(characteristic, value)
  characteristic.once('data', (data: Buffer, isNotification: boolean) => {
    callback(data)
  })
}
