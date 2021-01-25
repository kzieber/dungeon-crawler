import Phaser from 'phaser'
import { debugDraw } from '../utils/debug'
import { createLizardAnims } from '../anims/EnemyAnims'
import { createCharacterAnims } from '../anims/CharacterAnims'
import Lizard from '../enemies/Lizard'

export default class Game extends Phaser.Scene {

    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
    private faune!: Phaser.Physics.Arcade.Sprite

	constructor()
	{
		super('game')
	}

	preload()
    {
        this.cursors = this.input.keyboard.createCursorKeys()
    }

    create()
    {
       createCharacterAnims(this.anims)
       createLizardAnims(this.anims)


       const map = this.make.tilemap({key: 'dungeon'})
       const tileset = map.addTilesetImage('dungeon', 'tiles')

       map.createLayer('Ground', tileset)
       const wallsLayer = map.createLayer('Walls', tileset)

       wallsLayer.setCollisionByProperty({ collides: true })

       //debugDraw(wallsLayer, this)

       this.faune = this.physics.add.sprite(128, 128, 'faune', 'sprites/walk-down/walk-down-3.png')

       this.faune.body.setSize(this.faune.width * 0.5, this.faune.height * 0.8)
       this.faune.anims.play('faune-idle-down')

       this.cameras.main.startFollow(this.faune, true)

       const lizards = this.physics.add.group({
           classType: Lizard,
           createCallback: (go) => {
             const lizGo = go as Lizard
             lizGo.body.onCollide = true
           }
       })

       lizards.get(256, 128, 'lizard')

       this.physics.add.collider(this.faune, wallsLayer)
       this.physics.add.collider(lizards, wallsLayer)
    }

    update(t: number, dt: number)
    {
        if(!this.cursors || !this.faune) return

        const speed = 100;

        if(this.cursors.left?.isDown)
        {
            this.faune.anims.play('faune-run-side', true)
            this.faune.setVelocity(-speed, 0)

            this.faune.scaleX = -1
            this.faune.body.offset.x = 24
        }
        else if (this.cursors.right?.isDown)
        {
            this.faune.anims.play('faune-run-side', true)
            this.faune.setVelocity(speed, 0)

            this.faune.scaleX = 1
            this.faune.body.offset.x = 8
        }
        else if (this.cursors.up?.isDown)
        {
            this.faune.anims.play('faune-run-up', true)
            this.faune.setVelocity(0, -speed)
        }
        else if (this.cursors.down?.isDown)
        {
            this.faune.anims.play('faune-run-down', true)
            this.faune.setVelocity(0, speed)
        }
        else
        {
            const parts = this.faune.anims.currentAnim.key.split('-')
            parts[1] = 'idle'
            this.faune.play(parts.join('-'))
            this.faune.setVelocity(0, 0)
        }
    }

}
