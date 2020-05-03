import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button className={props.className} onClick={props.onClick}>
            {props.value}
        </button>
    )
}

class Board extends React.Component {
    renderSquare(i) {
        const winSquares = this.props.winSquares;
        return (
            <Square
                className={winSquares && winSquares.includes(i) ? 'win square' : 'square'}
                key={i}
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    buildBoardElement(boardSize) {
        let boardElements = []
        for (let row = 0; row < boardSize; row++) {
            let rows = [];
            for (let col = 0; col < boardSize; col++) {
                rows.push(this.renderSquare(row * boardSize + col));
            }
            boardElements.push(
                <div key={row} className="board-row">{rows}</div>
            )
        }

        return boardElements;
    }

    render() {
        const boardSize = this.props.boardSize;
        const boardElements = this.buildBoardElement(boardSize);
        return (
            <div>
                {boardElements}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null)
            }],
            stepNumber: 0,
            xIsNext: true,
            isAscSorted: true,
        }
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[this.state.stepNumber];
        const squares = current.squares.slice();
        const winInfo = calculateWinner(squares);
        if (winInfo.winner || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
                clickSquare: i,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext
        });
    }

    jumpTo(step) {
        this.setState({
                stepNumber: step,
                xIsNext: (step % 2) === 0,
            }
        )
    }

    sortClick() {
        this.setState({
                isAscSorted: !this.state.isAscSorted
            }
        )
    }

    render() {
        const boardSize = this.props.boardSize;
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winInfo = calculateWinner(current.squares);
        const winner = winInfo.winner;
        const winSquares = winInfo.winSquares;
        const moves = history.map((step, move) => {
            const clickCol = Math.floor(step.clickSquare / boardSize);
            const clickRow = step.clickSquare % boardSize;
            const desc = move ?
                `Go to Move # ${move}, (${clickCol}, ${clickRow})` :
                'Go to game start';
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>
                        {this.state.stepNumber === move ?
                            <b>{desc}</b> :
                            desc
                        }
                    </button>
                </li>
            )
        });
        if (!this.state.isAscSorted) {
            moves.reverse();
        }

        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
            if (this.state.stepNumber === boardSize * boardSize) {
                status = '引き分けでしたよっと'
            }
        }
        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        winSquares={winSquares}
                        boardSize={boardSize}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <button
                        onClick={() => this.sortClick()}>{this.state.isAscSorted ? 'sort desc' : 'sort asc'}</button>
                    {this.state.isAscSorted ?
                        <ol>{moves}</ol> :
                        <ol reversed="reversed">{moves}</ol>
                    }

                </div>
            </div>
        );
    }
}

// ========================================
const range = (from, to, step = 1) =>
    from < to || (!to && from > 0)
        ? [...Array(to ? (to - from) / step : from)].map((v, i) =>
            to
                ? from + i * step
                : i
        )
        : []
const boardSize = 5;
let winLines = [];
for (let i = 0; i < boardSize; i++) {
    winLines.push(range(i * boardSize, (i + 1) * boardSize));
}
for (let i = 0; i < boardSize; i++) {
    winLines.push(range(i, boardSize * boardSize + i, boardSize));
}
winLines.push(range(0, boardSize * (boardSize + 1), boardSize + 1));
winLines.push(range(boardSize - 1, (boardSize - 1) * (boardSize + 1), boardSize - 1));
console.log(winLines);
ReactDOM.render(
    <Game
        boardSize={boardSize}
    />,
    document.getElementById('root')
);

function calculateWinner(squares) {
    for (let i = 0; i < winLines.length; i++) {
        const winLine = winLines[i];
        const marker = squares[winLine[0]];
        if (!marker) {
            continue;
        }
        let isExit = true;
        for (let j = 0; j < winLine.length; j++) {
            if (marker !== squares[winLine[j]]) {
                isExit = false;
            }
        }
        if (isExit)
            return {
                winner: marker,
                winSquares: winLine,
            }
    }
    return {
        winner: null,
        winSquares: null,
    };
}