import {
  Scene
} from 'phaser'

export default class TestScene extends Scene {
  constructor() {
    super('testscene-techPark')
  }

  createPlayerWalkingAnimation(assetKey, animationName) {
    this.anims.create({
      key: `${assetKey}_${animationName}`,
      frames: [
        { key: assetKey, frame: `${assetKey}_${animationName}_01` },
        { key: assetKey, frame: `${assetKey}_${animationName.replace('walking', 'idle')}_01` },
        { key: assetKey, frame: `${assetKey}_${animationName}_02` },
      ],
      frameRate: 4,
      repeat: -1,
      yoyo: true,
    });
  }

  getStopFrame(direction, spriteKey) {
    switch (direction) {
      case 'up':
        return `${spriteKey}_idle_up_01`;
      case 'right':
        return `${spriteKey}_idle_right_01`;
      case 'down':
        return `${spriteKey}_idle_down_01`;
      case 'left':
        return `${spriteKey}_idle_left_01`;
      default:
        return null;
    }
  }

  create() {
    const map = this.make.tilemap({ key: 'testmap-techPark' });
    map.addTilesetImage('buildings', 'buildings', 12, 12, 0, 0)
    map.addTilesetImage('buildings2', 'buildings2', 12, 12, 0, 0)
    map.addTilesetImage('road', 'road', 12, 12, 0, 0)
    map.addTilesetImage('village', 'village', 12, 12, 0, 0)
    map.addTilesetImage('auditorium', 'auditorium', 12, 12, 0, 0)
    map.addTilesetImage('apartments', 'apartments', 12, 12, 0, 0)
    map.addTilesetImage('itcenter', 'itcenter', 12, 12, 0, 0)
    map.addTilesetImage('hotel', 'hotel', 12, 12, 0, 0)
    map.addTilesetImage('station', 'station', 12, 12, 0, 0)


    map.layers.forEach((layer, index) => {
      map.createLayer(index, ['buildings', 'buildings2', 'road', 'village', 'station', 'auditorium', 'itcenter', 'hotel'], 0, 0)
    })

    this.heroSprite = this.physics.add.sprite(0, 0, 'hero').setDepth(1);

    this.cameras.main.startFollow(this.heroSprite, true);
    this.cameras.main.setFollowOffset(-this.heroSprite.width, -this.heroSprite.height)

    const gridEngineConfig = {
      characters: [{
        id: 'hero',
        sprite: this.heroSprite,
        startPosition: {
          x: 38,
          y: 12
        },
        speed: 8
      }]
    }
    this.gridEngine.create(map, gridEngineConfig)

    this.itemsSprites = this.add.group();

    // Movement
    this.createPlayerWalkingAnimation('hero', 'walking_up');
    this.createPlayerWalkingAnimation('hero', 'walking_right');
    this.createPlayerWalkingAnimation('hero', 'walking_down');
    this.createPlayerWalkingAnimation('hero', 'walking_left');

    this.gridEngine.movementStarted().subscribe(({ charId, direction }) => {
      if (charId === 'hero') {
        this.heroSprite.anims.play(`hero_walking_${direction}`);
      }
    });

    this.gridEngine.movementStopped().subscribe(({ charId, direction }) => {
      if (charId === 'hero') {
        this.heroSprite.anims.stop();
        this.heroSprite.setFrame(this.getStopFrame(direction, charId));
      }
    });

    this.gridEngine.directionChanged().subscribe(({ charId, direction }) => {
      if (charId === 'hero') {
        this.heroSprite.setFrame(this.getStopFrame(direction, charId));
      }
    });


    let triggered = false;

    const dataLayer = map.getObjectLayer("prompt");
    dataLayer.objects.forEach((object) => {
      let tmp = this.add.rectangle((object.x + (object.width / 2)), (object.y + (object.height / 2)), object.width, object.height);
      tmp.properties = object.properties?.reduce(
        (obj, item) => Object.assign(obj, { [item.name]: item.value }), {}
      );
      this.physics.world.enable(tmp, 1);
      this.physics.add.collider(this.heroSprite, tmp, (objA, objB) => {
        if (!triggered) {
          const customEvent = new CustomEvent('prompt', {
            detail: {
              areaName: objB?.properties?.area,
            },
          });
          if (objB?.properties?.area) {
            window.dispatchEvent(customEvent);
          }
          
          triggered = true;
          this.time.delayedCall(3000, () => {
            triggered = false
          });
        }
      }, null, this);
    });
  }

  preload() {
    const fontSize = 16;
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        const { width: gameWidth, height: gameHeight } = this.cameras.main;

        const barPositionX = Math.ceil((gameWidth - (gameWidth * 0.7)) / 2);
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(
            barPositionX,
            Math.ceil(gameHeight / 6),
            Math.ceil(gameWidth * 0.7),
            Math.ceil(gameHeight / 10)
        );

        const loadingText = this.add.text(
            gameWidth / 2,
            Math.ceil(gameHeight / 10),
            'loading...',
            {
                fontFamily: '"Press Start 2P"',
                fontSize: `${fontSize}px`,
                size: `${fontSize}px`,
                fill: '#ffffff',
                color: '#ffffff',
            }
        );

        loadingText.setOrigin(0.5);
        loadingText.setResolution(30);

        const percentText = this.add.text(
            gameWidth / 2,
            Math.ceil((gameHeight / 6) + (fontSize / 2) + (gameHeight / 60)),
            '0%',
            {
                fontFamily: '"Press Start 2P"',
                fontSize: `${fontSize}px`,
                size: `${fontSize}px`,
                fill: '#ffffff',
                color: '#ffffff',
            }
        );

        percentText.setOrigin(0.5);
        percentText.setResolution(30);
        
        const assetText = this.add.text(
            gameWidth / 2,
            Math.ceil(gameHeight / 3),
            '',
            {
                fontFamily: '"Press Start 2P"',
                fontSize: `${fontSize / 2}px`,
                size: `${fontSize / 2}px`,
                fill: '#ffffff',
                color: '#ffffff',
            }
        );

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xFFFFFF, 1);
            progressBar.fillRect(
                barPositionX,
                Math.ceil(gameHeight / 6),
                Math.ceil(gameWidth * 0.7) * value,
                Math.ceil(gameHeight / 10)
            );
            percentText.setText(`${Number.parseInt(value * 100, 10)}%`);
        });

        this.load.on('fileprogress', (file) => {
            assetText.setText(`loading: ${file.key}`);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            percentText.destroy();
            assetText.destroy();
        });
        
    //map assets
    this.load.image('buildings', "assets/round-two/techPark/buildings.png");
    this.load.image('road', "assets/round-two/techPark/road.png");
    // this.load.image('apartments', "assets/round-two/techPark/apartments.png");
    this.load.image('hotel', "assets/round-two/techPark/hotel.png");
    this.load.image('buildings2', "assets/round-two/techPark/buildings2.png");
    this.load.image('village', "assets/round-two/techPark/villagetileset.png");
    this.load.image('auditorium', "assets/round-two/techPark/auditorium.png");
    this.load.image('itcenter', "assets/round-two/techPark/itcenter.png");
    this.load.image('station', "assets/round-two/techPark/train.png");

    this.load.tilemapTiledJSON('testmap-techPark', 'assets/round-two/techPark/techPark.json')

    //loading charachter
    this.load.atlas('hero', "assets/sprites/atlas/hero.png", "assets/sprites/atlas/hero.json");
  }

  update() {
    let keyA
    let keyS
    let keyD
    let keyW
    keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
    keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
    keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
    const cursors = this.input.keyboard.createCursorKeys()

    if (cursors.left.isDown || keyA.isDown) {
      this.gridEngine.move('hero', 'left')
    } else if (cursors.right.isDown || keyD.isDown) {
      this.gridEngine.move('hero', 'right')
    } else if (cursors.up.isDown || keyW.isDown) {
      this.gridEngine.move('hero', 'up')
    } else if (cursors.down.isDown || keyS.isDown) {
      this.gridEngine.move('hero', 'down')
    }
  }
}