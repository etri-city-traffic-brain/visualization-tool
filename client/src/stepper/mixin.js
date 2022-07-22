export default {
  togglePlay (value) {
    const { player } = this
    const action = value === 'play' ? player.start : player.stop
    action.bind(this)()
  },
  stepForward () {
    if (this.currentStep < this.slideMax) {
      this.currentStep = this.currentStep + 1
    }
    this.stepChanged(this.currentStep)
    // if (this.currentStep > this.slideMax) {
    //   this.currentStep = 0
    //   this.togglePlay()
    //   console.log('xxx')
    // }
  },
  stepBackward () {
    if (this.currentStep > 0) {
      this.currentStep = this.currentStep - 1
    }

    this.stepChanged(this.currentStep)
  },
  onChange () {
    this.stepChanged(this.currentStep)
  },
  onInput (event) {
    this.currentStep = +event
  }
}
