/*
TODO:
Spash screen that is pixelated NYT cover - Zoom into date location
Frog spritesheet
Add timer
Add increase and decrease gems
Add start and finish
Add reset on out of bounds
Walls are sticky sometimes when sliding - not a major issue but is annoying
*/

let isJumping = false;
let jumpTimer = 0;
const maxJumpTime = 200;
const jumpHoldForce = -20;
const xVeloDecay = 1000;
const xVeloMax = 200;
const xVeloAccel = 1000;
const xAirAccel = 300;
const jumpForce = -200;
const xWallJumpVelo = 50;
let ground;
let timerText;
let startTime = 0;
let timerStarted = false;


const config = {
type: Phaser.AUTO,
width: window.innerWidth,
height: window.innerHeight,
backgroundColor: '#FFFFFF',
physics: {
default: 'arcade',
arcade: {
    gravity: { y: 1000 },
    debug: true
    },
render: {
    pixelArt: true
}
},
scene: {
preload: preload,
create: create,
update: update
}
};

let player;
let cursors;

function preload() {
    this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
    this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
}

function create() {

    const graphics = this.add.graphics();
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('blackTile', 32, 32);
    graphics.destroy();

    // Ground
    const levelWidth = generateLevel(this);

    // Player
    player = this.physics.add.sprite(128, 256, 'player').setScale(1);
    player.setBounce(0);
    player.setCollideWorldBounds(false);
    player.setDragX(xVeloDecay);
    player.setDragY(0);
    player.setMaxVelocity(xVeloMax, 1000);
    player.setSize(player.width - 4, player.height - 2);
    player.setOffset(2, 1);

    this.physics.add.collider(player, ground);

    // Camera
    scene = this;
    scene.cameras.main.startFollow(player);
    scene.cameras.main.setBounds(0, 0, levelWidth + 120, config.height);
    scene.physics.world.setBounds(0, 0, levelWidth + 120, config.height);
    scene.cameras.main.setZoom(.75);

    // Debug
        scene.physics.world.createDebugGraphic();
        scene.physics.world.drawDebug = true;
        scene.physics.world.debugGraphic.setAlpha(0.7);

    // Timer

        timerText = this.add.text(1,1, 'Time: 0.000', {
            fontSize: '20px',
            fill: '#000000',
            fontFamily: 'monospace'
        });

        this.input.keyboard.on('keydown', () => {
            if (!timerStarted) {
                timerStarted = true;
                startTime = this.time.now;
            }
        });
        timerText.setScrollFactor(0);


    // Controls
    cursors = this.input.keyboard.createCursorKeys();
}
// Function to create date format used in levels
function getDate(){
    // Get date
    const date = new Date();

    // Convert day of week to string
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayIndex = date.getDay();
    const dayString = days[dayIndex];

    // Convert month to string
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'];
    const monthIndex = date.getMonth();
    const monthString = months[monthIndex];

    // Get last bits
    const year =  date.getFullYear();
    const day = date.getDate();

    // Determine date suffix
    let suffix = "";
    if (day % 10 === 1 && day !== 11){
        suffix = "st";
    }
    else if (day % 10 === 2 && day !== 12){
        suffix = "nd";
    }
    else if (day % 10 === 3 && day !== 13){
        suffix = "rd";
    }
    else {
        suffix = "th";
    };

    // Concatenate date
    const finalDate = dayString + " " + monthString 
    + " " + day + suffix + ", " +  year;

    console.log(finalDate);
    return finalDate;
}


//Construct level from tilemaps
function generateLevel(scene){
    const placed = new Set();

    const dateString = getDate();
    const startX = 50;
    const startY = 250;
    const spacing = 240;
    const tileSize = 32;
    const numRows = 16;
    const numCols = 7;
    const levelWidth = startX + dateString.length * spacing;
    ground = scene.physics.add.staticGroup();

    for (let i = 0; i < dateString.length; i++) {
        const ch = dateString[i];
        const xGap = startX + i * spacing;

        // Grab tilemap
        let map = getTile(ch);
        if (map === 0){
            continue;
        }
        // Generate ground based on tilemaps
        // CHANGE THIS IF YOU ALTER THE TILEMAPPINGS
        for(let row=0; row<numRows; row++){
            for(let col=0; col<numCols; col++){
                if (map[row][col]==="#"){
                    const x = Math.round(startX + xGap + col * tileSize);
                    const y = Math.round(startY + row * tileSize);
                    const key = `${x}, ${y}`;
                    if (placed.has(key)) continue;
                    placed.add(key);

                    ground.create(x + 8, y + 32, 'blackTile')
                    .refreshBody();
                }
            }
        }
    }
    return levelWidth;
}
// Getter
function getTile(tileMap){
    console.log(tileMap);
    if (tileMap === null){
        console.log("Yer shits fucked up");
        return 0;
    }
    const map = charTilemaps[tileMap];
    return map;        
}
// These are tilemaps for every letter needed in date format
const charTilemaps = {
    'A': [
        ".......",
        ".......",
        "...#...",
        "...#...",
        "...#...",
        "..#.#..",
        "..#.#..",
        "..#.#-.",
        ".#...#.",
        ".#...#.",
        ".#...#.",
        ".#####.",
        "#.....#",
        "#.....#",
        "#.....#",
        ".......",

    ],
    'a': [
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        "...+...",
        ".####..",
        "#....#.",
        "#....#.",
        ".....#.",
        ".#####.",
        "#....#.",
        "#....#.",
        "#...##.",
        ".###..#",
        ".......",

    ],
    'b': [
        ".......",
        ".......",
        ".......",
        "#......",
        "#......",
        "#......",
        "#.###..",
        "##...#.",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        "##...#.",
        "#.###..",
        ".......",

    ],
    'c': [
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        "..###..",
        ".#...#.",
        "#.....#",
        "#......",
        "#......",
        "#......",
        "#.....#",
        ".#...#.",
        "..###..",
        ".......",

    ],
    'D': [
        ".......",
        ".+.....",
        "#####..",
        "#....#.",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        "#....#.",
        "#####..",
        ".......",

    ],
    'd': [
        ".......",
        ".......",
        "......#",
        "......#",
        "......#",
        "......#",
        "..###-#",
        ".#...##",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        ".#...##",
        "..###.#",
        ".......",

    ],
    'e': [
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        ".....+..",
        "..###..",
        ".#...#.",
        "#.....#",
        "#.....#",
        "#######",
        "#......",
        "#.....#",
        ".#...#.",
        "..###..",
        ".......",

    ],

    'F': [
        ".......",
        ".......",
        "#######",
        "#......",
        "#......",
        "#......",
        "#.-....",
        "#......",
        "######.",
        "#......",
        "#......",
        "#......",
        "#......",
        "#......",
        "#......",
        ".......",

    ],
    'g': [
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        ".....+.",
        ".####.#",
        "#....#.",
        "#....#.",
        "#....#.",
        ".####..",
        "#......",
        ".#####.",
        "#.....#",
        "#.....#",
        ".#####.",

    ],
    'h': [
        ".......",
        ".......",
        ".......",
        "#......",
        "#......",
        "#..-...",
        "#.###..",
        "##...#.",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        ".......",

    ],
    'i': [
        ".......",
        ".......",
        ".......",
        "...#...",
        "...#...",
        ".......",
        "...#...",
        "...#...",
        "...#-..",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        ".......",

    ],
    'J': [
        ".......",
        ".......",
        "......#",
        "......#",
        "......#",
        "......#",
        "......#",
        "......#",
        "......#",
        "......#",
        "#.....#",
        "#.....#",
        "#.-...#",
        ".#...#.",
        "..###..",
        ".......",

    ],
    'l': [
        ".......",
        ".......",
        ".......",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        ".......",

    ],
    'M': [
        ".......",
        ".......",
        "#.....#",
        "#.....#",
        "##...##",
        "##...##",
        "##...##",
        "#.#.#.#",
        "#.#.#.#",
        "#.#-#.#",
        "#.#.#.#",
        "#..#..#",
        "#..#..#",
        "#..#..#",
        "#.....#",
        ".......",

    ],
    'm': [
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        "#.#.+#.",
        "#..##.#",
        "#..#..#",
        "#..#..#",
        "#..#..#",
        "#..#..#",
        "#..#..#",
        "#..#..#",
        "#..#..#",
        ".......",

    ],
    'n': [
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        "#.###..",
        "##...#.",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        ".......",

    ],
    'N': [
        ".......",
        ".......",
        "#.....#",
        "#.....#",
        "##....#",
        "##....#",
        "#.#...#",
        "#.#...#",
        "#..#..#",
        "#..#..#",
        "#...#.#",
        "#...#.#",
        "#....##",
        "#....##",
        "#.....#",
        ".......",

    ],
    'O': [
        ".......",
        ".......",
        "..###..",
        ".#...#.",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        ".#...#.",
        "..###..",
        ".......",

    ],
    'o': [
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        "..###..",
        ".#...#.",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        ".#...#.",
        "..###..",
        ".......",

    ],
    'p': [
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        "#.###..",
        "##...#.",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        "##...#.",
        "#.###..",
        "#......",
        "#......",

    ],
    'r': [
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        "#.####.",
        ".#....#",
        ".#.....",
        ".#.....",
        ".#.....",
        ".#.....",
        ".#.....",
        ".#.....",
        ".#.....",
        ".......",

    ],
    'S': [
        ".......",
        ".......",
        "..###..",
        ".#...#.",
        "#.....#",
        "#.....#",
        "#......",
        ".#.....",
        "..###..",
        ".....#.",
        "......#",
        "#.....#",
        "#.....#",
        ".#...#.",
        "..###..",
        ".......",

    ],

    's': [
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        ".#####.",
        "#.....#",
        "#.....#",
        "#......",
        ".#####.",
        "......#",
        "#.....#",
        "#.....#",
        ".#####.",
        ".......",

    ],
    'T': [
        ".......",
        ".......",
        ".......",
        "#######",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        ".......",

    ],
    't': [
        ".......",
        ".......",
        ".......",
        "...#...",
        "...#...",
        "...#...",
        ".######",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        "....###",
        ".......",

    ],
    'u': [
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        ".#...##",
        "..###.#",
        ".......",

    ],
    'v': [
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        "#.....#",
        "#.....#",
        "#.....#",
        ".#...#.",
        ".#...#.",
        "..#.#..",
        "..#.#..",
        "...#...",
        "...#...",
        ".......",

    ],
    'W': [
        ".......",
        ".......",
        "#.....#",
        "#..#..#",
        "#..#..#",
        "#..#..#",
        "#..#..#",
        "#.#.#.#",
        "#.#.#.#",
        "#.#.#.#",
        "#.#.#.#",
        ".#...#.",
        ".#...#.",
        ".#...#.",
        ".#...#.",
        ".......",

    ],
    'y': [
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        "#.....#",
        "#.....#",
        "#.....#",
        ".#...#.",
        ".#...#.",
        "..#.#..",
        "..#.#..",
        "...#...",
        "...#...",
        "###....",

    ],
    '0': [
        ".......",
        ".......",
        "..###..",
        ".#...#.",
        "#.....#",
        "#....##",
        "#...#.#",
        "#..#..#",
        "#.#...#",
        "##....#",
        "#.....#",
        "#.....#",
        "#.....#",
        ".#...#.",
        "..###..",
        ".......",

    ],
    '1': [
        ".......",
        ".......",
        ".###...",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        "...#...",
        ".......",

    ],
    '2': [
        ".......",
        ".......",
        "..###..",
        ".#...#.",
        "#.....#",
        "#.....#",
        "#.....#",
        ".....#.",
        "....#..",
        "..##...",
        ".#.....",
        "#......",
        "#......",
        "#......",
        "#######",
        ".......",

    ],
    '3': [
        ".......",
        ".......",
        "..###..",
        ".#...#.",
        "#.....#",
        "#.....#",
        "......#",
        ".....#.",
        "..###..",
        ".....#.",
        "......#",
        "#.....#",
        "#.....#",
        ".#...#.",
        "..###..",
        ".......",

    ],
    '4': [
        ".......",
        ".......",
        ".....#.",
        "....##.",
        "....##.",
        "...#.#.",
        "...#.#.",
        "..#..#.",
        "..#..#.",
        ".#...#.",
        ".#...#.",
        "#....#.",
        "#######",
        ".....#.",
        ".....#.",
        ".......",

    ],
    '5': [
        ".......",
        ".......",
        "######.",
        "#......",
        "#......",
        "#......",
        "#.###..",
        "##...#.",
        "#.....#",
        "......#",
        "......#",
        "......#",
        "#.....#",
        ".#...#.",
        "..###..",
        ".......",

    ],
    '6': [
        ".......",
        ".......",
        "..###..",
        ".#...#.",
        "#.....#",
        "#.....#",
        "#......",
        "#.###..",
        "##...#.",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        ".#...#.",
        "..###..",
        ".......",

    ],
    '7': [
        ".......",
        ".......",
        "#######",
        "......#",
        ".....#.",
        ".....#.",
        "....#..",
        "....#..",
        "....#..",
        "...#...",
        "...#...",
        "...#...",
        "..#....",
        "..#....",
        "..#....",
        ".......",

    ],
    '8': [
        ".......",
        ".......",
        "..###..",
        ".#...#.",
        "#.....#",
        "#.....#",
        "#.....#",
        ".#...#.",
        "..###..",
        ".#...#.",
        "#.....#",
        "#.....#",
        "#.....#",
        ".#...#.",
        "..###..",
        ".......",

    ],
    '9': [
        ".......",
        ".......",
        "..###..",
        ".#...#.",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        "#.....#",
        ".#...##",
        "..###.#",
        "......#",
        "#.....#",
        ".#...#.",
        "..###..",
        ".......",

    ],
    ' ': [
        ".......",
        ".......",
        "....#..",
        ".......",
        ".#.....",
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",

    ],
    ',': [
        ".......",
        ".......",
        ".......",
        ".......",
        ".##....",
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        ".......",
        "##.....",
        "##.....",
        ".#.....",
        "#......",

    ]



}

function update(time, delta) {
    let xVelocity = player.body.velocity.x;
    let yVelocity = player.body.velocity.y;
    const touchingLeft = player.body.blocked.left;
    const touchingRight = player.body.blocked.right;
    const caughtRoof = player.body.blocked.up;
    const onWall = (touchingLeft || touchingRight) && !player.body.blocked.down
    if (touchingLeft){
        console.log("touching wall!");
    }
    // Logic for acceleration
    if (cursors.left.isDown && !cursors.right.isDown) {
        if (player.body.touching.down){
        player.setAccelerationX(-xVeloAccel)
        }
        else {
            player.setAccelerationX(-xAirAccel)
        }
    } else if (cursors.right.isDown && !cursors.left.isDown) {
        if (player.body.touching.down){
            player.setAccelerationX(xVeloAccel)
            }
            else {
                player.setAccelerationX(xAirAccel)
            }
    } else {
        player.setAccelerationX(0);
    }
    //Jumping logic and decay
    if (Phaser.Input.Keyboard.JustDown(cursors.up) && !isJumping) {
        if(player.body.blocked.down){
            isJumping = true;
            jumpTimer = 0;
            player.setVelocityY(jumpForce);
        }
        // Wall jump logic
        else if (onWall){
            isJumping = true;
            jumpTimer = 0;
            player.setVelocityY(jumpForce);
            player.setVelocityX(touchingLeft ? xWallJumpVelo : - xWallJumpVelo);
        }
    }
    // Continue jump
    else if (isJumping && cursors.up.isDown){
        console.log("ContinueJump!")
        jumpTimer += delta;
        if (jumpTimer < maxJumpTime){
            player.setVelocityY(player.body.velocity.y + jumpHoldForce);
        }
    }
     // Wall drag
    else if (!isJumping && onWall && yVelocity >= 0){
        player.setVelocityY(100);
    }
    // End of jump
    if (isJumping && (!cursors.up.isDown || jumpTimer >= maxJumpTime)) {
        isJumping = false;
    }
    // Update timer
    if (timerStarted) {
        const elapsed = (this.time.now - startTime) / 1000;
        timerText.setText(`Time: ${elapsed.toFixed(3)}`);
    }
   

    // Resize window
    window.addEventListener('resize', () => {
        game.scale.resize(window.innerWidth, window.innerHeight);
    });
    }
const game = new Phaser.Game(config);

