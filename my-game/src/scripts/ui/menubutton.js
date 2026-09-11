import { UITextButton, audio } from "melonjs";

/**
 * a UITextButton that plays the shared hover/select sound effects
 * automatically. subclasses implement onAction() instead of onClick().
 */
class MenuButton extends UITextButton {
  onOver(event) {
    audio.play("button_hover");
    return super.onOver(event);
  }

  onClick(event) {
    // only reached when isClickable is true -- UIBaseElement gates
    // this call for us, so a disabled button never fires a sound
    audio.play("button_select");
    this.onAction();
    return false;
  }

  /**
   * override in subclasses to perform the button's action
   */
  onAction() {
    // no-op by default
  }
}

export default MenuButton;
