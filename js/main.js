var game = new Phaser.Game(448, 600, Phaser.AUTO, "game");

var mainPacman = function (game) {
    this.map = null;
    this.layer = null;

    this.fruto = 0;
    this.totalfrutos = 0;

    this.pontuacao = 0;
    this.pontuacaoText = null;
    this.recordText = null;

    this.pacman = null;
    this.clyde = null;
    this.pinky = null;
    this.blinky = null;
    this.inky = null;
    this.isClydeOut = false;
    this.isInkyOut = false;
    this.safetile = 14;
    this.tamanhomaze = 16;
    this.limite= 3;
    this.timer = 0;

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
    this.ORIGINAL_OVERFLOW_ERROR_ON = true;

    this.KEY_COOLING_DOWN_TIME = 250;

    this.game = game;
    this.ghosts = [];
};

mainPacman.prototype = {

    init: function () {

        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;

        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);

        this.physics.startSystem(Phaser.Physics.ARCADE);
    },

    preload: function () {
        this.load.image('dot', 'assets/sprites/dot.png');
        this.load.image("pill", "assets/sprites/pill16.png");
        this.load.image('tiles', 'assets/sprites/pacman-tiles.png');
        this.load.spritesheet('pacman', 'assets/sprites/pacman.png', 32, 32);
        this.load.spritesheet("ghosts", "assets/sprites/ghosts32.png", 32, 32);

        this.load.tilemap('map', 'assets/json/pacman-map.json', null, Phaser.Tilemap.TILED_JSON);

        this.load.audio('song', ['assets/sounds/pacman_beginning.wav']);
        this.load.audio('munch', ['assets/sounds/pacman-munch.wav']);
        this.load.audio('munchPill', ['assets/sounds/pacman_eatfruit.wav']);
    },

    create: function () {
        this.map = this.add.tilemap('map');
        this.map.addTilesetImage('pacman-tiles', 'tiles');

        this.layer = this.map.createLayer('Pacman');

        //Textos
        this.up = game.add.text(30, 0, "1 UP", { fontSize: "18px", fill: "#fff"});
        this.pontuacaoText = game.add.text(35, 20, this.pontuacao, { fontSize: "18px", fill: "#fff"});
        this.recordLabel = game.add.text(170, 0, "HIGH SCORES", { fontSize: "18px", fill: "#fff"});
        this.recordText = game.add.text(220, 20, this.pontuacao, { fontSize: "18px", fill: "#fff"});

        this.frutos = this.add.physicsGroup();
        this.fruto = this.map.createFromTiles(7, 14, 'dot', this.layer, this.frutos);
        this.totalfrutos = this.fruto;

        this.pilulas = this.add.physicsGroup();

        this.numpilulas = this.map.createFromTiles(40, 14, "pill", this.layer, this.pilulas);

        this.frutos.setAll('x', 6, false, false, 1);
        this.frutos.setAll('y', 6, false, false, 1);

        this.map.setCollisionByExclusion([this.safetile], true, this.layer);

        this.munchPillSong = this.add.audio('munchPill');
        this.munchSong = this.add.audio('munch');
        this.pacman = new Pacman(this, "pacman");
        this.music = this.add.audio('song');
        this.music.play();

        this.changeModeTimer = this.time.time + this.TIME_MODES[this.currentMode].time;

        this.blinky = new Ghost(this, "ghosts", "blinky", {x:15, y:14}, Phaser.RIGHT);
        this.pinky = new Ghost(this, "ghosts", "pinky", {x:15, y:17}, Phaser.LEFT);
        this.clyde = new Ghost(this, "ghosts", "clyde", {x:15, y:17}, Phaser.LEFT);
        this.inky = new Ghost(this, "ghosts", "inky", {x:15, y:17}, Phaser.LEFT);

        this.ghosts.push(this.blinky,this.pinky,this.clyde, this.inky);

        this.sendExitOrder(this.pinky);

        this.cursors = this.input.keyboard.createCursorKeys();

    },

    dogEatsDog: function(pacman, ghost) {
        if (this.isPaused) {
            this[ghost.name].mode = this[ghost.name].RETURNING_HOME;
            this[ghost.name].ghostDestination = new Phaser.Point(14 * this.tamanhomaze, 14 * this.tamanhomaze);
            this[ghost.name].resetSafeTiles();
            this.pontuacao += 10;
        } else {
            this.killPacman();
        }
    },

    getCurrentMode: function() {
        if (!this.isPaused) {
            if (this.TIME_MODES[this.currentMode].mode === "scatter") {
                return "scatter";
            } else {
                return "chase";
            }
        } else {
            return "random";
        }
    },

    movimentaPacman: function () {
        this.pacman.movimentaPacman(this.cursors);

    },

    gimeMeExitOrder: function(ghost) {
        this.game.time.events.add(Math.random() * 3000, this.sendExitOrder, this, ghost);
    },

    killPacman: function() {
        this.pacman.isDead = true;
        this.stopGhosts();
    },

    stopGhosts: function() {
        for (var i=0; i<this.ghosts.length; i++) {
            this.ghosts[i].mode = this.ghosts[i].STOP;
        }
    },

    update: function () {

        this.pontuacaoText.text = this.pontuacao;
        this.recordText.text = this.pontuacao;
        this.timer += game.time.elapsed;

        if ( this.timer >= 200 ) {
            this.timer -= 200;
            this.up.visible = !this.up.visible;
        }

        if (!this.pacman.isDead) {
            for (var i=0; i<this.ghosts.length; i++) {
                if (this.ghosts[i].mode !== this.ghosts[i].RETURNING_HOME) {
                    this.physics.arcade.overlap(this.pacman.sprite, this.ghosts[i].ghost, this.dogEatsDog, null, this);
                }
            }

            if (this.totalfrutos - this.fruto > 30 && !this.isInkyOut) {
                this.isInkyOut = true;
                this.sendExitOrder(this.inky);
            }


            if (this.fruto < this.totalfrutos && !this.isClydeOut) {
                this.isClydeOut = true;
                this.sendExitOrder(this.clyde);
            }

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

        this.movimentaPacman();
        this.updateGhosts();
    },

    enterFrightenedMode: function() {
        for (var i=0; i<this.ghosts.length; i++) {
            this.ghosts[i].enterFrightenedMode();
        }
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
    },

    updateGhosts: function() {
        for (var i=0; i<this.ghosts.length; i++) {
            this.ghosts[i].update();
        }
    },


    sendAttackOrder: function() {
        for (var i=0; i<this.ghosts.length; i++) {
            this.ghosts[i].attack();
        }
    },

    sendExitOrder: function(ghost) {
        ghost.mode = this.clyde.EXIT_HOME;
    },

    sendScatterOrder: function() {
        for (var i=0; i<this.ghosts.length; i++) {
            this.ghosts[i].scatter();
        }
    }
};

game.state.add('Game', mainPacman, true);
