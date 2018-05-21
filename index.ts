import noble = require('noble')

// Anova commands come from https://github.com/erikcw/pycirculate 

console.log(`started ${__filename} ${Date()} `)

const targetID = 'f0c77fd982d4'
var connectedPeripheral: noble.Peripheral | null = null // this is only used for disconnecting on exit

process.on('SIGINT', () => {
  if (connectedPeripheral !== null) {
    console.log(`connected peripheral to be disconnected: ${connectedPeripheral.uuid}`)
    connectedPeripheral.disconnect()
    setTimeout(() => {
      process.exit()
    }, 1000);
  } else {
    noble.stopScanning(() => {
      process.exit()
    })
  }
})

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
  console.log(`discover... ${peripheral.id} ${peripheral.uuid}`)
  if (targetID === peripheral.id) {
    noble.stopScanning()
    handlePeripheral(peripheral)
  }
})

noble.on('warning', (message: string|null) => {
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
    connectedPeripheral = peripheral
    peripheral.discoverSomeServicesAndCharacteristics(['ffe0'], ['ffe1'], (error: string | null, services, characteristics) => {
      if (error !== null) {
        console.error(`error: ${error}`)
      }
      characteristics.forEach(characteristic => {
        if (characteristic.uuid == 'ffe1') {
          handleCharacterisitic(characteristic)
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

const handleCharacterisitic = (characteristic: noble.Characteristic) => {
  console.log(`char: ${characteristic.uuid} ${characteristic}`)
  characteristic.subscribe((error: string | null) => {
    console.log(`${characteristic.uuid} subscribed`)
    if (error !== null) {
      console.error(`subscribe error: ${error}?`)
    }
    deviceReady(characteristic)
  })
}

const deviceReady = (characteristic: noble.Characteristic) => {
  setTimeout(async () => {
    console.log(`response: ${await responseFromWrite(characteristic, new Buffer('read temp\r'))}`)
    console.log(`response: ${await responseFromWrite(characteristic, new Buffer('status\r'))}`)
    console.log(`response: ${await responseFromWrite(characteristic, new Buffer('read unit\r'))}`)
  }, 1000);
}

const responseFromWrite = (characteristic: noble.Characteristic, value: Buffer) => {
  characteristic.write(value, true, (error: string | null) => {
    if (error !== null) {
      console.error(`error writing value to device ${error}`)
    }
    // console.log(`characteristic.write(value...`)
  })
  return new Promise((resolve, reject) => {
    characteristic.once('data', async (data: Buffer, isNotification: boolean) => {
      // console.log(`characteristic.once('data' ...`)
      resolve(data)
    })
  })
}

