import Phaser from 'phaser'
import { debugDraw } from '../utils/debug'
import { createLizardAnims } from '../anims/EnemyAnims'
import { createCharacterAnims } from '../anims/CharacterAnims'
import { createChestAnims } from '../anims/TreasureAnims'
import Lizard from '../enemies/Lizard'
import '../characters/Faune'
import Faune from '../characters/Faune'
import Chest from '../items/Chests'
import { sceneEvents } from '../events/EventCenter'

export default class Game extends Phaser.Scene {

    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
    private faune!: Faune
    private knives!: Phaser.Physics.Arcade.Group
    private lizards!: Phaser.Physics.Arcade.Group

    private playerLizardsCollider?: Phaser.Physics.Arcade.Collider

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
        this.scene.run('game-ui')

        createCharacterAnims(this.anims)
        createLizardAnims(this.anims)
        createChestAnims(this.anims)


        const map = this.make.tilemap({key: 'dungeon'})
        const tileset = map.addTilesetImage('dungeon', 'tiles', 16, 16)

        map.createLayer('Ground', tileset)

        this.knives = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image
        })

        this.faune = this.add.faune(128, 128, 'faune')
        this.faune.setKnives(this.knives)

        const wallsLayer = map.createLayer('Walls', tileset)

        wallsLayer.setCollisionByProperty({ collides: true })

        const chests = this.physics.add.staticGroup({
            classType: Chest
        })
        const chestsLayer = map.getObjectLayer('Chests')
        chestsLayer.objects.forEach(chestObj => {
            chests.get(chestObj.x! + chestObj.width! * 0.5, chestObj.y! - chestObj.height! * 0.5, 'treasure', 'chest_empty_open_anim_f0.png')
        })

        //debugDraw(wallsLayer, this)
        this.cameras.main.startFollow(this.faune, true)

        this.lizards = this.physics.add.group({
            classType: Lizard,
            createCallback: (go) => {
                const lizGo = go as Lizard
                lizGo.body.onCollide = true
            }
        })

        const lizardsLayer = map.getObjectLayer('Enemies')
        lizardsLayer.objects.forEach(lizard => {
            this.lizards.get(lizard.x! + lizard.width! * 0.5, lizard.y! - lizard.height! * 0.5, 'lizard')
        })

        //walls layer collider
        this.physics.add.collider(this.faune, wallsLayer)
        this.physics.add.collider(this.lizards, wallsLayer)

        //faune and chests collider
        this.physics.add.collider(this.faune, chests, this.handlePlayerChestCollision, undefined, this)

        //knives and walls collider
        this.physics.add.collider(this.knives, wallsLayer, this.handleKnifeWallCollision, undefined, this)

        //knives and lizards collider
        this.physics.add.collider(this.knives, this.lizards, this.handleKnifeLizardCollision, undefined, this)

        //faune and lizards collider
        this.playerLizardsCollider = this.physics.add.collider(this.lizards, this.faune, this.handlePlayerLizardCollision, this.processKnifeLizardCollision, this)
    }

    private handlePlayerChestCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject){
        const chest = obj2 as Chest
        this.faune.setChest(chest)
    }

    private handleKnifeWallCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject)
    {
        //Object 1 is the knife, Obj2 is the wall
        this.knives.killAndHide(obj1)
    }

    private handleKnifeLizardCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject)
    {
        this.lizards.killAndHide(obj2) 
        this.knives.killAndHide(obj1)
    }

    private processKnifeLizardCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject){
        const lizard = obj2 as Lizard
        return lizard.active
    }

    private handlePlayerLizardCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject)
    {
        const lizard = obj2 as Lizard

        const dx = this.faune.x - lizard.x
        const dy = this.faune.y - lizard.y

        const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200)

        this.faune.handleDamage(dir)

        sceneEvents.emit('player-health-changed', this.faune.health)

        if(this.faune.health <= 0) {
            this.playerLizardsCollider?.destroy()
        }
    }

    update(t: number, dt: number)
    {
        if (this.faune)
        {
            this.faune.update(this.cursors)
        }
    }
}
