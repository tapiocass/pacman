var game = new Phaser.Game(550, 600, Phaser.AUTO, "game");

var mainPacman = function (game) {
    this.map = null;
    this.layer = null;

    this.fruto = 0;

    this.pontuacao = 0;
    this.pontuacaoText = null;
    this.recordText = null;

    this.pacman = null;

    this.safetile = 14;
    this.tamanhomaze = 16;
    this.limite= 3;
    this.timer = 0;

    this.game = game;
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

        this.cursors = this.input.keyboard.createCursorKeys();

    },

    movimentaPacman: function () {
        this.pacman.movimentaPacman(this.cursors);

    },

    update: function () {

        this.pontuacaoText.text = this.pontuacao;
        this.recordText.text = this.pontuacao;
        this.timer += game.time.elapsed;

        if ( this.timer >= 200 ) {
            this.timer -= 200;
        this.up.visible = !this.up.visible;}

        this.pacman.update();

        this.movimentaPacman();
    }
};

game.state.add('Game', mainPacman, true);
