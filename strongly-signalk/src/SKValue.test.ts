import { SKValue } from "./SKValue";

describe("A dumb test", () => {
  it('does something', ()=> {
    const v = new SKValue()
    expect(v.path).toBeUndefined()
  })
})