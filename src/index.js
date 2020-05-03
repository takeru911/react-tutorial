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
                className={winSquares && winSquares.includes(i) ? 'win square': 'square'}
                key={i}
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    buildBoardElement(boardSize) {
        let boardElements = []
        for(let row = 0; row < boardSize; row++){
            let rows = [];
            for(let col = 0; col < boardSize; col++){
                rows.push(this.renderSquare(row * boardSize + col));
            }
            boardElements.push(
                <div key={row} className="board-row" >{rows}</div>
            )
        }

        return boardElements;
    }

    render() {
        const boardSize = 3;
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

    sortClick(){
        this.setState({
                isAscSorted: !this.state.isAscSorted
            }
        )
    }



    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winInfo = calculateWinner(current.squares);
        const winner = winInfo.winner;
        const winSquares = winInfo.winSquares;
        const moves = history.map((step, move) => {
            const clickCol = Math.floor(step.clickSquare / 3);
            const clickRow = step.clickSquare % 3;
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
        if(!this.state.isAscSorted) {
            moves.reverse();
        }

        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }
        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        winSquares={winSquares}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <button onClick={() => this.sortClick()}>{this.state.isAscSorted ? 'sort desc' : 'sort asc'}</button>
                    {this.state.isAscSorted ?
                        <ol>{moves}</ol>:
                        <ol reversed="reversed">{moves}</ol>
                    }

                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game/>,
    document.getElementById('root')
);

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {
                winner: squares[a],
                winSquares: [a, b, c],
            }

        }
    }
    return {
        winner: null,
        winSquares: null,
    };
}