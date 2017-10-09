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
    
    //var music;

    this.SPECIAL_TILES = [
        { x: 12, y: 11 },
        { x: 15, y: 11 },
        { x: 12, y: 23 },
        { x: 15, y: 23 }
    ];

    this.game = game;
};

PacmanGame.prototype = {

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

    },

    checkKeys: function () {
        this.pacman.checkKeys(this.cursors);

    },

    update: function () {
        this.scoreText.text = "Score: " + this.score;

        this.pacman.update();
        
        this.checkKeys();
    },

    isSpecialTile: function(tile) {
        for (var i =0; i<this.SPECIAL_TILES.length; i++) {
            if (tile.x === this.SPECIAL_TILES[i].x && tile.y === this.SPECIAL_TILES[i].y) {
                return true;
            } 
        }
        return false;
    }
};

game.state.add('Game', PacmanGame, true);
