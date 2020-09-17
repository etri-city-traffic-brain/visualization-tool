import calcVehiclesLoc from './calc-vehicles';

const width = 16;
const height = 5;

const { log } = console;

function drawVehicles({context, map, edges = [], roads}) {
  const roadMap = roads.reduce((acc, cur) => {
    acc[cur.roadId] = cur
    return acc
  }, {})


  edges
    .filter(edge => edge.properties.SPEEDLH >= 30)
    .forEach(edge => {
      const p1 = map.coordinateToContainerPoint(edge.getLastCoordinate());
      const p2 = map.coordinateToContainerPoint(edge.getFirstCoordinate());

      if(roadMap[edge.properties.LINK_ID]) {
        // const array = new Array(Math.floor(Math.random() * 6)).fill(1)
        const cars = calcVehiclesLoc(p1, p2, roadMap[edge.properties.LINK_ID].vehicles)
        for(let i=0; i<cars.length; i++) {
          const car = cars[i]
          context.fillStyle = 'rgb(200, 0, 0)';
          context.beginPath();
          context.arc(p1.x, p1.y, 5, 0, 2 * Math.PI);
          context.arc(p2.x, p2.y, 10, 0, 2 * Math.PI);
          context.stroke();

          context.save()
          context.translate(car.start.x + width / 2, car.start.y + height / 2 );
          context.rotate(car.angle);
          context.fillRect(0 , 0, width, height);
          context.restore()
        }
      }
    })
}

export default drawVehicles


// draw by line
// ctx.save()
// ctx.beginPath();
// ctx.moveTo(car.start.x, car.start.y);
// ctx.lineTo(car.end.x, car.end.y);
// ctx.lineWidth = 6
// ctx.strokeStyle = '#' + Math.floor(Math.random()*16777215).toString(16);
// ctx.strokeStyle = car.color
// ctx.stroke();
// ctx.restore()
