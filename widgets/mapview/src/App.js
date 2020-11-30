/* eslint-disable no-undef */
import React, { useEffect, useState } from 'react'
import './App.css'
import mondaySdk from 'monday-sdk-js'
import GoogleMapReact from 'google-map-react'
const interpolate = require('color-interpolate')

const monday = mondaySdk()
const colormap = interpolate([
    { r: 0, g: 202, b: 114 },
    { r: 255, g: 203, b: 0 },
    { r: 228, g: 66, b: 88 },
])

function distance(a, b) {
    // dist in km
    var lat1 = a.lat
    var lon1 = a.lng
    var lat2 = b.lat
    var lon2 = b.lng
    var rad = Math.PI / 180

    var dLat = (lat2 - lat1) * rad
    var dLon = (lon2 - lon1) * rad
    lat1 = lat1 * rad
    lat2 = lat2 * rad

    var x = Math.sin(dLat / 2)
    var y = Math.sin(dLon / 2)

    a = x * x + y * y * Math.cos(lat1) * Math.cos(lat2)
    return 6371 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const PropertyCard = (props) => {
    const p = props.property
    console.log(p)
    console.log('p', p['anomaliness'])
    return (
        <div className="property-card" id={props.id}>
            <div className="row">
                <div className="prop-title">{p.name}</div>
                <div className="prop-price"></div>${Math.round(p.price / 1000)}K
            </div>
            <div className="prop-address">{p.address}</div>
            <div className="prop-anomaly">
                Anomaly Score: {Number(p.anomaliness).toFixed(2)}
            </div>
        </div>
    )
    // Name
    // Address
    // Price
    // Anomaliness
}

const Marker = (props) => {
    const a = props.property.anomaliness
    return (
        <div
            className="marker"
            style={{
                width: props.clicked ? 16 : undefined,
                height: props.clicked ? 16 : undefined,
                background: a ? colormap(a) : colormap(1),
            }}
            onClick={props.onClick}
        />
    )
}

function App() {
    const [boardId, setBoardId] = useState(null)
    const [properties, setProperties] = useState([])
    const [activeMarker, setActiveMarker] = useState({ id: '' })
    const [count, setCount] = useState(5)
    const [maxDistance, setMaxDistance] = useState(10) // Divide by 10
    const [sensitivity, setSensitivity] = useState(0.5) // Divide by 100

    useEffect(() => {
        if (boardId !== null) {
            ;(async () => {
                let p = []
                try {
                    const q = await monday.api(
                        `query { boards(ids: ${boardId}) { items { id, name, column_values { id, value, type, title }}}}`
                    )
                    const items = q.data.boards[0].items
                    for (const item of items) {
                        const prop = { name: item.name, id: item.id }
                        let hasAllProps = false

                        const colVals = item['column_values']
                        for (const c of colVals) {
                            switch (c.title.toLowerCase()) {
                                case 'lat':
                                    if (typeof c.value === 'string')
                                        prop['lat'] = JSON.parse(c.value)
                                    else prop['lat'] = c.value
                                    prop.lat = Number(prop.lat)
                                    break
                                case 'lng':
                                    if (typeof c.value === 'string')
                                        prop['lng'] = JSON.parse(c.value)
                                    else prop['lng'] = c.value
                                    prop.lng = Number(prop.lng)
                                    break

                                case 'price':
                                    if (typeof c.value === 'string')
                                        prop['price'] = JSON.parse(c.value)
                                    else prop['price'] = c.value
                                    prop.price = Number(prop.price)
                                    break

                                case 'address':
                                    prop['address'] = JSON.parse(c.value)
                                    break
                                default:
                                    break
                            }
                        }

                        hasAllProps =
                            prop.name && prop.lat && prop.lng && prop.price
                        if (hasAllProps) p.push(prop)
                    }
                    /*
                    {
                        lat
                        lng 
                        address 
                        name
                        id
                    }
                    */

                    const tree = new kdTree(p, distance, ['lat', 'lng'])

                    for (let i = 0; i < p.length; i = +i + (i === i)) {
                        let prop = p[i]
                        let anomaliness = 0
                        // Get n nearest items within range
                        let nearest = tree
                            .nearest(prop, 1 + count, maxDistance)
                            .map((i) => i[0])
                        let prices = nearest.map((i) => i.price)
                        const mean =
                            prices.reduce((a, b) => a + b) / prices.length
                        const percent_diff = Math.abs(prop.price - mean) / mean
                        anomaliness =
                            1 /
                            (1 +
                                Math.pow(
                                    Math.E,
                                    1 - 0.5 - sensitivity + -2 * percent_diff
                                ))
                        prop.anomaliness = nearest.length
                            ? Math.min(1, Math.max(0, anomaliness))
                            : 0
                    }

                    setProperties(p)
                } catch (e) {
                    console.error(e)
                    monday.execute('notice', {
                        message:
                            'There was an error loading your property data.',
                        type: 'error',
                        timeout: 5000,
                    })
                }
            })()
        } else {
            monday.listen('context', (res) => {
                setBoardId(res.data.boardId)
            })
        }
    }, [boardId, count, maxDistance, sensitivity])

    useEffect(() => {
        // TODO: ask for GPS position?
        monday.listen('settings', ({ data }) => {
            const { sensitivity, count, range } = data
            if (count.length !== '') {
                const c = Number(count)
                if (c + '' === count && c >= 1 && c <= 100) {
                    console.log('c', c)
                    setCount(Math.ceil(c / 10))
                }
            }
            if (sensitivity.length !== '') {
                const s = Number(sensitivity)
                if (s + '' === sensitivity && s >= 1 && s <= 100) {
                    console.log('s', s)
                    setSensitivity(s / 100)
                }
            }
            if (range.length !== '') {
                const r = Number(range)
                if (r + '' === range && r > 0) {
                    console.log('r', r)
                    setMaxDistance(r)
                }
            }
        })
    }, [])

    return (
        <>
            <div className="properties-list">
                <h2>Properties</h2>
                <div className="prop-inner">
                    {properties.map((p) => (
                        <PropertyCard
                            key={p.id}
                            property={p}
                            id={`property-${p.id}`}
                        />
                    ))}
                    {properties.length === 0 && (
                        <div style={{ opacity: 0.7 }}>
                            No properties added yet.
                        </div>
                    )}
                </div>
            </div>

            <div style={{ height: '100vh', width: '100%' }}>
                <GoogleMapReact
                    yesIWantToUseGoogleMapApiInternals
                    bootstrapURLKeys={{
                        key: 'AIzaSyBE5lHXYtQwCDw7LcQy_M7fDgXyjvJgs7U',
                    }}
                    defaultCenter={{ lat: 37, lng: -122 }}
                    defaultZoom={8}
                >
                    {properties.map((v, i) => {
                        return (
                            <Marker
                                lat={v.lat}
                                clicked={activeMarker.id === v.id}
                                onClick={() => {
                                    const e = document.querySelector(
                                        `#property-${v.id}`
                                    )
                                    e.scrollIntoView({
                                        block: 'start',
                                        inline: 'nearest',
                                        behavior: 'smooth',
                                    })
                                    setActiveMarker(v)
                                }}
                                lng={v.lng}
                                property={v}
                                key={i}
                            />
                        )
                    })}
                </GoogleMapReact>
                {/* list of properties  */}
            </div>
        </>
    )
}

//  Check nearest neighbors
//

export default App
