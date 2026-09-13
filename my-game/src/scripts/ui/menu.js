import { UITextButton, audio, save } from "melonjs";

class menuButton extends UITextButton {
  onOver(event) {
    audio.play("button_hover", false, null, save.sfxVolume);
    return super.onOver(event);
  }

  onClick(event) {
    audio.play("button_select", false, null, save.sfxVolume);
    this.onAction();
    return false;
  }

  onAction() {}
}

export default menuButton;
