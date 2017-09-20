var game = new Phaser.Game(450, 500, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
	this.load.tilemap('maze', 'assets/json/maze.json', null, Phaser.Tilemap.TILED_JSON);
	this.load.image('tiles', 'assets/sprites/tiles.png');
	this.load.spritesheet('pacman', 'assets/sprites/pacman.png', 32, 32);
}

function create() {
	this.map = this.add.tilemap('maze');
	this.map.addTilesetImage('tiles', 'tiles');
	this.layer = this.map.createLayer('Pacman');

    this.pacman = this.add.sprite((14 * 16) + 8, (17 * 16) + 8, 'pacman');
    this.pacman.anchor.set(0.5);

	game.physics.startSystem(Phaser.Physics.P2JS);

    game.physics.p2.defaultRestitution = 0.8;

	game.physics.p2.enable(this.pacman);

	this.pacman.body.setZeroDamping();
	this.pacman.fixedRotation = true;

    cursors = game.input.keyboard.createCursorKeys();
}

function update() {

	this.pacman.body.setZeroVelocity();

	if (cursors.left.isDown){
    	this.pacman.body.moveLeft(400);
    }
    
    else if (cursors.right.isDown){
    	this.pacman.body.moveRight(400);
    }

    if (cursors.up.isDown){
    	this.pacman.body.moveUp(400);
    }

    else if (cursors.down.isDown){
    	this.pacman.body.moveDown(400);
    }
}