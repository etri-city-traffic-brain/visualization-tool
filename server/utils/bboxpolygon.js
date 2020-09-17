
/**
 * @param {Float32Array[]} extent
 */
const bboxpolygon = (extent) => {
  const min = { x: extent[0], y: extent[1] };
  const max = { x: extent[2], y: extent[3] };

  return [
    [min.x, min.y],
    [max.x, min.y],
    [max.x, max.y],
    [min.x, max.y],
    [min.x, min.y],
  ];
};

module.exports = bboxpolygon;
