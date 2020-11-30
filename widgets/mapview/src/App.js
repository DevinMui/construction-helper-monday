import React, { useEffect, useState } from 'react'
import './App.css'
import mondaySdk from 'monday-sdk-js'
import GoogleMapReact from 'google-map-react'

const monday = mondaySdk()

function Marker() {
    return (
        <div>
            <p></p>
        </div>
    )
}

function App() {
    const [boardId, setBoardId] = useState(null)
    const [properties, setProperties] = useState(null)

    useEffect(() => {
        if (boardId !== null) {
            monday
                .api(
                    `query { boards(ids: ${boardId}) { items { id, name, column_values { id, value, type, title }}}}`
                )
                .then((res) => {
                    // add data to properties obj array
                    // run regressions
                })
        } else {
            monday.listen('context', (res) => {
                setBoardId(res.data.boardId)
            })
        }
    }, [boardId])

    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <GoogleMapReact
                bootstrapURLKeys={{
                    key: 'AIzaSyBE5lHXYtQwCDw7LcQy_M7fDgXyjvJgs7U',
                }}
                defaultCenter={{ lat: 37, lng: -122 }}
                defaultZoom={8}
            >
                {properties.map((i, property) => {
                    return <Marker lat={37} lng={-122} property={property} />
                })}
            </GoogleMapReact>
        </div>
    )
}

export default App
