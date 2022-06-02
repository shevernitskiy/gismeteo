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
        let out: Partial<GismeteoTwoWeeks>[] = []

        out = this.parseDates<Partial<GismeteoTwoWeeks>>($, Wildcard.TWOWEEKS_DATE)
        out = this.mergeArray(out, 'tmax', this.parseValue<number>($, Wildcard.TWOWEEKS_TMAX))
        out = this.mergeArray(out, 'tmin', this.parseValue<number>($, Wildcard.TWOWEEKS_TMIN))
        out = this.mergeArray(out, 'tavg', this.parseValue<number>($, Wildcard.TWOWEEKS_TAVG))
        out = this.mergeArray(out, 'pressure', this.parseValue<number>($, Wildcard.TWOWEEKS_PRESSURE))
        out = this.mergeArray(out, 'wind_speed', this.parseValue<number>($, Wildcard.TWOWEEKS_WINDSPEED))
        out = this.mergeArray(out, 'wind_gust', this.parseValue<number>($, Wildcard.TWOWEEKS_WINDGUST))
        out = this.mergeArray(out, 'wind_dir', this.parseValue<string>($, Wildcard.TWOWEEKS_WINDDIR))
        out = this.mergeArray(out, 'precipitation', this.parseValue<number>($, Wildcard.TWOWEEKS_PRECIPITATION))
        out = this.mergeArray(out, 'humidity', this.parseValue<number>($, Wildcard.TWOWEEKS_HUMIDITY))
        out = this.mergeArray(out, 'summary', this.parseAttr<string>($, Wildcard.TWOWEEKS_SUMMARY, 'data-text'))
        out = this.mergeArray(out, 'geomagnetic', this.parseValue<number>($, Wildcard.TWOWEEKS_GEOMAGNETIC))

        if ($(Wildcard.TWOWEEKS_ROADS).length > 0) {
          out = this.mergeArray(out, 'road_condition', this.parseValue<string>($, Wildcard.TWOWEEKS_ROADS))
        } else {
          out = this.mergeArray(out, 'road_condition', new Array(out.length).fill('unknown'))
        }
        if ($(Wildcard.TWOWEEKS_POLLEN_BIRCH).length > 0) {
          out = this.mergeArray(out, 'pollen_birch', this.parseValue<number>($, Wildcard.TWOWEEKS_POLLEN_BIRCH))
        } else {
          out = this.mergeArray(out, 'pollen_birch', new Array(out.length).fill(0))
        }
        if ($(Wildcard.TWOWEEKS_POLLEN_GRASS).length > 0) {
          out = this.mergeArray(out, 'pollen_grass', this.parseValue<number>($, Wildcard.TWOWEEKS_POLLEN_GRASS))
        } else {
          out = this.mergeArray(out, 'pollen_grass', new Array(out.length).fill(0))
        }
        if ($(Wildcard.TWOWEEKS_POLLEN_RAGWEED).length > 0) {
          out = this.mergeArray(out, 'pollen_ragweed', this.parseValue<number>($, Wildcard.TWOWEEKS_POLLEN_RAGWEED))
        } else {
          out = this.mergeArray(out, 'pollen_ragweed', new Array(out.length).fill(0))
        }

        return out as GismeteoTwoWeeks[]
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
        let out: Partial<GismeteoMonth>[] = []

        out = this.parseDates<Partial<GismeteoTwoWeeks>>($, Wildcard.MONTH_DATE)
        out = this.mergeArray(out, 'tmax', this.parseValue<number>($, Wildcard.MONTH_TMAX))
        out = this.mergeArray(out, 'tmin', this.parseValue<number>($, Wildcard.MONTH_TMIN))

        return out as GismeteoMonth[]
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
        let out: Partial<GismeteoOneDay>[] = []

        const dates = this.parseAttr<string>($, Wildcard.ONEDAY_TIME, 'title')
        out = this.parseDtFromStringArray<Partial<GismeteoOneDay>>(dates)
        out = this.mergeArray(out, 'temp', this.parseValue<number>($, Wildcard.ONEDAY_TEMP))
        out = this.mergeArray(out, 'pressure', this.parseValue<number>($, Wildcard.ONEDAY_PRESSURE))
        out = this.mergeArray(out, 'wind_speed', this.parseValue<number>($, Wildcard.ONEDAY_WINDSPEED))
        out = this.mergeArray(out, 'wind_gust', this.parseValue<number>($, Wildcard.ONEDAY_WINDGUST))
        out = this.mergeArray(out, 'wind_dir', this.parseValue<string>($, Wildcard.ONEDAY_WINDDIR))
        out = this.mergeArray(out, 'precipitation', this.parseValue<number>($, Wildcard.ONEDAY_PRECIPITATION))
        out = this.mergeArray(out, 'humidity', this.parseValue<number>($, Wildcard.ONEDAY_HUMIDITY))
        out = this.mergeArray(out, 'summary', this.parseAttr<string>($, Wildcard.ONEDAY_SUMMARY, 'data-text'))
        out = this.mergeArray(out, 'geomagnetic', this.parseValue<number>($, Wildcard.ONEDAY_GEOMAGNETIC))

        if ($(Wildcard.ONEDAY_ROADS).length > 0) {
          out = this.mergeArray(out, 'road_condition', this.parseValue<string>($, Wildcard.ONEDAY_ROADS))
        } else {
          out = this.mergeArray(out, 'road_condition', new Array(out.length).fill('unknown'))
        }
        if ($(Wildcard.ONEDAY_POLLEN_BIRCH).length > 0) {
          out = this.mergeArray(out, 'pollen_birch', this.parseValue<number>($, Wildcard.ONEDAY_POLLEN_BIRCH))
        } else {
          out = this.mergeArray(out, 'pollen_birch', new Array(out.length).fill(0))
        }
        if ($(Wildcard.ONEDAY_POLLEN_GRASS).length > 0) {
          out = this.mergeArray(out, 'pollen_grass', this.parseValue<number>($, Wildcard.ONEDAY_POLLEN_GRASS))
        } else {
          out = this.mergeArray(out, 'pollen_grass', new Array(out.length).fill(0))
        }
        if ($(Wildcard.ONEDAY_POLLEN_RAGWEED).length > 0) {
          out = this.mergeArray(out, 'pollen_ragweed', this.parseValue<number>($, Wildcard.ONEDAY_POLLEN_RAGWEED))
        } else {
          out = this.mergeArray(out, 'pollen_ragweed', new Array(out.length).fill(0))
        }

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
        let out: Partial<GismeteoTenDays>[] = []

        out = this.parseDatesFromDaytime<Partial<GismeteoTenDays>>($, Wildcard.TENDAYS_TIME)
        out = this.mergeArray(out, 'temp', this.parseValue<number>($, Wildcard.ONEDAY_TEMP))
        out = this.mergeArray(out, 'pressure', this.parseValue<number>($, Wildcard.ONEDAY_PRESSURE))
        out = this.mergeArray(out, 'wind_speed', this.parseValue<number>($, Wildcard.ONEDAY_WINDSPEED))
        out = this.mergeArray(out, 'wind_gust', this.parseValue<number>($, Wildcard.ONEDAY_WINDGUST))
        out = this.mergeArray(out, 'wind_dir', this.parseValue<string>($, Wildcard.ONEDAY_WINDDIR))
        out = this.mergeArray(out, 'precipitation', this.parseValue<number>($, Wildcard.ONEDAY_PRECIPITATION))
        out = this.mergeArray(out, 'humidity', this.parseValue<number>($, Wildcard.ONEDAY_HUMIDITY))
        out = this.mergeArray(out, 'summary', this.parseAttr<string>($, Wildcard.ONEDAY_SUMMARY, 'data-text'))
        out = this.mergeArray(out, 'geomagnetic', this.parseValue<number>($, Wildcard.ONEDAY_GEOMAGNETIC))

        if ($(Wildcard.ONEDAY_ROADS).length > 0) {
          out = this.mergeArray(out, 'road_condition', this.parseValue<string>($, Wildcard.ONEDAY_ROADS))
        } else {
          out = this.mergeArray(out, 'road_condition', new Array(out.length).fill('unknown'))
        }
        if ($(Wildcard.ONEDAY_POLLEN_BIRCH).length > 0) {
          out = this.mergeArray(out, 'pollen_birch', this.parseValue<number>($, Wildcard.ONEDAY_POLLEN_BIRCH))
        } else {
          out = this.mergeArray(out, 'pollen_birch', new Array(out.length).fill(0))
        }
        if ($(Wildcard.ONEDAY_POLLEN_GRASS).length > 0) {
          out = this.mergeArray(out, 'pollen_grass', this.parseValue<number>($, Wildcard.ONEDAY_POLLEN_GRASS))
        } else {
          out = this.mergeArray(out, 'pollen_grass', new Array(out.length).fill(0))
        }
        if ($(Wildcard.ONEDAY_POLLEN_RAGWEED).length > 0) {
          out = this.mergeArray(out, 'pollen_ragweed', this.parseValue<number>($, Wildcard.ONEDAY_POLLEN_RAGWEED))
        } else {
          out = this.mergeArray(out, 'pollen_ragweed', new Array(out.length).fill(0))
        }

        out.forEach((item, index) => {
          if (item.geomagnetic === undefined) {
            out[index].geomagnetic = 0
          }
        })

        console.log(out)

        return out as GismeteoTenDays[]
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

  private parseDates<T>($: CheerioAPI, wildcard: Wildcard): T[] {
    const search = $(wildcard)
    const start_date = moment(search.first().text() + moment().format('YYYY'), 'DD MMMYYYY', 'ru')
    const out: T[] = []

    for (let i = 0; i < search.length; i++) {
      out.push({ dt: start_date.add(i > 0 ? 1 : 0, 'day').unix() } as unknown as T)
    }

    return out
  }

  private parseDtFromStringArray<T>(input: string[]): T[] {
    const out: T[] = []

    for (let i = 0; i < input.length; i++) {
      const strip_date = input[i].split(', UTC: ')[1] ? input[i].split(', UTC: ')[1] : input[i].split('от: ')[1].replace(' (UTC)', '')

      out.push({ dt: moment(strip_date, 'YYYY-MM-DD HH:mm:ss').unix() } as unknown as T)
    }

    return out
  }

  private parseDatesFromDaytime<T>($: CheerioAPI, wildcard: Wildcard): T[] {
    const search = $(wildcard)
    const start_date = moment(search.first().text().trim().split(', ')[1] + moment().format('YYYY'), 'DD MMMYYYY', 'ru')
    const out: T[] = []

    for (let i = 0; i < search.length * 4; i++) {
      out.push({ dt: start_date.add(i > 0 ? 6 : 0, 'hour').unix() } as unknown as T)
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

  private unitToWildcard(wildcard: Wildcard): string {
    return String(wildcard)
      .replace('UNIT_TEMP', this._unit.temp)
      .replace('UNIT_PRESSURE', this._unit.pressure)
      .replace('UNIT_WIND', this._unit.wind)
  }

  private mergeArray<T, K extends keyof T, V extends T[K]>(input: T[], key: K, values: V[]): T[] {
    return input.map((item, index) => {
      item[key] = values[index]
      return item
    })
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
