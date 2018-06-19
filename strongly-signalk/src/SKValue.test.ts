import {SKValue} from './SKValue'

it('can load from json', () => {
  const v = SKValue.fromJSON(`{
    "path": "propulsion.0.revolutions",
    "value": 16.341667
  }`)
  expect(v).toHaveProperty('path', "propulsion.0.revolutions")
  expect(v).toHaveProperty('value', 16.341667)
})