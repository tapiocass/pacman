var game = new Phaser.Game(448, 496, Phaser.AUTO, "game");

var PacmanGame = function (game) {    
    this.map = null;
    this.layer = null;
    
    this.numDots = 0;
    this.TOTAL_DOTS = 0;
    this.score = 0;
    this.scoreText = null;
    
    this.pacman = null; 

    this.safetile = 14;
    this.gridsize = 16;       
    this.threshold = 3;

    this.SPECIAL_TILES = [
        { x: 12, y: 11 },
        { x: 15, y: 11 },
        { x: 12, y: 23 },
        { x: 15, y: 23 }
    ];
    
    this.TIME_MODES = [
        {
            mode: "scatter",
            time: 7000
        },
        {
            mode: "chase",
            time: 20000
        },
        {
            mode: "scatter",
            time: 7000
        },
        {
            mode: "chase",
            time: 20000
        },
        {
            mode: "scatter",
            time: 5000
        },
        {
            mode: "chase",
            time: 20000
        },
        {
            mode: "scatter",
            time: 5000
        },
        {
            mode: "chase",
            time: -1 // -1 = infinite
        }
    ];
    this.changeModeTimer = 0;
    this.remainingTime = 0;
    this.currentMode = 0;
    this.isPaused = false;
    this.FRIGHTENED_MODE_TIME = 7000;

    this.KEY_COOLING_DOWN_TIME = 250;
    this.lastKeyPressed = 0;
    
    this.game = game;
};

PacmanGame.prototype = {

    init: function () {
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;

        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas); // full retro mode, i guess ;)

        this.physics.startSystem(Phaser.Physics.ARCADE);
    },

    preload: function () {

        this.load.image('dot', 'assets/dot.png');
        this.load.image("pill", "assets/pill16.png");
        this.load.image('tiles', 'assets/pacman-tiles.png');
        this.load.spritesheet('pacman', 'assets/pacman.png', 32, 32);
        this.load.spritesheet("ghosts", "assets/ghosts32.png", 32, 32);
        this.load.tilemap('map', 'assets/pacman-map.json', null, Phaser.Tilemap.TILED_JSON);

        this.load.audio('song', ['assets/pacman_beginning.wav']);
        this.load.audio('munch', ['assets/pacman-munch.wav']);

    },

    create: function () {
        this.map = this.add.tilemap('map');
        this.map.addTilesetImage('pacman-tiles', 'tiles');

        this.layer = this.map.createLayer('Pacman');

        this.dots = this.add.physicsGroup();
        this.numDots = this.map.createFromTiles(7, this.safetile, 'dot', this.layer, this.dots);
        this.TOTAL_DOTS = this.numDots;
        
        this.pills = this.add.physicsGroup();
        this.numPills = this.map.createFromTiles(40, this.safetile, "pill", this.layer, this.pills);

        this.dots.setAll('x', 6, false, false, 1);
        this.dots.setAll('y', 6, false, false, 1);

        this.map.setCollisionByExclusion([this.safetile], true, this.layer);

        this.munchSong = this.add.audio('munch');
        this.pacman = new Pacman(this, "pacman");
        this.music=this.add.audio('song');
        this.music.play();

        this.scoreText = game.add.text(8, 272, "Score: " + this.score, { fontSize: "16px", fill: "#fff" });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.cursors["d"] = this.input.keyboard.addKey(Phaser.Keyboard.D);
        this.cursors["b"] = this.input.keyboard.addKey(Phaser.Keyboard.B);

        this.changeModeTimer = this.time.time + this.TIME_MODES[this.currentMode].time;

    },

    checkKeys: function () {
        this.pacman.checkKeys(this.cursors);

    },

    update: function () {
        this.scoreText.text = "Score: " + this.score;

        if (!this.pacman.isDead) {

            if (this.changeModeTimer !== -1 && !this.isPaused && this.changeModeTimer < this.time.time) {
                this.currentMode++;
                this.changeModeTimer = this.time.time + this.TIME_MODES[this.currentMode].time;
                if (this.TIME_MODES[this.currentMode].mode === "chase") {
                    this.sendAttackOrder();
                } else {
                    this.sendScatterOrder();
                }
                console.log("new mode:", this.TIME_MODES[this.currentMode].mode, this.TIME_MODES[this.currentMode].time);
            }
            if (this.isPaused && this.changeModeTimer < this.time.time) {
                this.changeModeTimer = this.time.time + this.remainingTime;
                this.isPaused = false;
                if (this.TIME_MODES[this.currentMode].mode === "chase") {
                    this.sendAttackOrder();
                } else {
                    this.sendScatterOrder();
                }
                console.log("new mode:", this.TIME_MODES[this.currentMode].mode, this.TIME_MODES[this.currentMode].time);
            }
        }
        
        this.pacman.update();
        
        this.checkKeys();

    },
    
    enterFrightenedMode: function() {

        if (!this.isPaused) {
            this.remainingTime = this.changeModeTimer - this.time.time;
        }
        this.changeModeTimer = this.time.time + this.FRIGHTENED_MODE_TIME;
        this.isPaused = true;
        console.log(this.remainingTime);
    },
    
    isSpecialTile: function(tile) {
        for (var q=0; q<this.SPECIAL_TILES.length; q++) {
            if (tile.x === this.SPECIAL_TILES[q].x && tile.y === this.SPECIAL_TILES[q].y) {
                return true;
            } 
        }
        return false;
    }

};

game.state.add('Game', PacmanGame, true);
