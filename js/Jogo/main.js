   var game = new Phaser.Game(448, 600, Phaser.AUTO, "game");

var mainPacman = function (game) {
    this.map = null;
    this.layer = null;

    this.fruto = 0;
    this.totalfrutos = 0;

    this.pontuacao = 0;
    this.pontuacaoText = null;
    this.recordText = null;
    this.pauseText = null;
    this.musicgame = null;

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
    this.playgame = false;
    this.pontuacaomaxima = null;
    this.numerovidas = 1;
    this.numeroCereja = 1;
    this.vida1 = null;
    this.vida2 = null;


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
            time: 6666 // -1 = infinite
        }
    ];

    this.changeModeTimer = 0;
    this.remainingTime = 0;
    this.currentMode = 0;
    this.isPaused = 0;
    this.FRIGHTENED_MODE_TIME = 7000;
    this.ORIGINAL_OVERFLOW_ERROR_ON = true;

    this.KEY_COOLING_DOWN_TIME = 250;

    this.game = game;
    this.ghosts = [];
    this.vidas  = [];
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
        this.load.image('bonus', 'assets/sprites/PM_Cherry.png');
        this.load.spritesheet('pacman', 'assets/sprites/pacman.png', 32, 32);
        this.load.spritesheet('bonussheet', 'assets/sprites/PM_Cherry.png', 32, 32);
        this.load.spritesheet("ghosts", "assets/sprites/ghosts32.png", 32, 32);

        this.load.tilemap('map', 'assets/json/pacman-map.json', null, Phaser.Tilemap.TILED_JSON);

        this.load.audio('song', ['assets/sounds/pacman_beginning.wav']);
        this.load.audio('siren', ['assets/sounds/pacman_siren.mp3']);
        this.load.audio('munch', ['assets/sounds/pacman-munch.wav']);
        this.load.audio('munchPill', ['assets/sounds/pacman_eatfruit.wav']);
        this.load.audio('death', ['assets/sounds/pacman_death.wav']);
        this.load.audio('comendoFantasma', ['assets/sounds/pacman_modo_comedor.mp3']);
        this.load.audio('fantasmacomido', ['assets/sounds/pacman_eatghost.wav']);
        this.load.audio('ghostreturn', ['assets/sounds/pacman_ghost_return.mp3']);


        this.load.bitmapFont('carrier_command', 'assets/fonts/carrier_command.png', 'assets/fonts/carrier_command.xml');

    },

    create: function () {
        this.map = this.add.tilemap('map');
        this.map.addTilesetImage('pacman-tiles', 'tiles');

        this.layer = this.map.createLayer('Pacman');

        //Textos
        this.up = game.add.text(30, 0, "1 UP", { fontSize: "18px", fill: "#fff"});
        this.pontuacaoText = game.add.text(35, 20, this.pontuacao, { fontSize: "18px", fill: "#fff"});
        this.recordLabel = game.add.text(170, 0, "HIGH SCORES", { fontSize: "18px", fill: "#fff"});
        this.pauseText = game.add.text(125, 250, "PAUSE", { fontSize: "60px", fill: "#fff"});
        this.recordText = game.add.text(220, 20, this.pontuacao, { fontSize: "18px", fill: "#fff"});
        this.playerone =  game.add.text(145, 220, "PLAYER ONE", { font:"bold 26px Courier",  fill: "#2dddff"});
        this.ready =  game.add.text(190, 320, "READY!", { font:"bold  26px Courier",  fill: "#faff11"});

        if(localStorage.getItem("highscore") != null){
            this.pontuacaomaxima = localStorage.getItem("highscore");
        }
        else{
            this.pontuacaomaxima = localStorage.setItem("highscore",0);
        }

        this.frutos = this.add.physicsGroup();
        this.fruto = this.map.createFromTiles(7, 14, 'dot', this.layer, this.frutos);
        this.totalfrutos = this.fruto;

        this.pilulas = this.add.physicsGroup();
        this.numpilulas = this.map.createFromTiles(40, 14, "pill", this.layer, this.pilulas);

        this.bonusgroup = this.add.physicsGroup();
        this.bonus = this.map.createFromTiles(41, 14, 'bonus', this.layer, this.bonusgroup);
        this.bonusgroup.visible = false;
        this.habilitarFruta = false;





        this.frutos.setAll('x', 6, false, false, 1);
        this.frutos.setAll('y', 6, false, false, 1);

        this.map.setCollisionByExclusion([this.safetile], true, this.layer);

        this.munchPillSong = this.add.audio('munchPill');
        this.munchSong = this.add.audio('munch');
        this.deathSong = this.add.audio('death');
        this.comendoFantasmaSong = this.add.audio('comendoFantasma');
        this.comendoFantasmaSong.override = true;
        this.fantasmacomido =  this.add.audio('fantasmacomido');
        this.ghostreturn =  this.add.audio('ghostreturn');


        this.pacman = new Pacman(this, "pacman");
        this.vida1 = game.add.sprite((14), (17 * 20) + 210, "pacman", 1);
        this.vida2 = game.add.sprite((50), (17 * 20) + 210, "pacman", 1);
        this.cerejaFruta = game.add.sprite((100)+250, (17 * 20) + 210, "bonussheet", 0);


        this.vidas.push(this.vida1,this.vida2);


        this.pacman.sprite.visible = false;

        this.music = this.add.audio('song');
        this.music.play();

        this.musicgame = this.add.audio('siren');

        this.changeModeTimer = this.time.time + this.TIME_MODES[this.currentMode].time;
        this.cursors = this.input.keyboard.createCursorKeys();

        this.pauseKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.pauseKey.onDown.add(this.pauseFunction, this);
        this.pauseText.visible = false;
        this.game.time.events.add(Phaser.Timer.SECOND * 8, this.mostrarFruta, this);

    },

    mostrarFruta: function(){
        if (this.numeroCereja > 0 ) {

            this.cerejaFruta.visible = false;
            this.bonusgroup.visible = true;
            this.habilitarFruta = true;
        }

   },


    dogEatsDog: function(pacman, ghost) {
        if (this.isPaused) {
            this.fantasmacomido.play('', 0, 1, false);
            this.ghostreturn.play('',0,1,false);

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

        if (this.numerovidas < 0  ){
           window.location = "./gameover.html"
        }

    },

    stopGhosts: function() {
        for (var i=0; i<this.ghosts.length; i++) {
            this.ghosts[i].mode = this.ghosts[i].STOP;
        }
        this.musicgame.stop();
        this.deathSong.play('', 0, 1, false);


        if (this.numerovidas >=0  ) {
            this.game.time.events.add(Phaser.Timer.SECOND * 4, this.posicionarNoInicio, this);
            this.game.time.events.add(Phaser.Timer.SECOND * 6, this.acordarPacman, this);
            this.game.time.events.add(Phaser.Timer.SECOND * 6, this.deslReady, this);
        } else {

        }
    },

    libertaFantasmas: function(){


        this.ghosts[0].mode = "scatter";
        this.sendExitOrder(this.pinky);

        this.isClydeOut = false;
        this.isInkyOut = false;
        this.playgame = true;


        this.pacman.isAnimatingDeath = false;
        this.musicgame.play('', 0, 1, true);

    },


    posicionarNoInicio: function () {
        this.isClydeOut = true;
        this.isInkyOut = true;
        this.playgame = false;
        this.currentMode = 1;
        this.changeModeTimer = 0;
        this.ghosts[0].ghost.x = 220;
        this.ghosts[0].ghost.y = 230;
        this.ghosts[0].ghost.play(Phaser.RIGHT);



        this.ghosts[1].ghost.x = 195;
        this.ghosts[2].ghost.x = 220;
        this.ghosts[3].ghost.x = 250;



        for (var i = 1;i<4;i++)
        {
           this.ghosts[i].ghost.y = 280;
            this.ghosts[i].isAttacking = false;
           this.ghosts[i].move(Phaser.LEFT);
           this.ghosts[i].mode = this.ghosts[i].AT_HOME;


            this.ghosts[i].resetSafeTiles();
           this.ghosts[i].ghostDestination = new Phaser.Point(14 * this.tamanhomaze, 14 * this.tamanhomaze);
        }



        this.vidas[this.numerovidas].visible = false;
        this.numerovidas--;



        this.pacman.sprite.x = 220;
        this.pacman.sprite.y = 420;
        this.pacman.sprite.play('preparar');
        this.ready.visible = true;

        this.game.time.events.add(Phaser.Timer.SECOND*2, this.libertaFantasmas, this);

    },


    mostrarPersonagens: function() {

        this.blinky = new Ghost(this, "ghosts", "blinky", {x:13, y:14}, Phaser.RIGHT);
        this.pinky = new Ghost(this, "ghosts", "pinky", {x:14, y:17}, Phaser.LEFT);
        this.clyde = new Ghost(this, "ghosts", "clyde", {x:12, y:17}, Phaser.LEFT);
        this.inky = new Ghost(this, "ghosts", "inky", {x:16, y:17}, Phaser.LEFT);
        this.pacman.sprite.visible = true;
        this.ghosts.push(this.blinky,this.pinky,this.clyde, this.inky);

    },

    acordarPacman: function () {
        this.pacman.isDead = false;
    },

    jogar: function() {
        this.blinky.mode = "scatter";
        this.playgame = true;
        this.sendExitOrder(this.pinky);
        this.musicgame.play('', 0, 0.4, true);
    },

    deslPlayerOne: function () {
        this.playerone.visible = false;
    },

    deslReady: function () {
        this.ready.visible = false;
    },

    pauseFunction:function(){
        this.pauseText.visible = !this.pauseText.visible;
        this.game.paused = !this.game.paused;
    },

    update: function () {


        this.pontuacaoText.text = this.pontuacao;

        //Verifica a maior pontuação
        if (this.pontuacao > localStorage.getItem("highscore"))
        {
            localStorage.setItem("highscore", this.pontuacao);
        }

        this.pontuacaomaxima = localStorage.getItem("highscore");

        this.recordText.text = this.pontuacaomaxima;

        this.timer += game.time.elapsed;
        if (!this.inicio) {
            this.inicio = true;
            this.game.time.events.add(Phaser.Timer.SECOND * 2, this.deslPlayerOne, this);
            this.game.time.events.add(Phaser.Timer.SECOND * 2, this.mostrarPersonagens, this);
            this.game.time.events.add(Phaser.Timer.SECOND * 4, this.deslReady, this);
            this.game.time.events.add(Phaser.Timer.SECOND * 4, this.jogar, this);

        }
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

            if (this.totalfrutos - this.fruto > 30 && !this.isInkyOut && this.playgame   ) {
                this.isInkyOut = true;
                this.sendExitOrder(this.inky);
            }


            if (this.fruto < this.totalfrutos && !this.isClydeOut && this.clyde != null && this.playgame ) {
                this.isClydeOut = true;
                this.sendExitOrder(this.clyde);
            }

            if (this.changeModeTimer !== -1 && !this.isPaused && this.changeModeTimer < this.time.time && !this.pacman.isDead ) {
                this.currentMode++;
                this.changeModeTimer = this.time.time + this.TIME_MODES[this.currentMode].time;
                if (this.TIME_MODES[this.currentMode].mode === "chase") {
                    this.sendAttackOrder();
                } else {
                    this.sendScatterOrder();
                }
                console.log("new mode:", this.TIME_MODES[this.currentMode].mode, this.TIME_MODES[this.currentMode].time,this.currentMode);
            }

            if (this.currentMode == 6) {

                this.currentMode = 0;

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

    iniciarmusicgame: function() {
        this.musicgame.play('',0,0.7,true);
    },

    enterFrightenedMode: function() {
        this.musicgame.stop();
        this.comendoFantasmaSong.play('', 0, 0.5, false);

        this.game.time.events.add(Phaser.Timer.SECOND * 6, this.iniciarmusicgame , this);




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
        if (ghost !== null ) {
                ghost.mode = ghost.EXIT_HOME;
            }

    },

    sendScatterOrder: function() {
        for (var i=0; i<this.ghosts.length; i++) {
            this.ghosts[i].scatter();
        }
    }
};

game.state.add('Game', mainPacman, true);
