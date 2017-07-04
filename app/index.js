import config from './config'
import InsetSearch from './modules/InsetSearch'
import mapboxgl, { Map, LngLatBounds } from 'mapbox-gl'
import data  from './data'

const quicksand = Utils.loadWebFont('Quicksand')

// Colors
const ORANGE = 'rgb(255,149,0)'
const YELLOW = 'rgb(255,204,0)'
const GREEN = 'rgb(76,217,100)'
const BLUE = 'rgb(0,122,255)'
const PURPLE = 'rgb(88,86,214)'
const PINK = 'rgb(255,45,85)'
const colors = [ORANGE, YELLOW, GREEN, BLUE, PURPLE, PINK]
const color = Utils.cycle(colors)

// Mapbox Token
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZGFuaWxvYnJpbnUiLCJhIjoiWTBGQWp2VSJ9.5kT6YKd-ygZe7AsbZXIwDQ'
const MAPBOX_STYLE = 'mapbox://styles/mapbox/streets-v9'
const MAPBOX_DIRECTIONS_API = 'https://api.mapbox.com/directions/v5/mapbox/'
const MAPBOX_PROFILES = ['driving', 'walking']

const position = (callback) => {
  if (!('geolocation' in navigator)) alert('Browser not support - Geolocation')
  if (typeof callback !== 'function') return

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => callback(coords)
  )
}

// Mapbox
const mapbox = new Framer.Layer({
  ignoreEvents: false,
  size: Screen.size,
  html: `<div id="map"></div>`
})

mapboxgl.accessToken = MAPBOX_TOKEN

const map = new Map({
  container: mapbox.querySelector('#map'),
  zoom: 13,
  center: [-77.07097, -11.94496],
  style: MAPBOX_STYLE,
  hash: true
})

map.on('render', () => map.resize())

// Topbar
const topbar = new Framer.Layer({
  width: Screen.width,
  height: 56,
  backgroundColor: 'transparent',
  style: { 'overflow': 'hidden' }
})

const search = new InsetSearch({
  parent: topbar,
  x: 4,
  y: 3,
  width: Screen.width - 8,
  padding: '16px 72px 16px 16px',
  height: 48,
  fontFamily: 'Quicksand',
  fontWeight: 500,
  color: '#333',
  backgroundColor: '#fff',
  borderRadius: 8,
  placeholder: 'Busca por dirección o distrito'
})

const handler = Utils.debounce(.3, (v) => {
  const page = Utils.randomChoice(pages)

  cards.snapToPage(page)
})

search.on(Events.InsetSearchOnInput, (v, e) => {
  handler(v)
})

// Cards
const cards = new Framer.PageComponent({
  x: 32,
  y: Screen.height - 196 - 40,
  width: Screen.width - 64,
  height: 196,
  scrollVertical: false,
  style: {
    overflow: 'visible'
  }
})

const pages = []
Object.values(data).map((value, number) => {
  const brand = color()

  const card = new Framer.Layer({
    parent: cards.content,
    x: number * (cards.width + 16),
    size: cards.size,
    borderRadius: 4,
    backgroundColor: '#fff',
    style: {
      overflow: 'hidden'
    }
  })

  pages.push(card)

  const cardHeader = new Framer.Layer({
    parent: card,
    width: card.width,
    height: 72,
    backgroundColor: brand
  })

  const cardHeaderTitle = new TextLayer({
    parent: cardHeader,
    x: 16,
    y: 16,
    width: cardHeader.width - 32,
    fontFamily: quicksand,
    fontWeight: 500,
    fontSize: 12,
    color: '#fff',
    text: value.address
  })

  const cardBody = new Framer.Layer({
    parent: card,
    y: 72,
    width: card.width,
    height: 72,
    backgroundColor: 'transparent'
  })

  const cardBodyMinutes = new TextLayer({
    parent: cardBody,
    x: 16,
    y: 16,
    fontFamily: quicksand,
    fontWeight: 500,
    fontSize: 16,
    color: '#34495e',
    text: '16min'
  })

  const cardBodyDistance = new TextLayer({
    parent: cardBody,
    x: cardBodyMinutes.width + 24,
    y: 18,
    fontFamily: quicksand,
    fontWeight: 400,
    fontSize: 14,
    color: '"999',
    text: '20km'
  })

  const cardBodyDescription = new TextLayer({
    parent: cardBody,
    x: 16,
    y: 36,
    width: cardBody.width - 32,
    fontFamily: quicksand,
    fontWeight: 400,
    fontSize: 14,
    color: '#999',
    text: 'Ruta mas rapida con tráfico ligero'
  })

  const cardFooter = new Framer.Layer({
    parent: card,
    x: 16,
    y: 144,
    width: card.width - 32,
    height: 52,
    backgroundColor: 'transparent',
    style: { 'border-top': '1px solid #999' }
  })

  const cardFooterLeft = new TextLayer({
    parent: cardFooter,
    y: 8,
    fontFamily: quicksand,
    fontWeight: 500,
    fontSize: 14,
    color: brand,
    text: 'RUTAS',
    padding: { vertical: 14 },
    style: { 'pointer-events': 'auto', 'cursor': 'pointer' }
  })

  const click = ({ coordinates: endCoords }) => () => {
    position(startCoords => {
      MAPBOX_PROFILES.map((profile) => {
        const start = [startCoords.longitude, startCoords.latitude]
        const end = [endCoords.longitude, endCoords.latitude]
        const path = `${start.join(',')};${end.join(',')}`

        const data = Utils.domLoadJSONSync(
          `${MAPBOX_DIRECTIONS_API}${profile}/${path}?access_token=${MAPBOX_TOKEN}&geometries=geojson&overview=full`
        )
        const coordinates = data.routes[0].geometry.coordinates
        const bounds = coordinates.reduce((bounds, coord) => {
          return bounds.extend(coord)
        }, new LngLatBounds(coordinates[0], coordinates[0]))

        const geojson = {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: {
              type: 'LineString',
              properties: {},
              coordinates
            }
          }]
        }

        if (map.getSource(`${profile}-route`)) {
          map.removeSource(`${profile}-route`)
        }

        if (map.getLayer(`${profile}-route`)) {
          map.removeLayer(`${profile}-route`)
        }

        map.addSource(`${profile}-route`, {
          type: 'geojson',
          data: geojson
        })

        const route = {
          id: `${profile}-route`,
          type: 'line',
          source: `${profile}-route`,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': profile === 'walking' ? '#fbb03b' : '#3bb2d0',
            'line-width': 4,
            'line-opacity': .75
          }
        }

        if (profile === 'walking') route.paint['line-dasharray'] = [0, 1.5]

        map.addLayer(route)

        map.fitBounds(bounds, {
          linear: false,
          padding: {
            top: 100,
            right: 100,
            bottom: 150,
            left: 100
          }
        })
      })
    })
  }

  cardFooterLeft.on(Events.Click, click(value))

  const cardFooterRight = new TextLayer({
    parent: cardFooter,
    x: 240,
    y: 8,
    textAlign: 'right',
    fontFamily: quicksand,
    fontWeight: 500,
    fontSize: 14,
    color: brand,
    text: 'WAZE',
    padding: { vertical: 14 },
    style: { 'pointer-events': 'auto', 'cursor': 'pointer' }
  })
})
