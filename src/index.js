// 6. It didn’t highlight the squares that caused the winning move.
// 7. It didn’t display a message about draws (aka Cats’ games).

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    let className = props.highlighted ? 'square highlight' : 'square';
    return (
        <button className={className} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

function Checkbox(props) {
    return (
        <input type="checkbox" onClick={props.onClick}/>
    )
}

class Board extends React.Component {
    renderSquare(i) {
        return <Square
            key={i}
            value={this.props.squares[i]}
            onClick={() => this.props.onClick(i)}
            highlighted={this.props.highlight.includes(i)}
        />;
    }

    renderBoard(size) {
        let rows = [];

        for (let i = 0; i < size; i++) {
            let columns = [];

            for (let j = 0; j < size; j++) {
                columns.push(this.renderSquare(size * i + j));
            }
            rows.push(<div key={i} className="board-row">{columns}</div>);
        }
        return rows;
    }

    render() {
        let size = this.props.size;
        return (
            <div>
                {this.renderBoard(size)}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(props.size ** 2).fill(null),
            }],
            xIsNext: true,
            stepNumber: 0,
            sortAscending: false,
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares)[0] || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        })
    }

    getCoords(past, current) {
        for (let i = 0; i < current.squares.length; i++) {
            if ((past.squares[i] === null) && (current.squares[i] !== null)) {
                let col = (i % 4) + 1;
                let row = Math.floor(i / 4) + 1;
                return row + "," + col;
            }
        }
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];

        let winningLine = calculateWinner(current.squares);
        let winner = null;
        if (winningLine) {
            winner = current.squares[winningLine[0]];
        }

        let coords;
        if (this.state.stepNumber > 0) {
            const past = history[this.state.stepNumber - 1];
            coords = this.getCoords(past, current);
        }

        const moves = history.map((step, move) => {
            let current = history[move];
            let past = history[move - 1];
            if (!past) {
                past = {squares: Array(this.props.size).fill(null)};
            }
            let coords = this.getCoords(past, current);
            let isCurrentStep = this.state.stepNumber === move;
            const desc = move ?
                'Go to move #' + move + " at (" + coords + ")" :
                'Go to game start';
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>{isCurrentStep ? <b>{desc}</b> : desc}</button>
                </li>
            );
        });

        if (this.state.sortAscending) {
            moves.reverse();
        }

        let status;
        if (!current.squares.includes(null) && !winner) {
            status = 'Draw';
            alert('Game ended in a draw.')
        }
        if (winner) {
            status = 'Winner: ' + winner;
        }
        if (!winner && current.squares.includes(null)) {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        highlight={winningLine}
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        size={this.props.size}/>
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div>Recent move (row, col): {coords}</div>
                    Sort by ascending order: <Checkbox onClick={(i) => this.handleSortClick(i)}/>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }

    handleSortClick(i) {
        this.setState({
            sortAscending: i.target.checked,
        })
    }
}

// ========================================

ReactDOM.render(
    <Game size={prompt('Give the size of the board')}/>,
    document.getElementById('root')
);

function calculateWinner(squares) {
    let size = Math.sqrt(squares.length);
    let lines = getWinningLines(size);
    for (let i = 0; i < lines.length; i++) {
        if (checkLine(lines[i], squares)) {
            return lines[i];
        }
    }
    return [null];
}

function checkLine(line, squares) {
    let lastVal = squares[line[0]];
    if (!lastVal) {
        return false;
    }

    let check = true;
    for (const val of line) {
        check = check && (lastVal === squares[val]);
    }
    return check;
}

function getWinningLines(size) {
    let lines = [];
    let line;

    for (let i = 0; i < size ** 2; i += size) {
        let line = [];

        for (let j = i; j < i + size; j++) {
            line.push(j);
        }

        lines.push(line);
    }

    line = [];
    for (let i = 0; i < size ** 2; i += size + 1) {
        line.push(i);
    }
    lines.push(line);

    line = [];
    for (let i = size - 1; i <= size ** 2 - size; i += size - 1) {
        line.push(i);
    }
    lines.push(line);

    for (let i = 0; i < size; i++) {
        let line = [];

        for (let j = i; j < size ** 2; j += size) {
            line.push(j);
        }

        lines.push(line);
    }
    return lines;
}
