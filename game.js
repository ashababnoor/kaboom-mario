kaboom({
    global: true,
    fullscreen: true,
    scale: 2,
    debug: true,
    clearColor: [0, 0, 0, 1]
});

loadRoot('images/');
loadSprite('coin', 'wbKxhcd.png');
loadSprite('evil-shroom', 'KPO3fR9.png');
loadSprite('brick', 'pogC9x5.png');
loadSprite('block', 'M6rwarW.png');
loadSprite('mario', 'Wb1qfhK.png');
loadSprite('mushroom', '0wMd92p.png');
loadSprite('surprise', 'gesQ1KP.png');
loadSprite('unboxed', 'bdrLpi6.png');
loadSprite('pipe-top-left', 'ReTPiWY.png');
loadSprite('pipe-top-right', 'hj2GK4n.png');
loadSprite('pipe-bottom-left', 'c1cYSbt.png');
loadSprite('pipe-bottom-right', 'nqQ79eI.png');


scene('game', ({ score, level }) => {
    layers(['bg', 'obj', 'ui'], 'obj');

    const map = [
        '                                    ',
        '                                    ',
        '                                    ',
        '                                    ',
        '                                    ',
        '                                    ',
        '                                    ',
        '        ==%=%%==                    ',
        '                                    ',
        '                                    ',
        '     =*%=    =*=%===                ',
        '                                    ',
        '                          -+        ',
        '                  ^   ^   ()        ',
        '============================  ======'
    ];

    const levelCfg = {
        width: 20,
        height: 20,
        '=': [sprite('block'), solid()],
        '$': [sprite('coin'), 'coin'],
        '%': [sprite('surprise'), solid(), 'coin-surprise'],
        '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
        '}': [sprite('unboxed'), solid()],
        '(': [sprite('pipe-bottom-left'), solid(), scale(0.5)],
        ')': [sprite('pipe-bottom-right'), solid(), scale(0.5)],
        '-': [sprite('pipe-top-left'), solid(), 'pipe', scale(0.5)],
        '+': [sprite('pipe-top-right'), solid(), 'pipe', scale(0.5)],
        '^': [sprite('evil-shroom'), solid(), 'dangerous'],
        '#': [sprite('mushroom'), solid(), 'mushroom', body()]
    };

    const gameLevel = addLevel(map, levelCfg);

    const scoreLabel = add([
        text('score: ' + score, 14),
        pos(30, 6),
        layer('ui'),
        {
            value: score,
        }
    ]);

    add([text('level: ' + parseInt(level + 1), 14), pos(width() / 2, 6)]);

    function big() {
        let timer = 0;
        let isBig = false;
        return {
            update() {
                if (isBig) {
                    timer -= dt();
                    if (timer <= 0) {
                        this.smallify();
                    }
                }
            },
            isBig() {
                return isBig;
            },
            smallify() {
                CURRENT_JUMP_FORCE = JUMP_FORCE;
                this.scale = vec2(1);
                timer = 0;
                isBig = false;
            },
            biggify(time) {
                CURRENT_JUMP_FORCE = BIG_JUMP_FORCE;
                this.scale = vec2(1.5);
                timer = time;
                isBig = true;
            }
        }
    }

    const player = add([
        sprite('mario'), solid(),
        pos(30, 0),
        body(),
        big(),
        origin('bot')
    ]);

    const MOVE_SPEED = 100;
    const JUMP_FORCE = 350;
    const BIG_JUMP_FORCE = 500;
    let CURRENT_JUMP_FORCE = JUMP_FORCE;
    const ENEMY_SPEED = 20;
    let IS_JUMPING = true;
    const FALL_DEATH = 400;

    action('mushroom', (m) => {
        m.move(20, 0);
    })

    player.on('headbump', (obj) => {
        if (obj.is('coin-surprise')) {
            gameLevel.spawn('$', obj.gridPos.sub(0, 1));
            destroy(obj);
            gameLevel.spawn('}', obj.gridPos.sub(0, 0));
        }
        if (obj.is('mushroom-surprise')) {
            gameLevel.spawn('#', obj.gridPos.sub(0, 1));
            destroy(obj);
            gameLevel.spawn('}', obj.gridPos.sub(0, 0));
        }
    })

    player.collides('mushroom', (m) => {
        destroy(m);
        player.biggify(10);
    });

    player.collides('coin', (c) => {
        destroy(c);
        scoreLabel.value++;
        scoreLabel.text = 'Score: ' + scoreLabel.value;
    });

    action('dangerous', (d) => {
        d.move(-ENEMY_SPEED, 0);
    })

    player.collides('dangerous', (d) => {
        if (IS_JUMPING) {
            destroy(d);
        } else {
            go('lose', { score: scoreLabel.value });
        }
    });

    player.action(() => {
        camPos(player.pos);
        if (player.pos.y >= FALL_DEATH) {
            go('lose', { score: scoreLabel.value });
        }
    })

    player.collides('pipe', () => {
        keyPress('down', () => {
            go('game', {
                level: (level + 1),
                score: scoreLabel.value,
            })
        })
    })

    keyDown('left', () => {
        player.move(-MOVE_SPEED, 0);
    });

    keyDown('right', () => {
        player.move(MOVE_SPEED, 0);
    });

    player.action(() => {
        if (player.grounded()) {
            IS_JUMPING = false;
        }
    });

    keyPress('space', () => {
        if (player.grounded()) {
            IS_JUMPING = true;
            player.jump(CURRENT_JUMP_FORCE);
        }
    })
});

scene('lose', ({ score }) => {
    add([text('Final Score: ' + score, 28), origin('center'), pos(width() / 2, height() / 2)]);
    add([text('Press R to play again', 18), origin('center'), pos(width() / 2, height() / 2 + 38)]);

    keyPress('r', () => {
        location.reload();
    });
});

start('game', { score: 0, level: 0 });