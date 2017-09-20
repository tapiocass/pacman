var game = new Phaser.Game(450, 500, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
	this.load.tilemap('map', 'assets/json/maze.json', null, Phaser.Tilemap.TILED_JSON);
	this.load.image('tiles', 'assets/sprites/tiles.png');
}

function create() {
	this.map = this.add.tilemap('map');
	this.map.addTilesetImage('tiles', 'tiles');
	this.layer = this.map.createLayer('Pacman');
    this.map.setCollision(20, true, this.layer);

}

function update() {
}