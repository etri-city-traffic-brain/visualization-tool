import makeVehicles from '../vehicles/calc-vehicles';
import VehicleFactory from '../vehicles/model/factory'

function drawVehicles({context, map, edges: cells = [], roads}) {
  const roadMap = roads.reduce((acc, cur) => {
    // acc[cur.roadId] = cur
    acc[cur.roadId.substring(0, 14)] = cur
    console.log('update', cur.roadId.substring(0, 14))
    return acc
  }, {})

  // const tempCarsByLink = {}

  cells
    .filter(cell => cell.properties.SPEEDLH >= 30)
    .forEach(cell => {
      const p1 = map.coordinateToContainerPoint(cell.getLastCoordinate());
      const p2 = map.coordinateToContainerPoint(cell.getFirstCoordinate());

      const roadId = cell.properties.LINK_ID
      const road = roadMap[roadId]

      // isAdjecent link의 속성을 보고서 해야 됨
      // cell builder 에서 넣어주셈
      // cell 로는 X
      if(road) {
        // const linkId = roadId.slice(0, roadId.indexOf('_'))
        // const saveVehicels = road.vehicles.slice(0,2)
        const targetVehicles = road.vehicles.slice()

        // const array = new Array(Math.floor(Math.random() * 6)).fill(1)
        const vehicles = makeVehicles(p1, p2, targetVehicles, VehicleFactory)
        let drawCars = vehicles.slice()
        if(road.isAdjecent) {
          drawCars = vehicles.slice(4)
        }

        for(let i=0; i<drawCars.length; i++) {
          const car = drawCars[i]
          car.draw(context)
        }
      }
    })
}

export default drawVehicles
