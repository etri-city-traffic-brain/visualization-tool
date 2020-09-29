import { Car, Bus } from '.'
class VehicleFactory {
  static of(type, option) {
    if(type === 0) {
      return new Car(option)
    } else {
      return new Bus(option)
    }
  }
}

export default VehicleFactory
