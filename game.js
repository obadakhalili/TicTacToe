const msgsBox = document.querySelector('#messages')
const boxes = document.querySelectorAll('.b')

const questions = [
    {
        question: 'Choose Your Symbol',
        options: ['X', 'O']
    },
    {
        question: 'Choose Difficulty',
        options: ['Easy', 'Hard']
    },
    {
        question: 'Who Starts',
        options: ['Me', 'Computer']
    }
]
const winCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
]

let questionPosition = 0
let huSymbol = ''
let coSymbol = ''
let origBoard

const declarePlayer = symbol => symbol === huSymbol ? 'Player' : 'Computer'
const winSequence = (board, symbol) => board.every(el => el === symbol)
const availSpots = () => origBoard.filter(box => typeof box == 'number')
const initTurn = e => takeTurn(parseInt(e.target.getAttribute('id').replace('b', '')), huSymbol)
const addListeners = () => boxes.forEach(box => box.addEventListener('click', initTurn))
const removeListeners = () => boxes.forEach(box => box.removeEventListener('click', initTurn))

document.addEventListener('DOMContentLoaded', getOptions)

function getOptions() {
    msgsBox.classList.remove('d-none')

    const questionsOptions = questions[questionPosition].options.map((option, index, array) => {
        const optionMargin = index < array.length - 1 ? 'mr-2' : ''
        return `<button data-option="${index}" class="btn btn-lg btn-success ${optionMargin}">${option}</button>`
    }).join('')

    msgsBox.innerHTML = `<h2>${questions[questionPosition].question}</h2>${questionsOptions}`

    document.querySelectorAll('[data-option]').forEach(option => option.addEventListener('click', function() {
        const optionID = this.getAttribute('data-option')
        if (!Array.from(Array(questions[questionPosition].options.length).keys()).map(option => option.toString()).includes(optionID)) return
        questions[questionPosition].answer = parseInt(optionID)
        
        if (questionPosition < 2) {
            questionPosition++
            getOptions()
        } else {
            initializeGame()
        }
    }))
}

function initializeGame() {
    origBoard = Array.from(Array(9).keys())
    huSymbol = questions[0].options[questions[0].answer]
    coSymbol = questions[0].options.filter(option => option !== huSymbol)[0]
    boxes.forEach(box => {
        box.textContent = ''
        box.classList = 'b'
    })
    msgsBox.classList.add('d-none')
    turnClick()
}

function turnClick() {
    if (questions[2].answer === 1) takeTurn(bestSpot(coSymbol), coSymbol)
    else addListeners()
}

function takeTurn(box, symbol) {
    if (typeof origBoard[box] !== 'number') return
    if (symbol === huSymbol) removeListeners()

    origBoard[box] = symbol
    document.querySelector(`#b${box}`).textContent = symbol

    const winCheck = checkForWin(origBoard, symbol)
    if (winCheck.foundWin) {
        winCheck.sequenceIds.forEach(el => document.querySelector(`#b${el}`).classList.add('table-success'))
        setTimeout(() => {getResult(`${declarePlayer(symbol)} Won`)}, 750)
        removeListeners()
        return
    } else if (availSpots().length === 0) {
        boxes.forEach(box => box.classList.add('table-secondary'))
        setTimeout(() => {getResult('It\'s A Tie')}, 750)
        removeListeners()
        return
    }

    if (symbol === coSymbol) addListeners()
    else takeTurn(bestSpot(coSymbol), coSymbol)
}

function bestSpot() {
    if (questions[1].answer === 0) return availSpots()[0]
    else return minimax(origBoard, coSymbol).spot
}

function checkForWin(board, symbol) {
    let foundWin = false
    let sequenceIds

    winCombos.forEach(combo => {
        const sequence = [board[combo[0]], board[combo[1]], board[combo[2]]]

        if (winSequence(sequence, symbol)) {
            foundWin = true
            sequenceIds = [combo[0], combo[1], combo[2]]
        }
    })

    return {foundWin: foundWin, sequenceIds: sequenceIds}
}

function minimax(newBoard, symbol) {
    const emptySpots = availSpots()

    if (checkForWin(newBoard, huSymbol).foundWin) return {score: -10}
    else if (checkForWin(newBoard, coSymbol).foundWin) return {score: 10}
    else if (emptySpots.length === 0) return {score: 0}

    const moves = []
    emptySpots.forEach(spot => {
        const move = {}

        move.spot = spot
        newBoard[spot] = symbol

        if (symbol === coSymbol) move.score = minimax(newBoard, huSymbol).score
        else move.score = minimax(newBoard, coSymbol).score

        newBoard[spot] = move.spot
        moves.push(move)
    })

    let bestSpot
    if (symbol === coSymbol) {
        let bestScore = -Infinity

        moves.forEach(move => {
            if (move.score > bestScore) {
                bestScore = move.score
                bestSpot = move
            }
        })
    } else{
        let worstScore = Infinity

        moves.forEach(move => {
            if (move.score < worstScore) {
                worstScore = move.score
                bestSpot = move
            }
        })
    }

    return bestSpot
}

function getResult(result) {
    msgsBox.innerHTML = `<h2>${result}</h2><button class='btn btn-lg btn-success' id='restartGameBtn'>Restart Game</button>`
    msgsBox.classList.remove('d-none')
    document.querySelector('#restartGameBtn').addEventListener('click', () => {
        questionPosition = 0
        getOptions()
    })
}