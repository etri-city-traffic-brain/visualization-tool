export default {
  togglePlay(value) {
    const { player } = this;
    const action = (value === 'play') ? player.start : player.stop;
    action.bind(this)();
  },
  stepForward() {
    if (this.currentStep < this.slideMax) {
      this.currentStep = this.currentStep + 1;
    }
    this.stepChanged(this.currentStep);
  },
  stepBackward() {
    if (this.currentStep > 0) {
      this.currentStep = this.currentStep - 1;
    }
    this.stepChanged(this.currentStep);
  },
  onChange() {
    this.stepChanged(this.currentStep);
  },
  onInput(event) {
    this.currentStep = +event;
  },
};
