export interface GismeteoOptions {
  lang?: 'en' | 'ru'
  unit_temp?: 'C' | 'F'
  unit_pressure?: 'mmHg' | 'hPa'
  unit_wind?: 'ms' | 'kmh'
}

export interface GismeteoTwoWeeks {
  dt: number
  tmax: number
  tmin: number
  tavg: number
  humidity: number
  pressure: number
  wind_speed: number
  wind_gust: number
  wind_dir: string
  precipitation: number
  summary: string
  road_condition: string
  geomagnetic: number
  pollen_birch: number
  pollen_grass: number
  pollen_ragweed: number
}

export interface GismeteoMonth {
  dt: number
  tmax: number
  tmin: number
}

export interface GismeteoNow {
  temp: number
  temp_feels: number
  wind_speed: number
  wind_dir: string
  pressure: number
  humidity: number
  summary: string
  geomagnetic: number
  water_temp: number
  sunrise: number
  sunset: number
  image?: string
}

export interface GismeteoTomorrow {
  dt: number
  temp: number
  humidity: number
  pressure: number
  wind_speed: number
  wind_gust: number
  wind_dir: string
  precipitation: number
  summary: string
  road_condition: string
  geomagnetic: number
  pollen_birch: number
  pollen_grass: number
  pollen_ragweed: number
}

export interface GismeteoToday {
  dt: number
  temp: number
  humidity: number
  pressure: number
  wind_speed: number
  wind_gust: number
  wind_dir: string
  precipitation: number
  summary: string
  road_condition: string
  geomagnetic: number
  pollen_birch: number
  pollen_grass: number
  pollen_ragweed: number
}

export type CityUri = string
