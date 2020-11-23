import React from 'react'

export const themes = {
    light: {
        color: '#323338',
        background: '#ffffff',
        red: '#E44258',
        yellow: '#FFCB00',
        green: '#00CA72',
    },
}

themes.dark = Object.assign({}, themes.light, {
    background: '#323338',
    color: 'rgba(255, 255, 255, 0.8)',
    red: '#E45266',
    green: '#14CA7B',
    yellow: '#FFD01A',
})

themes.colorblind = Object.assign({}, themes.light, {
    green: '#9AADBD',
    yellow: '#FFADAD',
    red: '#784BD1',
})

themes.colorblindDark = Object.assign({}, themes.dark, {
    green: '#9AADBD',
    yellow: '#FFADAD',
    red: '#7c57c7',
})

export const ThemeContext = React.createContext(themes.light)
