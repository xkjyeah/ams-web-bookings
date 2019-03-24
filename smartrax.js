const axios = require('axios');
const jsdom = require('jsdom');
const querystring = require('querystring');

class LoginHelper {
  constructor () {
    this.lastQueried = null
    this.cookieHeaders = null
  }

  async cookies() {
    if (this.lastQueried === null ||
      this.lastQueried + 3600e3 < Date.now()) {

      try {
        const r = await axios.get('https://www.smartrax.com.sg/')
        const doc = new jsdom.jsdom(r.data)

        // extract the form
        const data = [...doc.querySelector('form').querySelectorAll('input')]
          .reduce(
            (acc, i) => {acc[i.name] = i.value; return acc},
            {}
          )

        const cookies = r.headers['set-cookie'].map(c => c.split(';')[0]).join(';')

        const loginResult = await axios.post('https://www.smartrax.com.sg/LoginSG.aspx', querystring.stringify({
          ...data,
          txtUserId: process.env.SMARTTRAX_USERNAME,
          txtPwd: process.env.SMARTTRAX_PASSWORD,
          btnLogin: 'Login',
        }), {headers: {cookie: cookies}})

        this.lastQueried = Date.now()
        this.cookieHeaders = {cookie: cookies}

        return this.cookieHeaders
      } catch (e) {
        // Any error -- consider no result, try login again
        this.lastQueried = null
        this.cookieHeaders = null
        throw e
      }
    } else {
      return this.cookieHeaders
    }
  }
}

const helper = new LoginHelper()

async function pollVehicleLocations() {
  const dataResult = await axios.get(
    'https://www.smartrax.com.sg/GetSnapShotData.aspx?DataType=SnapShots',
    {headers: await helper.cookies()}
  )
  const vehiclesData = new jsdom.jsdom(dataResult.data, {contentType: 'application/xml'})

  const vehicles = [...vehiclesData.querySelectorAll('Result')]
    .map(result => ({
      registrationNumber: result.querySelector('REGISTRATIONNO').textContent,
      lat: result.querySelector('LATITUDE').textContent,
      lng: result.querySelector('LONGITUDE').textContent,
      speed: result.querySelector('SPEED').textContent,
      created: result.querySelector('GPS_DATETIME').textContent,
      driveName: result.querySelector('DRIVER_NAME').textContent,
      driverTelephone: result.querySelector('DRIVER_MOBILEPHONE').textContent,
      ignition: result.querySelector('IGNITION').textContent,
      location: result.querySelector('LOCATION').textContent,
      groupIconName: result.querySelector('GROUP_ICON_NAME').textContent,
      direction: result.querySelector('DIRECTION').textContent,
      vehicleType: result.querySelector('VEHICLE_TYPE').textContent,
      vehicleStatus: result.querySelector('VEHICLESTATUS').textContent,
    }))

  return vehicles
}

module.exports = {
  pollVehicleLocations
}