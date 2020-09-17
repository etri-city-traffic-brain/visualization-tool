const mixin = {
  data() {
    return {
      selected: [],
    }
  },
  methods: {
    drag(event) {
      event.dataTransfer.setData('text', event.target.dataset.id);
    },
    dragover(event) {
      event.preventDefault();
    },
    drop(event) {
      event.preventDefault();
      const simulationId = event.dataTransfer.getData('text');
      // const target = event.target.dataset.id;
      // this[target] = simulationId;

      const exists = this.selected.some(v => v === simulationId);
      if (exists) {
        return;
      }
      this.selected.push(simulationId);
    },
    deleteSelected(id) {
      const idx = this.selected.findIndex(v => v === id);
      this.$delete(this.selected, idx);
    },

    compare() {
      this.$router.push({
        name: 'SimulationComparisonResult',
        params: [...this.selected],
      });
    },

  },
};

export default mixin;
