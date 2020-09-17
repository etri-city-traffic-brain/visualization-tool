
import * as maptalks from '../map/node_modules/maptalks';

export default (center, name, id) => {
  let points;
  if (id === 2) {
    points = [center[0] + 0.0099, center[1] - 0.013];
  } else {
    points = [center[0] + 0.0196, center[1] - 0.013];
  }
  return new maptalks.Marker(
    points,
    {
      properties: {
        name,
      },
      symbol: {
        textFaceName: 'sans-serif',
        textName: '{name}', // value from name in geometry's properties
        textWeight: 'normal', // 'bold', 'bolder'
        textStyle: 'normal', // 'italic', 'oblique'
        textSize: 40,
        textFont: null,
        textFill: '#34495e',
        textOpacity: 1,
        textHaloFill: '#fff',
        textHaloRadius: 5,
        textWrapWidth: null,
        textWrapCharacter: '\n',
        textLineSpacing: 0,
        textDx: 0,
        textDy: 0,
        textHorizontalAlignment: 'middle', // left | middle | right | auto
        textVerticalAlignment: 'middle', // top | middle | bottom | auto
        textAlign: 'center', // left | right | center | auto
      },
    },
  );
};
