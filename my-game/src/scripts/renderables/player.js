import { Sprite, Body, Rect, collision, input } from "melonjs";

const FRAME_SIZE = 64;
const COLS_PER_ROW = 18;
const ROW = { down: 0, left: 1, right: 2, up: 3 };

const FEET_Y = 11;
const BODY_CENTER_X = -1;

function idleFrames(row, count) {
  const start = row * COLS_PER_ROW;
  return Array.from({ length: count }, (_, i) => start + i);
}

function walkFrames(row, count) {
  const start = row * COLS_PER_ROW + 12;
  return Array.from({ length: count }, (_, i) => start + i);
}

const MOVE_SPEED = 1.5;
const FRICTION = 0.3;

class PlayerEntity extends Sprite {
  #facing = "down";
  #moving = false;

  constructor(x, y, hitBoxSize) {
    super(x, y, {
      image: "player_placeholder",
      framewidth: FRAME_SIZE,
      frameheight: FRAME_SIZE,
    });

    this.addAnimation("idle-down", idleFrames(ROW.down, 12));
    this.addAnimation("idle-left", idleFrames(ROW.left, 12));
    this.addAnimation("idle-right", idleFrames(ROW.right, 12));
    this.addAnimation("idle-up", idleFrames(ROW.up, 4));
    this.addAnimation("walk-down", walkFrames(ROW.down, 6));
    this.addAnimation("walk-left", walkFrames(ROW.left, 6));
    this.addAnimation("walk-right", walkFrames(ROW.right, 6));
    this.addAnimation("walk-up", walkFrames(ROW.up, 6));
    this.setCurrentAnimation("idle-down");

    const footWidth = hitBoxSize ? hitBoxSize.width : 14;
    const footHeight = hitBoxSize ? hitBoxSize.height : 12;
    this.body = new Body(
      this,
      new Rect(
        BODY_CENTER_X - footWidth / 2,
        FEET_Y - footHeight,
        footWidth,
        footHeight,
      ),
    );
    this.body.collisionType = collision.types.PLAYER_OBJECT;
    this.body.setMaxVelocity(MOVE_SPEED, MOVE_SPEED);
    this.body.setFriction(FRICTION, FRICTION);
    this.body.ignoreGravity = true;
  }

  update(dt) {
    const up = input.keyStatus("moveUp");
    const down = input.keyStatus("moveDown");
    const left = input.keyStatus("moveLeft");
    const right = input.keyStatus("moveRight");

    this.body.force.x = right ? MOVE_SPEED : left ? -MOVE_SPEED : 0;
    this.body.force.y = down ? MOVE_SPEED : up ? -MOVE_SPEED : 0;

    this.#moving = this.body.force.x !== 0 || this.body.force.y !== 0;
    if (this.#moving) {
      if (up) {
        this.#facing = "up";
      } else if (down) {
        this.#facing = "down";
      } else if (left) {
        this.#facing = "left";
      } else if (right) {
        this.#facing = "right";
      }
    }

    this.setCurrentAnimation(
      `${this.#moving ? "walk" : "idle"}-${this.#facing}`,
    );

    return super.update(dt);
  }

  onCollision() {
    return true;
  }
}

export default PlayerEntity;
