import React from 'react'
import Chart from './Chart'
import { themes, ThemeContext } from './Themes.js'
import styled from 'styled-components'
import {
    onSettingsChange,
    onBoardChange,
    setSentimentColumn,
    showError,
    onDataAdd,
    getSentimentColumn,
} from './Monday'

const Container = styled.div`
    display: flex;
    height: inherit;
    justify-content: center;
    align-items: center;
`

const App = () => {
    const [chartSize, setChartSize] = React.useState(window.innerHeight)
    const [boardTitle, setBoardTitle] = React.useState('Title')
    const [theme, setTheme] = React.useState(themes.light)

    const [data, setData] = React.useState()

    React.useEffect(() => {
        onSettingsChange((settings) => {
            if (Object.keys(settings.sentimentColumn).length) {
                if (settings.maxEntries && settings.maxEntries > 5000) {
                    showError('Please enter a lower number of entries to show.')
                    setSentimentColumn({
                        column: Object.values(settings.sentimentColumn)[0][0],
                        maxEntries: getSentimentColumn().maxEntries,
                    })
                }
                setSentimentColumn({
                    column: Object.values(settings.sentimentColumn)[0][0],
                    maxEntries: settings.maxEntries,
                })
            }

            if (settings.theme === 'light') {
                if (settings.colorblind) setTheme(themes.colorblind)
                else setTheme(themes.light)
            } else {
                if (settings.colorblind) setTheme(themes.colorblindDark)
                else setTheme(themes.dark)
            }
        }, setData)
        onDataAdd(setData)
        onBoardChange(setBoardTitle, setData)
    }, [])

    React.useEffect(() => {
        let listener = () => {
            if (window.innerHeight > window.innerWidth) {
                setChartSize(window.innerWidth)
            } else {
                setChartSize(window.innerHeight)
            }
        }
        window.addEventListener('resize', listener)
        return () => window.removeEventListener('resize', listener)
    })

    return (
        <ThemeContext.Provider value={theme}>
            <Container style={{ background: theme.background }}>
                <Chart data={data} size={chartSize} title={boardTitle} />
            </Container>
        </ThemeContext.Provider>
    )
}

export default App
