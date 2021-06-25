let grid;
const resolution    = 10;
const window_height = parseInt(window.innerHeight * 70 / 100);
const window_width  = parseInt(window.innerWidth * 80 / 100);
const height        = window_height - (window_height % resolution);
const width         = window_width - (window_width % resolution);
const rows          = height / resolution;
const cols          = width / resolution;
const frame_rate    = 1;
const border_width  = .05;

let simulation_started  = false;
let ultimate_trooth     = false;
let can_loop            = false;
let generation          = 0;
let total_live          = 0;
let total_dead          = 0;
let total_born          = 0;
let maximum_age         = 1;

// analysys
const scorecard_width           = 180;
const scorecard_height          = 80;
const percentage_chart_width    = 300;
const percentage_chart_height   = 20;
// color
const just_died_color           = 'rgba(255, 10, 10, 1)';
const just_born_color           = 'rgba(200, 255, 0, 1)';
const aging_color               = 'rgba(0, 158, 0, 1)';
const alive_color               = 'rgba(0, 0, 255, 1)';
const old_color                 = 'rgba(200, 0, 255,1)';
const beyond_color              = 'rgba(0, 0, 0, 1)';

const scoreboard_color          = 'rgba(0,0,200, .3)';
const scoreboard_text_color     = 'rgba(0,0,0,1)';

const percentage_chart_alive_color  = 'rgba(0, 150, 0, .5)';
const percentage_chart_dead_color   = 'rgba(255, 100, 0, .5)';
const percentage_chart_bg_color     = 'rgba(100, 100, 100, .5)';
class Creature {
    constructor(x, y, state, life_span) {
        this.x          = x;
        this.y          = y;
        this.state      = state;
        this.life_span  = life_span;
        this.just_died  = false;
        this.just_born  = false;
        this.neighbours = [
            [x-1, y],
            [x-1, y-1],
            [x, y-1],
            [x+1, y-1],
            [x+1, y],
            [x+1, y+1],
            [x, y+1],
            [x-1, y+1]
        ];
    }
    updateState() {
        let sum         = 0;
        let neighbours  = this.neighbours;
        for (let i = 0; i < neighbours.length; i++) {
            if (this.x == 0 && this.y == 0 && ((i >= 0 && i < 4) || (i > 6 && i < 8))) {
                sum += 0;
            } else if (this.x == cols && this.y == 0 && (i > 0 && i < 5)) {
                sum += 0;
            } else if (this.x == cols && this.y == rows && (i > 3 && i < 8)) {
                sum += 0;
            } else if (this.x == 0 && this.y == rows && ((i >= 0 && i < 2) || (i > 4 && i < 8))) {
                sum += 0;
            } else if (this.x == 0 && ((i >= 0 && i < 2) || (i > 6 && i < 8))) {
                sum += 0;
            } else if (this.y == 0 && (i > 0 && i < 4)) {
                sum += 0;
            } else if (this.x == cols && (i > 2 && i < 6)) {
                sum += 0;
            } else if (this.y == rows && (i > 4 && i < 8)) {
                sum += 0;
            } else {
                sum += grid[neighbours[i][0]][neighbours[i][1]].state
            }
        }
        if (ultimate_trooth && this.state == 1 && this.life_span >= maximum_age) {
            this.state      = 0;
            this.just_died  = true;
            this.just_born  = false;
            this.life_span  = 0;
        } else if (sum > 2  && this.state == 0) {
            this.state      = 1;
            this.just_died  = false;
            this.just_born  = true;
            this.life_span  = 0;
        } else if ((sum < 2 || sum > 3) && this.state == 1) {
            this.state      = 0;
            this.just_died  = true;
            this.just_born  = false;
            this.life_span  = 0;
        } else if (sum > 1 && sum < 4 && this.state == 1) {
            this.just_born  = false;
            this.life_span  += 1;
        } else if (sum < 2 || sum > 3 && this.state == 0) {
            this.just_died  = false;
            this.life_span  = 0;
        } else {
            if (this.just_died) {
                this.just_died = false;
                this.life_span = 0;
            }
            if (this.just_born) {
                this.just_born = false;
                this.life_span += 1;
            }
        }
    }
    changeState() {
        this.state      = this.state == 0?1:0;
        this.life_span  = this.state == 0?0:0;
        this.just_born  = this.state == 0?false:true;
        total_live      += this.state == 0?-1:1;
        total_born      = total_live;
    }
}
function setup() {
    let gameboard   = createCanvas(width, height);
    gameboard.parent('game_board');
    background(0);
    grid            = createGrid();
    frameRate(frame_rate);
}
function draw() {
    clear();
    for (let i = 0; i<=cols; i++) {
        for (let j = 0; j<=rows; j++) {
            let node = grid[i][j];
            if (node.state == 0) {
                if (node.just_died) {
                    fill(just_died_color);
                    strokeWeight(border_width);
                    stroke(0);
                } else {
                    fill(255);
                    strokeWeight(border_width);
                    stroke(0);
                }
            } else {
                if (node.just_born) {
                    fill(just_born_color);
                    strokeWeight(border_width);
                    stroke(0);
                } else {
                    if (node.life_span > 3) {
                        fill(beyond_color);
                    } else if (node.life_span > 2) {
                        fill(old_color);
                    } else if (node.life_span > 1) {
                        fill(alive_color);
                    } else if (node.life_span > 0) {
                        fill(aging_color)
                    }
                    strokeWeight(border_width);
                    stroke(255);
                }
            }
            rect(i * resolution, j * resolution, resolution, resolution);
        }
    }
    if (simulation_started) {
        generation += 1;
        runSimulation();
    }
    createAnalysisArea();
    createColorinfo();
    createPercentageChart()
}
function createAnalysisArea() {
    // analysys
    fill(scoreboard_color);
    rect(resolution * cols - scorecard_width, 0, scorecard_width, scorecard_height+10);
    fill(scoreboard_text_color);
    textSize(15);
    // generation
    text("Generation: "+generation, resolution * cols - scorecard_width + 5, (scorecard_height/4)*1);
    // total live
    text("Live: "+total_live, resolution * cols - scorecard_width + 5, (scorecard_height/4)*2);
    // just born
    text("Recent Born: "+total_born, resolution * cols - scorecard_width + 5, (scorecard_height/4)*3);
    // just died
    text("Recent Death: "+total_dead, resolution * cols - scorecard_width + 5, (scorecard_height/4)*4);
}
function createColorinfo() {
    // boxes
    // just died
    fill(just_died_color);
    rect(10, 10, 15, 15);
    // just born
    fill(just_born_color);
    rect(10, 30, 15, 15);
    // aging
    fill(aging_color);
    rect(10, 50, 15, 15);
    // alive
    fill(alive_color);
    rect(10, 70, 15, 15);
    // old
    fill(old_color);
    rect(10, 90, 15, 15);
    // beyond
    fill(beyond_color);
    rect(10, 110, 15, 15);
    // text
    fill(scoreboard_text_color);
    textStyle(BOLD);
    textSize(12)
    text("Just Died", 30, 22);
    text("Just Born", 30, 42);
    text("Age 1 Gen.", 30, 62);
    text("Age 2 Gen.", 30, 82);
    text("Age 3 Gen.", 30, 102);
    text("The ultimate Age", 30, 122);
}
function createPercentageChart() {
    let total           = total_live + total_dead - total_born;
    let born_percentage = (total_born/total)*100;
    let dead_percentage = (total_dead/total)*100;
    let born_value      = percentage_chart_width * (born_percentage/100);
    let dead_value      = percentage_chart_width * (dead_percentage/100);
    fill(percentage_chart_bg_color);
    rect(resolution * cols - percentage_chart_width, resolution * rows - percentage_chart_height * 2, percentage_chart_width, percentage_chart_height * 2);
    fill(percentage_chart_alive_color);
    rect(resolution * cols - percentage_chart_width, resolution * rows - percentage_chart_height, born_value, percentage_chart_height);
    fill(percentage_chart_dead_color);
    rect(resolution * cols - percentage_chart_width, resolution * rows - percentage_chart_height * 2, dead_value, percentage_chart_height);

}
function startSimulation(e) {
    simulation_started  = !simulation_started;
    can_loop            = !can_loop;
    if (simulation_started) {
        e.innerText = "Stop Simulation";
        e.setAttribute("class", "btn btn-danger")
    } else {
        e.innerText = "Start Simulation";
        e.setAttribute("class", "btn btn-primary")
    }
    console.log(simulation_started);
}

function runSimulation() {
    let temp_grid = copyGrid(grid, true);
    for (let i = 0; i<cols; i++) {
        for (let j = 0; j<rows; j++) {
            temp_grid[i][j].updateState();
        }
    }
    let t = grid;
    grid = copyGrid(temp_grid);
}
function copyGrid(c_grid, calculate=false) {
    let all_live        = 0;
    let all_just_died   = 0;
    let all_just_born   = 0;
    let new_grid        = new Array();
    for (let i = 0; i<=cols; i++) {
        new_grid[i] = new Array();
        for (let j = 0; j<=rows; j++) {
            all_live        += c_grid[i][j].state==1?1:0;
            all_just_born   += c_grid[i][j].just_born?1:0;
            all_just_died   += c_grid[i][j].just_died?1:0;
            let obj         = new Creature(i, j, c_grid[i][j].state, c_grid[i][j].life_span);
            obj.just_died   = c_grid[i][j].just_died;
            obj.just_born   = c_grid[i][j].just_born;
            new_grid[i][j]  = obj;
        }
    }
    if (calculate) {
        total_live = all_live;
        total_dead = all_just_died;
        total_born = all_just_born;
    }
    return new_grid;
}
function createGrid() {
    let grid = new Array();
    for (let i = 0; i<=cols; i++) {
        grid[i] = new Array();
        for (let j = 0; j<=rows; j++) {
            grid[i][j] = new Creature(i, j, 0, 0);
        }
    }
    return grid;
}
function mouseClicked() {
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
    } else {
        let x   = parseInt(mouseX / resolution);
        let y   = parseInt(mouseY / resolution);
        let node= grid[x][y];
        if (node.state == 0) {
            fill(just_born_color);
            stroke(0);
        } else {
            fill(255);
            stroke(0);
        }
        rect(mouseX - (mouseX % resolution), mouseY - (mouseY % resolution), resolution, resolution);
        node.changeState();
    }
    // return false;
}