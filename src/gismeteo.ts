import axios, { AxiosRequestConfig } from 'axios'
import moment from 'moment'
import { Cheerio, CheerioAPI, Element, load } from 'cheerio'
import UserAgent from 'user-agents'
import is_number from 'is-number'

import { Endpoint, Unit, Wildcard } from './common/constants'
import { GismeteoCityError, GismeteoConnectionError } from './common/errors'
import { CityUri, GismeteoMonth, GismeteoNow, GismeteoOptions, GismeteoTwoWeeks, GismeteoOneDay, GismeteoTenDays } from './common/types'

export class Gismeteo {
  private _base_url: Endpoint
  private _unit: {
    temp: Unit
    pressure: Unit
    wind: Unit
  }
  private readonly _axios_config: AxiosRequestConfig = {
    headers: {
      'user-agent': new UserAgent().toString(),
    },
  }
  private _city_cache = {
    city: '',
    city_uri: '' as CityUri,
  }

  constructor(options?: GismeteoOptions) {
    this._base_url = options?.lang === 'en' ? Endpoint.BASE_EN : Endpoint.BASE_RU
    this._unit = {
      temp: options?.unit_temp === 'F' ? Unit.TEMP_F : Unit.TEMP_C,
      pressure: options?.unit_pressure === 'hPa' ? Unit.PRESSURE_HPA : Unit.PRESSURE_MMHG,
      wind: options?.unit_wind === 'kmh' ? Unit.WIND_KMH : Unit.WIND_MS,
    }
  }

  /**
   * It takes a city name, then makes a request to the two weeks endpoint, parses
   * the HTML, and returns an array of GismeteoTwoWeeks
   * @param {string} city - string - the name of the city you want to get the weather for
   * @returns An array of GismeteoTwoWeeks
   */
  public async getTwoWeeks(city: string): Promise<GismeteoTwoWeeks[]> {
    const city_uri = await this.getCityUri(city)

    return axios
      .get(`${this._base_url}${city_uri}${Endpoint.TWOWEEKS}`, this._axios_config)
      .then(({ data }) => {
        const $ = load(this.prepareHtml(data))
        const times = this.parseDates($, Wildcard.TWOWEEKS_DATE)

        const out = this.makeCollection<GismeteoTwoWeeks>({
          dt: times,
          tmax: this.parseValue<number>($, Wildcard.TWOWEEKS_TMAX),
          tmin: this.parseValue<number>($, Wildcard.TWOWEEKS_TMIN),
          tavg: this.parseValue<number>($, Wildcard.TWOWEEKS_TAVG),
          pressure: this.parseValue<number>($, Wildcard.TWOWEEKS_PRESSURE),
          wind_speed: this.parseValue<number>($, Wildcard.TWOWEEKS_WINDSPEED),
          wind_gust: this.parseValue<number>($, Wildcard.TWOWEEKS_WINDGUST),
          wind_dir: this.parseValue<string>($, Wildcard.TWOWEEKS_WINDDIR),
          precipitation: this.parseValue<number>($, Wildcard.TWOWEEKS_PRECIPITATION),
          humidity: this.parseValue<number>($, Wildcard.TWOWEEKS_HUMIDITY),
          summary: this.parseAttr<string>($, Wildcard.TWOWEEKS_SUMMARY, 'data-text'),
          geomagnetic: this.parseValue<number>($, Wildcard.TWOWEEKS_GEOMAGNETIC),
          road_condition:
            $(Wildcard.TWOWEEKS_ROADS).length > 0
              ? this.parseValue<string>($, Wildcard.TWOWEEKS_ROADS)
              : new Array(times.length).fill('unknown'),
          pollen_birch:
            $(Wildcard.TWOWEEKS_POLLEN_BIRCH).length > 0
              ? this.parseValue<number>($, Wildcard.TWOWEEKS_POLLEN_BIRCH)
              : new Array(times.length).fill(0),
          pollen_grass:
            $(Wildcard.TWOWEEKS_POLLEN_GRASS).length > 0
              ? this.parseValue<number>($, Wildcard.TWOWEEKS_POLLEN_GRASS)
              : new Array(times.length).fill(0),
          pollen_ragweed:
            $(Wildcard.TWOWEEKS_POLLEN_RAGWEED).length > 0
              ? this.parseValue<number>($, Wildcard.TWOWEEKS_POLLEN_RAGWEED)
              : new Array(times.length).fill(0),
        })

        return out
      })
      .catch((err) => {
        if (err instanceof GismeteoCityError) {
          throw err
        } else {
          throw new GismeteoConnectionError(err)
        }
      })
  }

  /**
   * It takes a city name as a parameter, then makes a request
   * to the Gismeteo for the month forecast, parses the HTML response, and returns the forecast as
   * an array of GismeteoMonth
   * @param {string} city - string - the name of the city you want to get the weather for
   * @returns An array of GismeteoMonth
   */
  public async getMonth(city: string): Promise<GismeteoMonth[]> {
    const city_uri = await this.getCityUri(city)

    return axios
      .get(`${this._base_url}${city_uri}${Endpoint.MONTH}`, this._axios_config)
      .then(({ data }) => {
        const $ = load(this.prepareHtml(data))

        const out = this.makeCollection<GismeteoMonth>({
          dt: this.parseDates($, Wildcard.MONTH_DATE),
          tmax: this.parseValue<number>($, Wildcard.MONTH_TMAX),
          tmin: this.parseValue<number>($, Wildcard.MONTH_TMIN),
        })

        return out
      })
      .catch((err) => {
        if (err instanceof GismeteoCityError) {
          throw err
        } else {
          throw new GismeteoConnectionError(err)
        }
      })
  }

  /**
   * It takes a city name, then makes a request to the Gismeteo and returns
   * the data
   * @param {string} city - string - the name of the city you want to get the weather for
   */
  public async getNow(city: string): Promise<GismeteoNow> {
    const city_uri = await this.getCityUri(city)

    return axios
      .get(`${this._base_url}${city_uri}${Endpoint.NOW}`, this._axios_config)
      .then(({ data }) => {
        const $ = load(this.prepareHtml(data))

        const out: GismeteoNow = {
          temp: this.numberify($(this.unitToWildcard(Wildcard.NOW_TEMP)).text()),
          temp_feels: this.numberify($(this.unitToWildcard(Wildcard.NOW_TEMPFEELS)).text()),
          wind_speed: this.numberify(this.parentText($, Wildcard.NOW_WINDSPEED)),
          wind_dir: $(this.unitToWildcard(Wildcard.NOW_WINDDIR)).last().text(),
          pressure: this.numberify(this.parentText($, Wildcard.NOW_PRESSURE)),
          humidity: this.numberify($(Wildcard.NOW_HUMIDITY).text()),
          summary: $(Wildcard.NOW_SUMMARY).text(),
          geomagnetic: this.numberify($(Wildcard.NOW_GEOMAGNETIC).text()),
          water_temp: this.numberify($(this.unitToWildcard(Wildcard.NOW_WATER)).text()),
          sunrise: moment(moment().format('DD MMM YYYY') + ' ' + $(Wildcard.NOW_SUNRISE).text(), 'DD MMM YYYY H:mm').unix(),
          sunset: moment(moment().format('DD MMM YYYY') + ' ' + $(Wildcard.NOW_SUNSET).text(), 'DD MMM YYYY H:mm').unix(),
          image: $(Wildcard.NOW_IMAGE).attr('style')?.replace("background-image: url('", '').replace("')", ''),
        }

        return out
      })
      .catch((err) => {
        if (err instanceof GismeteoCityError) {
          throw err
        } else {
          throw new GismeteoConnectionError(err)
        }
      })
  }

  /**
   * It takes a city name, then makes a request to the Gismeteo, parses the
   * HTML, and returns an array of GismeteoTomorrow with the weather data
   * @param {string} city - string - the name of the city you want to get the weather for
   * @returns An array of GismeteoTomorrow
   */
  public async getTomorrow<GismeteoTomorrow>(city: string): Promise<GismeteoTomorrow[]> {
    const city_uri = await this.getCityUri(city)

    return this.getOneDay(`${this._base_url}${city_uri}${Endpoint.TOMMOROW}`)
  }

  /**
   * It takes a city name, then makes a request to the Gismeteo, parses the
   * HTML, and returns an array of GismeteoToday with the weather data
   * @param {string} city - string - the name of the city you want to get the weather for
   * @returns An array of GismeteoToday
   */
  public async getToday<GismeteoToday>(city: string): Promise<GismeteoToday[]> {
    const city_uri = await this.getCityUri(city)

    return this.getOneDay(`${this._base_url}${city_uri}`)
  }

  private async getOneDay<T>(url: string): Promise<T[]> {
    return axios
      .get(url, this._axios_config)
      .then(({ data }) => {
        const $ = load(this.prepareHtml(data))
        const times = this.parseAttr<string>($, Wildcard.ONEDAY_TIME, 'title')

        const out = this.makeCollection<Partial<GismeteoOneDay>>({
          dt: this.parseDtFromStringArray(times),
          temp: this.parseValue<number>($, Wildcard.ONEDAY_TEMP),
          pressure: this.parseValue<number>($, Wildcard.ONEDAY_PRESSURE),
          wind_speed: this.parseValue<number>($, Wildcard.ONEDAY_WINDSPEED),
          wind_gust: this.parseValue<number>($, Wildcard.ONEDAY_WINDGUST),
          wind_dir: this.parseValue<string>($, Wildcard.ONEDAY_WINDDIR),
          precipitation: this.parseValue<number>($, Wildcard.ONEDAY_PRECIPITATION),
          humidity: this.parseValue<number>($, Wildcard.ONEDAY_HUMIDITY),
          summary: this.parseAttr<string>($, Wildcard.ONEDAY_SUMMARY, 'data-text'),
          geomagnetic: this.parseValue<number>($, Wildcard.ONEDAY_GEOMAGNETIC),
          road_condition:
            $(Wildcard.ONEDAY_ROADS).length > 0
              ? this.parseValue<string>($, Wildcard.ONEDAY_ROADS)
              : new Array(times.length).fill('unknown'),
          pollen_birch:
            $(Wildcard.ONEDAY_POLLEN_BIRCH).length > 0
              ? this.parseValue<number>($, Wildcard.ONEDAY_POLLEN_BIRCH)
              : new Array(times.length).fill(0),
          pollen_grass:
            $(Wildcard.ONEDAY_POLLEN_GRASS).length > 0
              ? this.parseValue<number>($, Wildcard.ONEDAY_POLLEN_GRASS)
              : new Array(times.length).fill(0),
          pollen_ragweed:
            $(Wildcard.ONEDAY_POLLEN_RAGWEED).length > 0
              ? this.parseValue<number>($, Wildcard.ONEDAY_POLLEN_RAGWEED)
              : new Array(times.length).fill(0),
        })

        return out as T[]
      })
      .catch((err) => {
        if (err instanceof GismeteoCityError) {
          throw err
        } else {
          throw new GismeteoConnectionError(err)
        }
      })
  }

  /**
   * It takes a city name, then makes a request to the Gismeteo, parses the
   * HTML, and returns an array of GismeteoTenDays with the weather data
   * @param {string} city - string - the name of the city you want to get the weather for
   * @returns An array of GismeteoTenDays.
   */
  public async getTenDays(city: string): Promise<GismeteoTenDays[]> {
    const city_uri = await this.getCityUri(city)

    return axios
      .get(`${this._base_url}${city_uri}${Endpoint.TENDAYS}`, this._axios_config)
      .then(({ data }) => {
        const $ = load(this.prepareHtml(data))
        const times = this.parseDatesFromDaytime($, Wildcard.TENDAYS_TIME)

        const out = this.makeCollection<GismeteoTenDays>({
          dt: times,
          temp: this.parseValue<number>($, Wildcard.ONEDAY_TEMP),
          pressure: this.parseValue<number>($, Wildcard.ONEDAY_PRESSURE),
          wind_speed: this.parseValue<number>($, Wildcard.ONEDAY_WINDSPEED),
          wind_gust: this.parseValue<number>($, Wildcard.ONEDAY_WINDGUST),
          wind_dir: this.parseValue<string>($, Wildcard.ONEDAY_WINDDIR),
          precipitation: this.parseValue<number>($, Wildcard.ONEDAY_PRECIPITATION),
          humidity: this.parseValue<number>($, Wildcard.ONEDAY_HUMIDITY),
          summary: this.parseAttr<string>($, Wildcard.ONEDAY_SUMMARY, 'data-text'),
          geomagnetic: this.parseValue<number>($, Wildcard.ONEDAY_GEOMAGNETIC),
          road_condition:
            $(Wildcard.ONEDAY_ROADS).length > 0
              ? this.parseValue<string>($, Wildcard.ONEDAY_ROADS)
              : new Array(times.length).fill('unknown'),
          pollen_birch:
            $(Wildcard.ONEDAY_POLLEN_BIRCH).length > 0
              ? this.parseValue<number>($, Wildcard.ONEDAY_POLLEN_BIRCH)
              : new Array(times.length).fill(0),
          pollen_grass:
            $(Wildcard.ONEDAY_POLLEN_GRASS).length > 0
              ? this.parseValue<number>($, Wildcard.ONEDAY_POLLEN_GRASS)
              : new Array(times.length).fill(0),
          pollen_ragweed:
            $(Wildcard.ONEDAY_POLLEN_RAGWEED).length > 0
              ? this.parseValue<number>($, Wildcard.ONEDAY_POLLEN_RAGWEED)
              : new Array(times.length).fill(0),
        })

        out.forEach((item, index) => {
          if (item.geomagnetic === undefined) {
            out[index].geomagnetic = 0
          }
        })

        return out
      })
      .catch((err) => {
        if (err instanceof GismeteoCityError) {
          throw err
        } else {
          throw new GismeteoConnectionError(err)
        }
      })
  }

  /**
   * "If the city is in the cache, return the city uri from the cache, otherwise, make a request to the
   * Gismeteo API to get the city uri and then cache it."
   *
   * @param {string} city - string - the name of the city you want to get the weather for
   * @returns The city_uri is being returned.
   */
  private async getCityUri(city: string): Promise<CityUri> {
    if (city === this._city_cache.city) {
      return Promise.resolve(this._city_cache.city_uri)
    }

    return axios
      .get(`${Endpoint.SEARCH}${encodeURIComponent(city)}/9/`, this._axios_config)
      .then(({ data }) => {
        if (data.data.length === 0 || data.data[0]?.url === undefined) {
          throw new GismeteoCityError('Unable to find uri for given city name')
        }
        this._city_cache = {
          city: city,
          city_uri: data.data[0].url,
        }
        return data.data[0].url
      })
      .catch((err) => {
        if (err instanceof GismeteoCityError) {
          throw err
        } else {
          throw new GismeteoConnectionError(err)
        }
      })
  }

  private parseDates($: CheerioAPI, wildcard: Wildcard): number[] {
    const search = $(wildcard)
    const start_date = moment(search.first().text() + moment().format('YYYY'), 'DD MMMYYYY', 'ru')
    const out: number[] = []

    for (let i = 0; i < search.length; i++) {
      out.push(start_date.add(i > 0 ? 1 : 0, 'day').unix())
    }

    return out
  }

  private parseDtFromStringArray(input: string[]): number[] {
    const out: number[] = []
    for (let i = 0; i < input.length; i++) {
      const strip_date = input[i].split(', UTC: ')[1] ? input[i].split(', UTC: ')[1] : input[i].split('от: ')[1].replace(' (UTC)', '')

      out.push(moment(strip_date, 'YYYY-MM-DD HH:mm:ss').unix())
    }

    return out
  }

  private parseDatesFromDaytime($: CheerioAPI, wildcard: Wildcard): number[] {
    const search = $(wildcard)
    const start_date = moment(search.first().text().trim().split(', ')[1] + moment().format('YYYY'), 'DD MMMYYYY', 'ru')
    const out: number[] = []

    for (let i = 0; i < search.length * 4; i++) {
      out.push(start_date.add(i > 0 ? 6 : 0, 'hour').unix())
    }

    return out
  }

  private parseValue<T>($: CheerioAPI, wildcard: Wildcard): T[] {
    const out: T[] = []
    const search = $(this.unitToWildcard(wildcard))

    search.each((i, el) => {
      out[i] = (is_number(load(el).text().replace(',', '.')) ? this.numberify(load(el).text()) : load(el).text()) as unknown as T
    })

    return out
  }

  private parseAttr<T>($: CheerioAPI, wildcard: Wildcard, attr: string): T[] {
    const out: T[] = []
    const search = $(this.unitToWildcard(wildcard)) as Cheerio<Element>

    search.each((i, el) => {
      out[i] = (is_number(el.attribs[attr].replace(',', '.'))
        ? Number(el.attribs[attr].replace(',', '.'))
        : el.attribs[attr]) as unknown as T
    })

    return out
  }

  private makeCollection<T>(data: Record<keyof T, Partial<T[keyof T]>[]>): T[] {
    const out: T[] = []
    const length = data[Object.keys(data)[0] as keyof typeof data].length

    for (let k = 0; k < length; k++) {
      const item: Partial<T> = {}
      for (const key in data) {
        item[key as keyof typeof item] = data[key as keyof typeof data][k] as T[keyof T]
      }
      out.push(item as T)
    }

    return out
  }

  private unitToWildcard(wildcard: Wildcard): string {
    return String(wildcard)
      .replace('UNIT_TEMP', this._unit.temp)
      .replace('UNIT_PRESSURE', this._unit.pressure)
      .replace('UNIT_WIND', this._unit.wind)
  }

  private numberify(value: string | number): number {
    return Number(String(value).replace(',', '.'))
  }

  private parentText($: CheerioAPI, wildcard: Wildcard): string {
    return $(this.unitToWildcard(wildcard))
      .contents()
      .filter(function () {
        return this.nodeType === 3
      })
      .text()
  }

  private prepareHtml(data: string): string {
    return data
      .split('<span>&mdash;</span>')
      .join('<span class="wind-unit unit unit_wind_m_s">0</span><span class="wind-unit unit unit_wind_km_h">0</span>')
      .split('<svg><use xlink:href="#wind-zero"/></svg>')
      .join('<div class="direction">-</div>')
  }
}
