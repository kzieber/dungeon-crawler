import Phaser from 'phaser'

declare global
{
  namespace Phaser.GameObjects{
    interface GameObjectFactory
    {
      faune(x: number, y: number, texture: string, frame?: string | number): Faune
    }
  }
}

export default class Faune extends Phaser.Physics.Arcade.Sprite
{
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number)
  {
    super(scene, x, y, texture, frame)

    this.anims.play('faune-idle-down')
    // this.faune.body.setSize(this.faune.width * 0.5, this.faune.height * 0.8)
  }
}

Phaser.GameObjects.GameObjectFactory.register('faune', function (this: Phaser.GameObjects.GameObjectFactory, x: number: y: number, texture: string, frame?: string | number ){
  let sprite = new Faune(this.scene, x, y, texture, frame);

  this.displayList.add(sprite);
  this.updateList.add(sprite);

  this.scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY);

  sprite.body.setSize(sprite.width * 0.5, sprite.height * 0.8)

  return sprite
})
