var Pacman = function(game, key) {
    this.game = game;
    this.key = key;

    this.forca = 160;
    this.isDead = false;
    this.isAnimatingDeath = false;
    this.keyPressTimer = 0;

    this.tamanhomaze = this.game.tamanhomaze;
    this.safetile = this.game.safetile;

    this.marker = new Phaser.Point();
    this.turnPoint = new Phaser.Point();
    this.limite = 6;

    this.direcao = [ null, null, null, null, null ];
    this.opposites = [ Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP ];

    this.current = Phaser.NONE;
    this.turning = Phaser.NONE;
    this.posicao = Phaser.NONE;

    this.keyPressTimer = 0;
    this.KEY_COOLING_DOWN_TIME = 750;

    this.sprite = this.game.add.sprite((14 * 16) + 3, (17 * 20) + 85, key, 0);
    this.sprite.anchor.setTo(0.5);
    this.sprite.animations.add('munch', [0, 1, 2, 1], 20, true);
    this.sprite.animations.add('preparar', [2], 20, true);

    this.sprite.animations.add("death", [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], 10, false);

    this.game.physics.arcade.enable(this.sprite);
    this.sprite.body.setSize(16, 16, 0, 0);

    this.sprite.play('preparar');

};

Pacman.prototype.move = function(direcao) {
    if (direcao === Phaser.NONE) {
        this.sprite.body.velocity.x = this.sprite.body.velocity.y = 0;
        return;
    }

    var forca = this.forca;

    if (direcao === Phaser.LEFT || direcao === Phaser.UP)
    {
        forca = -forca;
    }

    if (direcao === Phaser.LEFT || direcao === Phaser.RIGHT)
    {
        this.sprite.body.velocity.x = forca;
    }
    else
    {
        this.sprite.body.velocity.y = forca;
    }

    this.sprite.scale.x = 1;
    this.sprite.angle = 0;

    if (direcao === Phaser.LEFT)
    {
        this.sprite.scale.x = -1;
    }
    else if (direcao === Phaser.UP)
    {
        this.sprite.angle = 270;
    }
    else if (direcao === Phaser.DOWN)
    {
        this.sprite.angle = 90;
    }

    this.current = direcao;
};

Pacman.prototype.update = function() {

    if (!this.isDead ) {

        this.game.physics.arcade.collide(this.sprite, this.game.layer);
        this.game.physics.arcade.overlap(this.sprite, this.game.frutos, this.comeFruto, null, this);
        this.game.physics.arcade.overlap(this.sprite, this.game.pilulas, this.comePilula, null, this);
        this.game.physics.arcade.overlap(this.sprite, this.game.bonusgroup, this.comeEnergetico, null, this);

        this.marker.x = this.game.math.snapToFloor(Math.floor(this.sprite.x), this.tamanhomaze) / this.tamanhomaze;
        this.marker.y = this.game.math.snapToFloor(Math.floor(this.sprite.y), this.tamanhomaze) / this.tamanhomaze;

        if (this.marker.x < 0) {
            this.sprite.x = this.game.map.widthInPixels - 1;
        }

        if (this.marker.x >= this.game.map.width) {
            this.sprite.x = 1;
        }

        this.direcao[1] = this.game.map.getTileLeft(this.game.layer.index, this.marker.x, this.marker.y);

        this.direcao[2] = this.game.map.getTileRight(this.game.layer.index, this.marker.x, this.marker.y);

        this.direcao[3] = this.game.map.getTileAbove(this.game.layer.index, this.marker.x, this.marker.y);

        this.direcao[4] = this.game.map.getTileBelow(this.game.layer.index, this.marker.x, this.marker.y);

        if (this.turning !== Phaser.NONE && this.game.playgame )
        {
            this.sprite.play('munch');
            this.turn();
        }
    } else {
        this.move(Phaser.NONE);
        if (!this.isAnimatingDeath && this.sprite.x !==220 && this.sprite.y !== 420) {
            this.sprite.play("death");
            this.isAnimatingDeath = true;
        }

    }


};

Pacman.prototype.movimentaPacman = function(cursors) {
    if (cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown) {
        this.keyPressTimer = this.game.time.time + this.KEY_COOLING_DOWN_TIME;
    }

    if (cursors.left.isDown && this.current !== Phaser.LEFT)
    {
        this.posicao = Phaser.LEFT;
    }
    else if (cursors.right.isDown && this.current !== Phaser.RIGHT)
    {
        this.posicao = Phaser.RIGHT;
    }
    else if (cursors.up.isDown && this.current !== Phaser.UP)
    {
        this.posicao = Phaser.UP;
    }
    else if (cursors.down.isDown && this.current !== Phaser.DOWN)
    {
        this.posicao = Phaser.DOWN;
    }

    if (this.game.time.time > this.keyPressTimer || (this.sprite.y === 280 && this.sprite.x < 103 ) || (this.sprite.y === 280 && this.sprite.x > 402 ) )
    {

        this.turning = Phaser.NONE;
        this.posicao = Phaser.NONE;

    } else {

        this.verificaDirecao(this.posicao);
    }
};

Pacman.prototype.comeFruto = function(pacman, dot) {

    if (!this.game.munchSong.isPlaying) {
        this.game.munchSong.play('', 0, 1, false);

    }

    dot.kill();

    this.game.pontuacao +=10;
    this.game.fruto --;

    if (this.game.frutos.total === 0)
    {
        this.game.frutos.callAll('revive');
    }
};

Pacman.prototype.comeEnergetico = function(pacman, dot) {

   // if (!this.game.munchSong.isPlaying) {
   //     this.game.munchSong.play('', 0, 1, false);

   // }
if (this.game.habilitarFruta) {
    dot.kill();
    this.game.pontuacao += 100;
    this.numeroCereja --;

}
};



Pacman.prototype.comePilula = function(pacman, pill) {
    this.game.munchPillSong.play('', 0, 1, false);
    pill.kill();

    this.game.pontuacao += 50;
    this.game.numpilulas--;
    this.game.enterFrightenedMode();

};

Pacman.prototype.turn = function () {
    var cx = Math.floor(this.sprite.x);
    var cy = Math.floor(this.sprite.y);

    if (!this.game.math.fuzzyEqual(cx, this.turnPoint.x, this.limite) || !this.game.math.fuzzyEqual(cy, this.turnPoint.y, this.limite))
    {
        return false;
    }

    this.sprite.x = this.turnPoint.x;
    this.sprite.y = this.turnPoint.y;

    this.sprite.body.reset(this.turnPoint.x, this.turnPoint.y);
    this.move(this.turning);
    this.turning = Phaser.NONE;

    return true;
};

Pacman.prototype.verificaDirecao = function (turnTo) {

    if (this.turning === turnTo || this.direcao[turnTo] === null || this.direcao[turnTo].index !== this.safetile)
    {
        return;
    }


    if (this.current === this.opposites[turnTo])
    {
        this.move(turnTo);
        this.keyPressTimer = this.game.time.time;
    }
    else
    {
        this.turning = turnTo;

        this.turnPoint.x = (this.marker.x * this.tamanhomaze) + (this.tamanhomaze / 2);
        this.turnPoint.y = (this.marker.y * this.tamanhomaze) + (this.tamanhomaze / 2);
        this.posicao = Phaser.NONE;
    }



};

Pacman.prototype.getPosition = function () {
    return new Phaser.Point((this.marker.x * this.tamanhomaze) + (this.tamanhomaze / 2), (this.marker.y * this.tamanhomaze) + (this.tamanhomaze / 2));
};

Pacman.prototype.getCurrentDirection = function() {
     return this.current;
};
