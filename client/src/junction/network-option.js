/**
 * this function return vis.js network options
 * @param {function} addEdge
 */
function getOptions(addEdge) {
  return {
    physics: true,
    interaction: {
      dragNodes: true, // do not allow dragging nodes
      zoomView: true, // do not allow zooming
      hover: true,
      dragView: true, // do not allow dragging
    },
    manipulation: {
      enabled: true,
      addEdge,
    }, // manuplation
    edges: {
      smooth: {
        type: 'straightCross', // 'diagonalCross',//'straightCross',
        forceDirection: 'none',
        roundness: 0.33,
      },
      color: {
        inherit: false,
      },
      // selectionWidth: function (width) {return width*2;},
      width: 5.5,
      // value:0.0
    },
    nodes: {
      fixed: false,
    },
  };
}

export default getOptions;
