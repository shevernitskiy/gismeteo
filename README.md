<div align="center">

# Gismeteo weather (unofficial)

<img src="https://androidprogrammi.ru/wp-content/uploads/2021/02/gismeteo_gismeteo.png" width="200">

</div>

<p align=center>
  <i>
    This little library provides data from the gismeteo site using web scraping.
  </i>
</p>

<div align="center">

[![build](https://img.shields.io/github/workflow/status/shevernitskiy/gismeteo/CI%20Push)](https://github.com/shevernitskiy/gismeteo/actions)
[![downloads](https://img.shields.io/npm/dm/gismeteo)](https://www.npmjs.com/package/gismeteo)
[![size](https://img.shields.io/npm/v/gismeteo)](https://www.npmjs.com/package/gismeteo)

</div>

## Installation

```bash
npm i gismeteo # or yarn add gismeteo
```

## Usage

Import Gismeteo class from the module, create an instance of it. Optionally, you can pass some opts. Then use methods.

```ts
import { Gismeteo } from 'gismeteo'

const gismeteo = new Gismeteo()

gismeteo.getTwoWeeks('London').then((data) => {
  console.log(data)
})
```

## Options

```ts
const gismeteo = new Gismeteo({ lang: 'en', unit_temp: 'F' })
```

| Name          | Default |  Values   | Description                             |
| ------------- | :-----: | :-------: | :-------------------------------------- |
| lang          |   ru    |  en, ru   | language of some conditions and summary |
| unit_temp     |    C    |   C, F    | units of temperature                    |
| unit_pressure |  mmHg   | mmHg, hPa | units of pressure                       |
| unit_wind     |   ms    |  ms, kmh  | units of wind                           |

## Methods

All methods receive city name as argument (in english or russian)

### Now

Current conditions in specified location.

```ts
gismeteo.getNow('London').then((data) => {
  console.log(data)
})
```

<details>
  <summary>Output</summary>

```ts
{
  temp: 13.1,
  temp_feels: 13,
  wind_speed: 2,
  wind_dir: 'западный',
  pressure: 737,
  humidity: 70,
  summary: 'Малооблачно, небольшой дождь',
  geomagnetic: 2,
  water_temp: 9.5,
  sunrise: 1653613140,
  sunset: 1653674100
}
```

</details>

### Tomorrow

3-hour forecast for tomorrow.

```ts
gismeteo.getTommorow('London').then((data) => {
  console.log(data)
})
```

<details>
  <summary>Output</summary>

```ts
;[
  {
    dt: 1653674400,
    temp: 8,
    pressure: 737,
    wind_speed: 3,
    wind_gust: 8,
    wind_dir: 'ЮЗ',
    precipitation: 0,
    humidity: 0,
    summary: 'Ясно',
    geomagnetic: 3,
    road_condition: 'Влажная дорога',
    pollen_birch: 0,
    pollen_grass: 1,
    pollen_ragweed: 0,
  },
  {
    dt: 1653685200,
    temp: 7,
    pressure: 736,
    wind_speed: 2,
    wind_gust: 6,
    wind_dir: 'ЮЗ',
    precipitation: 0,
    humidity: 300,
    summary: 'Ясно',
    geomagnetic: 4,
    road_condition: 'Роса',
    pollen_birch: 0,
    pollen_grass: 0,
    pollen_ragweed: 0,
  },
  {
    dt: 1653696000,
    temp: 8,
    pressure: 735,
    wind_speed: 3,
    wind_gust: 6,
    wind_dir: 'ЮЗ',
    precipitation: 0,
    humidity: 600,
    summary: 'Пасмурно',
    geomagnetic: 4,
    road_condition: 'Вода',
    pollen_birch: 0,
    pollen_grass: 0,
    pollen_ragweed: 0,
  },
  {
    dt: 1653706800,
    temp: 8,
    pressure: 735,
    wind_speed: 5,
    wind_gust: 8,
    wind_dir: 'З',
    precipitation: 6.4,
    humidity: 900,
    summary: 'Пасмурно, сильный дождь',
    geomagnetic: 3,
    road_condition: 'Вода',
    pollen_birch: 0,
    pollen_grass: 1,
    pollen_ragweed: 0,
  },
  {
    dt: 1653717600,
    temp: 11,
    pressure: 736,
    wind_speed: 6,
    wind_gust: 9,
    wind_dir: 'З',
    precipitation: 1.5,
    humidity: 1200,
    summary: 'Пасмурно, дождь',
    geomagnetic: 4,
    road_condition: 'Вода',
    pollen_birch: 0,
    pollen_grass: 1,
    pollen_ragweed: 0,
  },
  {
    dt: 1653728400,
    temp: 12,
    pressure: 737,
    wind_speed: 7,
    wind_gust: 13,
    wind_dir: 'З',
    precipitation: 0.9,
    humidity: 1500,
    summary: 'Малооблачно, небольшой дождь',
    geomagnetic: 2,
    road_condition: 'Влажная дорога',
    pollen_birch: 1,
    pollen_grass: 0,
    pollen_ragweed: 0,
  },
  {
    dt: 1653739200,
    temp: 12,
    pressure: 738,
    wind_speed: 6,
    wind_gust: 15,
    wind_dir: 'З',
    precipitation: 0.7,
    humidity: 1800,
    summary: 'Малооблачно, небольшой дождь',
    geomagnetic: 3,
    road_condition: 'Влажная дорога',
    pollen_birch: 1,
    pollen_grass: 1,
    pollen_ragweed: 0,
  },
  {
    dt: 1653750000,
    temp: 9,
    pressure: 739,
    wind_speed: 4,
    wind_gust: 12,
    wind_dir: 'З',
    precipitation: 0,
    humidity: 2100,
    summary: 'Облачно',
    geomagnetic: 2,
    road_condition: 'Сухая дорога',
    pollen_birch: 1,
    pollen_grass: 0,
    pollen_ragweed: 0,
  },
]
```

</details>

### Two weeks

1-day forecast for two weeks

```ts
gismeteo.getTwoWeeks('London').then((data) => {
  console.log(data)
})
```

<details>
  <summary>Output</summary>

```ts
;[
  {
    dt: 1653598800,
    tmax: 13,
    tmin: 10,
    tavg: 11,
    pressure: 737,
    wind_speed: 5,
    wind_gust: 9,
    wind_dir: 'З',
    precipitation: 28,
    humidity: 84,
    summary: 'Пасмурно, сильный дождь',
    geomagnetic: 3,
    road_condition: 'Вода',
    pollen_birch: 3,
    pollen_grass: 1,
    pollen_ragweed: 0,
  },
  {
    dt: 1653685200,
    tmax: 12,
    tmin: 7,
    tavg: 9,
    pressure: 739,
    wind_speed: 7,
    wind_gust: 15,
    wind_dir: 'З',
    precipitation: 9.5,
    humidity: 81,
    summary: 'Переменная облачность, дождь',
    geomagnetic: 4,
    road_condition: 'Роса',
    pollen_birch: 1,
    pollen_grass: 1,
    pollen_ragweed: 0,
  },
  {
    dt: 1653858000,
    tmax: 15,
    tmin: 7,
    tavg: 11,
    pressure: 748,
    wind_speed: 6,
    wind_gust: 11,
    wind_dir: 'ЮЗ',
    precipitation: 0,
    humidity: 65,
    summary: 'Переменная облачность',
    geomagnetic: 4,
    road_condition: 'Влажная дорога',
    pollen_birch: 1,
    pollen_grass: 0,
    pollen_ragweed: 0,
  },
  {
    dt: 1654117200,
    tmax: 20,
    tmin: 8,
    tavg: 14,
    pressure: 752,
    wind_speed: 6,
    wind_gust: 8,
    wind_dir: 'Ю',
    precipitation: 0.4,
    humidity: 65,
    summary: 'Переменная облачность, небольшой дождь',
    geomagnetic: 2,
    road_condition: 'Вода',
    pollen_birch: 2,
    pollen_grass: 1,
    pollen_ragweed: 0,
  },
  {
    dt: 1654462800,
    tmax: 19,
    tmin: 13,
    tavg: 16,
    pressure: 750,
    wind_speed: 5,
    wind_gust: 11,
    wind_dir: 'ЮВ',
    precipitation: 6.8,
    humidity: 82,
    summary: 'Пасмурно, дождь',
    geomagnetic: 2,
    road_condition: 'Вода',
    pollen_birch: 1,
    pollen_grass: 1,
    pollen_ragweed: 0,
  },
  {
    dt: 1654894800,
    tmax: 21,
    tmin: 11,
    tavg: 17,
    pressure: 753,
    wind_speed: 4,
    wind_gust: 9,
    wind_dir: 'С',
    precipitation: 0,
    humidity: 61,
    summary: 'Переменная облачность',
    geomagnetic: 2,
    road_condition: 'Сухая дорога',
    pollen_birch: 0,
    pollen_grass: 1,
    pollen_ragweed: 0,
  },
  {
    dt: 1655413200,
    tmax: 19,
    tmin: 13,
    tavg: 16,
    pressure: 753,
    wind_speed: 5,
    wind_gust: 10,
    wind_dir: 'ЮЗ',
    precipitation: 0.5,
    humidity: 67,
    summary: 'Переменная облачность, небольшой дождь',
    geomagnetic: 2,
    road_condition: 'Влажная дорога',
    pollen_birch: 1,
    pollen_grass: 2,
    pollen_ragweed: 0,
  },
  {
    dt: 1656018000,
    tmax: 23,
    tmin: 15,
    tavg: 18,
    pressure: 752,
    wind_speed: 4,
    wind_gust: 9,
    wind_dir: 'ЮЗ',
    precipitation: 3.2,
    humidity: 80,
    summary: 'Переменная облачность, дождь',
    geomagnetic: 2,
    road_condition: 'Вода',
    pollen_birch: 1,
    pollen_grass: 2,
    pollen_ragweed: 0,
  },
  {
    dt: 1656709200,
    tmax: 23,
    tmin: 17,
    tavg: 20,
    pressure: 752,
    wind_speed: 7,
    wind_gust: 14,
    wind_dir: 'З',
    precipitation: 1.3,
    humidity: 71,
    summary: 'Переменная облачность, небольшой дождь',
    geomagnetic: 2,
    road_condition: 'Вода',
    pollen_birch: 0,
    pollen_grass: 2,
    pollen_ragweed: 0,
  },
  {
    dt: 1657486800,
    tmax: 23,
    tmin: 13,
    tavg: 18,
    pressure: 752,
    wind_speed: 5,
    wind_gust: 9,
    wind_dir: 'ЮВ',
    precipitation: 0,
    humidity: 67,
    summary: 'Малооблачно',
    geomagnetic: 2,
    road_condition: 'Сухая дорога',
    pollen_birch: 0,
    pollen_grass: 1,
    pollen_ragweed: 0,
  },
  {
    dt: 1658350800,
    tmax: 27,
    tmin: 15,
    tavg: 21,
    pressure: 749,
    wind_speed: 5,
    wind_gust: 10,
    wind_dir: 'ЮВ',
    precipitation: 0,
    humidity: 71,
    summary: 'Ясно',
    geomagnetic: 2,
    road_condition: 'Сухая дорога',
    pollen_birch: 0,
    pollen_grass: 2,
    pollen_ragweed: 0,
  },
  {
    dt: 1659301200,
    tmax: 29,
    tmin: 18,
    tavg: 23,
    pressure: 749,
    wind_speed: 5,
    wind_gust: 10,
    wind_dir: 'ЮВ',
    precipitation: 0.5,
    humidity: 72,
    summary: 'Переменная облачность, небольшой дождь, гроза',
    geomagnetic: 2,
    road_condition: 'Влажная дорога',
    pollen_birch: 0,
    pollen_grass: 2,
    pollen_ragweed: 0,
  },
  {
    dt: 1660338000,
    tmax: 28,
    tmin: 19,
    tavg: 23,
    pressure: 749,
    wind_speed: 6,
    wind_gust: 11,
    wind_dir: 'ЮВ',
    precipitation: 0,
    humidity: 67,
    summary: 'Переменная облачность',
    geomagnetic: 2,
    road_condition: 'Сухая дорога',
    pollen_birch: 0,
    pollen_grass: 2,
    pollen_ragweed: 0,
  },
  {
    dt: 1661461200,
    tmax: 29,
    tmin: 19,
    tavg: 24,
    pressure: 752,
    wind_speed: 5,
    wind_gust: 8,
    wind_dir: 'ЮВ',
    precipitation: 0,
    humidity: 65,
    summary: 'Переменная облачность',
    geomagnetic: 2,
    road_condition: 'Сухая дорога',
    pollen_birch: 2,
    pollen_grass: 2,
    pollen_ragweed: 0,
  },
]
```

</details>

### Month

1-day forecast for a month. Contains only max/min temperature.

```ts
gismeteo.getMonth('London').then((data) => {
  console.log(data)
})
```

<details>
  <summary>Output</summary>

```ts
;[
  { dt: 1653253200, tmax: 13, tmin: 3 },
  { dt: 1653339600, tmax: 8, tmin: 6 },
  { dt: 1653512400, tmax: 13, tmin: 3 },
  { dt: 1653771600, tmax: 20, tmin: 8 },
  { dt: 1654117200, tmax: 13, tmin: 10 },
  { dt: 1654549200, tmax: 12, tmin: 7 },
  { dt: 1655067600, tmax: 15, tmin: 7 },
  { dt: 1655672400, tmax: 20, tmin: 8 },
  { dt: 1656363600, tmax: 19, tmin: 13 },
  { dt: 1657141200, tmax: 21, tmin: 11 },
  { dt: 1658005200, tmax: 19, tmin: 13 },
  { dt: 1658955600, tmax: 23, tmin: 15 },
  { dt: 1659992400, tmax: 23, tmin: 17 },
  { dt: 1661115600, tmax: 23, tmin: 13 },
  { dt: 1662325200, tmax: 27, tmin: 15 },
  { dt: 1663621200, tmax: 29, tmin: 18 },
  { dt: 1665003600, tmax: 28, tmin: 19 },
  { dt: 1666472400, tmax: 29, tmin: 19 },
  { dt: 1668027600, tmax: 29, tmin: 20 },
  { dt: 1669669200, tmax: 30, tmin: 21 },
  { dt: 1671397200, tmax: 30, tmin: 20 },
  { dt: 1673211600, tmax: 27, tmin: 15 },
  { dt: 1675112400, tmax: 25, tmin: 21 },
  { dt: 1677099600, tmax: 22, tmin: 18 },
  { dt: 1679173200, tmax: 16, tmin: 12 },
  { dt: 1681333200, tmax: 18, tmin: 9 },
  { dt: 1683579600, tmax: 18, tmin: 10 },
  { dt: 1685912400, tmax: 21, tmin: 12 },
  { dt: 1688331600, tmax: 19, tmin: 12 },
  { dt: 1690837200, tmax: 24, tmin: 11 },
  { dt: 1693429200, tmax: 23, tmin: 18 },
  { dt: 1696107600, tmax: 25, tmin: 16 },
  { dt: 1698872400, tmax: 25, tmin: 15 },
  { dt: 1701723600, tmax: 24, tmin: 14 },
  { dt: 1704661200, tmax: 25, tmin: 13 },
  { dt: 1707685200, tmax: 25, tmin: 17 },
  { dt: 1710795600, tmax: 23, tmin: 14 },
  { dt: 1713992400, tmax: 19, tmin: 15 },
  { dt: 1717275600, tmax: 23, tmin: 13 },
  { dt: 1720645200, tmax: 25, tmin: 15 },
  { dt: 1724101200, tmax: 26, tmin: 14 },
  { dt: 1727643600, tmax: 19, tmin: 16 },
]
```

</details>

## Contributing

Pull requests are welcome. Please use prettier format for your code.

## License

Distributed under the [MIT](https://choosealicense.com/licenses/mit/) License.

## Disclaimer

You should understand, that data of gismeteo site is copyrighted material.
Library itself doesn't containt any gismeteo coprighted data, but the fetched data will be property of gismeteo.

See the following links [EN](https://www.gismeteo.com/page/agreement/), [RU](https://www.gismeteo.ru/page/agreement/)
