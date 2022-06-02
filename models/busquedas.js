
const fs = require('fs');

const axios = require('axios')


class Busquedas {

    historial = []
    dbPath = './db/database.json'

    constructor() {
        //TODO : leer DB si existe
        this.leerDB()
    }

    get historialcapitalizado() {
        //Capitalizar cada palabra
        console.log(this.historial)
        return this.historial.map(info => {
            return info.replace(/\b\w/g, l => l.toUpperCase())
        })


    }

    get paramsMapbox() {
        return {
            'limit': 5,
            'language': 'es',
            'access_token': process.env.MAPBOX_KEY,
        }
    }

    get paramsOpenWeather() {
        return {
            'appid': process.env.OPENWEATHER_KEY,
            'units': 'metric',
            'lang': 'es'
        }
    }

    async ciudad(lugar = '') {

        //peticion http

        try {

            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapbox
            })

            const resp = await instance.get();
            return resp.data.features.map(lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }))

        } catch (err) {
            console.log(err)
            return [];
        }



    }

    async climaLugar(lat, lon) {

        try {
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: { ...this.paramsOpenWeather, lat, lon }
            })

            const resp = await instance.get();
            const { weather, main } = resp.data

            return {
                desc: weather[0].description,
                temp: main.temp,
                min: main.temp_min,
                max: main.temp_max,

            }







        } catch (err) {
            console.log(err)

        }

    }

    agregarHistorial(lugar = '') {

        //TODO: prevenir duplicados

        if (this.historial.includes(lugar.toLocaleLowerCase())) {
            return
        }
        this.historial = this.historial.splice(0, 4)

        this.historial.unshift(lugar.toLocaleLowerCase(),)

        //grabar en DB
        this.guardarDB()
    }

    guardarDB() {

        const payload = {
            historial: this.historial,
        }

        fs.writeFileSync(this.dbPath, JSON.stringify(payload))

    }
    leerDB() {

        if (!fs.existsSync(this.dbPath)) {
            return
        }

        const info = fs.readFileSync(this.dbPath, { encoding: 'utf-8' })
        const data = JSON.parse(info)

        this.historial = data.historial
        return data

    }
}

module.exports = Busquedas