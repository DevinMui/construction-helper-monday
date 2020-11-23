import React from 'react'
import styled from 'styled-components'
import TextTransition from 'react-text-transition'
import { ThemeContext } from './Themes'

const Container = styled.div`
    text-align: center;
    width: ${(props) => props.size}px;
    height: ${(props) => props.size}px;
    background: ${(props) => props.theme.background};
    color: ${(props) => props.theme.color};
`

const PieChart = styled.figure`
    border-radius: 50%;
    margin: 0 auto;
    position: relative;
    svg .donut-segment {
        cursor: pointer;
        transition: 0.3s all;
    }
    .chart-text {
        font-size: 16px;
        fill: #000;
        transform: translateY(0.25em);
    }

    .chart-number {
        font-size: 13px;
        line-height: 1;
        text-anchor: middle;
        transform-origin: center;
        transform: translate(4px, -5px) rotate(90deg) scaleY(-120%);
    }
`

const FlavorText = styled(TextTransition)`
    font-size: calc(16px + (40 - 16) * ((100vh - 300px) / (1600 - 300)));
    margin: calc(16px + (40 - 16) * ((100vh - 300px) / (1600 - 300)));
    .text-transition_inner {
        text-align: center;
        display: flex;
        justify-content: space-around;
    }
`

const ChartTitle = styled.div`
    margin: calc(24px + (48 - 24) * ((100vh - 300px) / (1600 - 300)));
    font-size: calc(24px + (48 - 24) * ((100vh - 300px) / (1600 - 300)));
`

function getCenter(data) {
    // ;-D :-D ;-) :-) :-| :-/  :-( :'(
    if (!data) {
        return ':-0'
    }

    const average =
        ((data.positive.calculated * 10) / data.total -
            (data.negative.calculated * 10) / data.total +
            100) /
        200
    if (average < 0.05) {
        return '>:('
    } else if (average < 0.15) {
        return `:'(`
    } else if (average < 0.25) {
        return ':-('
    } else if (average < 0.35) {
        return ':-/'
    } else if (average < 0.45) {
        return ':-|'
    } else if (average < 0.55) {
        return ':-|'
    } else if (average < 0.65) {
        return ':-|'
    } else if (average < 0.75) {
        return ':-)'
    } else if (average < 0.85) {
        return ';-)'
    } else if (average < 0.95) {
        return ':-D'
    } else {
        return ';-D'
    }
}

function getFlavor(data, timerInt) {
    if (!data) return `There doesn't seem to be any sentiment data... yet.`

    const average =
        ((data.positive.calculated * 10) / data.total -
            (data.negative.calculated * 10) / data.total +
            100) /
        200

    if (timerInt % 2) {
        return `Your average rating is ${(average * 100).toFixed(2)}%.`
    }

    let newText = `Overall, your table is `
    if (average < 0.05) {
        newText += 'overwhelmingly negative'
    } else if (average < 0.15) {
        newText += 'very negative'
    } else if (average < 0.25) {
        newText += 'quite negative'
    } else if (average < 0.35) {
        newText += 'negative'
    } else if (average < 0.45) {
        newText += 'somewhat negative'
    } else if (average < 0.55) {
        newText += 'neutral'
    } else if (average < 0.65) {
        newText += 'somewhat positive'
    } else if (average < 0.75) {
        newText += 'positive'
    } else if (average < 0.85) {
        newText += 'quite positive'
    } else if (average < 0.95) {
        newText += 'very positive'
    } else {
        newText += 'overwhelmingly positive'
    }
    return newText + '.'
}

const Chart = (props) => {
    const data = props.data
    let [hover, setHover] = React.useState(undefined)
    let [flavorText, setFlavorText] = React.useState('')

    let [timer, setTimer] = React.useState(0)
    let [timerInt, setTimerInt] = React.useState(0)

    const theme = React.useContext(ThemeContext)

    function resetFlavorText() {
        setHover(undefined)
        setFlavorText('')
        setTimer(
            setInterval(() => {
                setTimerInt((prev) => prev + 1)
            }, 5000)
        )
    }

    React.useEffect(resetFlavorText, [])

    function createFlavorText(type) {
        setHover(type)
        clearTimeout(timer)
        if (!data) return setFlavorText(getFlavor(data))
        let text = ''
        switch (type) {
            case 'positive':
                text = `Out of ${
                    data.total
                } entries, ${data.positive.percent.toFixed(2)}% were positive.`
                if (data.positive.percent > 50) text += ' Great job!'
                break
            case 'neutral':
                text = `Out of ${
                    data.total
                } entries, ${data.neutral.percent.toFixed(2)}% were neutral.`
                break
            case 'negative':
                text = `Out of ${
                    data.total
                } entries, ${data.negative.percent.toFixed(2)}% were negative.`
                break
        }
        setFlavorText(text)
    }

    return (
        <Container size={props.size} theme={theme}>
            <ChartTitle>{props.title}</ChartTitle>
            <PieChart size={props.size}>
                {/* https://medium.com/@heyoka/scratch-made-svg-donut-pie-charts-in-html5-2c587e935d72 */}
                <svg
                    width={props.size * 0.66 + 'px'}
                    height={props.size * 0.66 + 'px'}
                    viewBox="0 0 42 42"
                    className="donut"
                >
                    <circle
                        className="donut-hole"
                        cx="21"
                        cy="21"
                        r="15.91549430918954"
                        fill={theme.background}
                    />

                    <circle
                        onMouseEnter={() => createFlavorText('positive')}
                        onMouseLeave={resetFlavorText}
                        pointerEvents="visibleStroke"
                        className="donut-segment"
                        cx="21"
                        cy="21"
                        r="15.91549430918954"
                        fill="transparent"
                        stroke={theme.green}
                        strokeWidth={hover === 'positive' ? 4 : 3}
                        strokeDasharray={
                            data &&
                            (data.positive.calculated * 10) / data.total +
                                ' ' +
                                (100 -
                                    (data.positive.calculated * 10) /
                                        data.total)
                        }
                        strokeDashoffset="25"
                    />

                    <circle
                        onMouseEnter={() => createFlavorText('neutral')}
                        onMouseLeave={resetFlavorText}
                        pointerEvents="visibleStroke"
                        className="donut-segment"
                        cx="21"
                        cy="21"
                        r="15.91549430918954"
                        fill="transparent"
                        stroke={theme.yellow}
                        strokeWidth={hover === 'neutral' ? 4 : 3}
                        strokeDasharray={
                            data &&
                            (data.neutral.calculated * 10) / data.total +
                                ' ' +
                                (100 -
                                    (data.neutral.calculated * 10) / data.total)
                        }
                        strokeDashoffset={
                            data &&
                            100 -
                                (data.positive.calculated * 10) / data.total +
                                25
                        }
                    />

                    <circle
                        onMouseEnter={() => createFlavorText('negative')}
                        onMouseLeave={resetFlavorText}
                        pointerEvents="visibleStroke"
                        className="donut-segment"
                        cx="21"
                        cy="21"
                        r="15.91549430918954"
                        fill="transparent"
                        stroke={theme.red}
                        strokeWidth={hover === 'negative' ? 4 : 3}
                        strokeDasharray={
                            data &&
                            (data.negative.calculated * 10) / data.total +
                                ' ' +
                                (100 -
                                    (data.negative.calculated * 10) /
                                        data.total)
                        }
                        strokeDashoffset={
                            data &&
                            100 -
                                (data.positive.calculated * 10) / data.total -
                                (data.neutral.calculated * 10) / data.total +
                                25
                        }
                    />

                    <g className="chart-text">
                        <text
                            x="50%"
                            y="50%"
                            className="chart-number"
                            dy={data ? '0,0,0.75' : '0,0,1.25'}
                            dx="0.5,0.5,0.66"
                            fill={theme.color}
                        >
                            {getCenter(data)}
                        </text>
                    </g>
                </svg>
            </PieChart>
            <FlavorText text={flavorText || getFlavor(data, timerInt)} />
        </Container>
    )
}

export default Chart
