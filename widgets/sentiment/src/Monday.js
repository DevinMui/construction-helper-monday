import mondaySdk from 'monday-sdk-js'

const monday = mondaySdk()

export function showError(e) {
    monday.execute('error', e)
}

// There is currently no way to remove listeners
// thank you monday, very cool

export function onSettingsChange(cb, dataChange) {
    monday.listen('settings', (res) => {
        cb(res.data)
        if (dataChange) onDataChange(dataChange)
    })
}

export function onBoardChange(titleChange, dataChange) {
    monday.listen('context', async ({ data }) => {
        if (data.boardIds.length === 0) {
            titleChange(null)
            dataChange(undefined)
            return
        }
        id = data.boardIds[0]
        // let query = `query { boards( ids: ${id} ) { name } }`
        let query = `query { boards(ids: ${id}) {name}}`
        const board = await monday.api(query)
        const name = board.data.boards[0].name
        titleChange(name)

        onDataChange(dataChange)
    })
}

let column = { maxEntries: 25 }
let id = ''

export function setSentimentColumn(e) {
    column = e
}

export function getSentimentColumn() {
    return column
}

function integrateRight(min, max, a) {
    // 18d2 + (-36a+60)d
    const j = Math.max(min, a)
    const z = Math.min(max, a + 10 / 6)

    if (a + 10 / 6 < min) return 0

    const calc = (d) => -18 * d * d + d * (36 * a + 60)
    let res = calc(z) - calc(j)
    res = res < 0 ? 0 : res
    return res / 10
}

function integrateLeft(min, max, a) {
    // 18d2 + (-36a+60)d
    const j = Math.max(min, a - 10 / 6)
    const z = Math.min(max, a)

    if (a - 10 / 6 > max) {
        return 0
    }
    const calc = (d) => 18 * d * d + 60 * d - 36 * a * d
    let res = calc(z) - calc(j)
    res = res < 0 ? 0 : res
    return res / 10
}

function calculate(sentiment) {
    sentiment = Number.parseFloat(sentiment)
    const a = (20 * sentiment) / 3 + 10 / 6

    let [positive, neutral, negative] = [0, 0, 0]

    // positive
    positive = integrateLeft(0, 10 / 3, a) + integrateRight(0, 10 / 3, a)

    // neutral
    neutral =
        integrateLeft(10 / 3, 20 / 3, a) + integrateRight(10 / 3, 20 / 3, a)

    // negative
    negative = integrateLeft(20 / 3, 10, a) + integrateRight(20 / 3, 10, a)

    let res = {
        sentiment,
        positive,
        neutral,
        negative,
    }
    return res
}

async function onDataChange(cb) {
    const query = `query{boards(ids:${id}){items(limit:${column.maxEntries}){column_values{id,value}}}}`
    const boardData = await monday.api(query)
    const items = boardData.data.boards[0].items

    let colValues = items.map((i) => i.column_values)
    if (colValues.length <= 1) return cb(undefined)
    colValues = colValues.slice(1) // remove first item, contains col names

    let columnIndex = -1
    for (let i = 0; i < colValues[0].length; i++) {
        if (colValues) {
            if (colValues[0][i].id === column.column) {
                columnIndex = i
                break
            }
        }
    }
    if (columnIndex === -1) return cb(undefined)
    let values = []
    for (let i = 0; i < colValues.length; i++) {
        if (colValues[i][columnIndex])
            values.push(colValues[i][columnIndex].value.replace(/[^\d.-]/g, ''))
    }

    let final = {
        total: values.length,
        positive: {
            total: 0,
            calculated: 0,
        },
        neutral: {
            total: 0,
            calculated: 0,
        },
        negative: {
            total: 0,
            calculated: 0,
        },
    }

    for (let value of values) {
        const calculated = calculate(value)
        // console.log(calculated)

        final.negative.calculated += calculated.negative
        final.neutral.calculated += calculated.neutral
        final.positive.calculated += calculated.positive

        if (value > 2 / 3) {
            final.negative.total = final.negative.total + 1
        } else if (value > 1 / 3) {
            final.neutral.total = final.neutral.total + 1
        } else {
            final.positive.total = final.positive.total + 1
        }
    }

    final.positive.percent = (final.positive.total / final.total) * 100
    final.neutral.percent = (final.neutral.total / final.total) * 100
    final.negative.percent = (final.negative.total / final.total) * 100

    // console.log(final)
    cb(final)
}

export function onDataAdd(setData) {
    monday.listen('events', (e) => {
        const boardId = e.data.boardId
        if (boardId === id) {
            onDataChange(setData)
            console.log(e)
        }
    })
}
