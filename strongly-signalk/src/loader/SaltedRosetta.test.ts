import { Response as NodeFetchResponse } from "node-fetch";
import { GPXLoader } from "./GPXLoader";
import { SaltedRosetta } from "./SaltedRosetta";
import { VCCLoader } from "./VCCLoader";

jest.mock('./VCCLoader')
jest.mock('./SKLogLoader')
jest.mock('./GPXLoader')
jest.mock('./CSVLoader')

describe('Opening from a Response object', () => {
  it('recognizes content-disposition headers', (done) => {
    const content = 'some content'
    const r:Response = new NodeFetchResponse(content) as unknown as Response
    r.headers.set('content-disposition', `attachment; filename="Oh My Captain.vcc"; filename*=UTF-8''Oh%20My%20Captain.vcc`)

    SaltedRosetta.fromResponse(r).then(() => {
      expect(VCCLoader.fromString).toHaveBeenCalledWith(content)
      done()
    })
  })

  it('if we have filename in URL use it to guess format', (done) => {
    const content = 'some content'
    const responseOpts = { url: 'http://myserver.com/mysuperlogfile.gpx', status: 200 }
    const r = new NodeFetchResponse(content, responseOpts)

    SaltedRosetta.fromResponse(r as unknown as Response).then(() => {
      expect(GPXLoader.fromString).toHaveBeenCalledWith(content)
      done()
    })
  })

  it('if we have filename in URL + content-disposition, content-disposition should win', (done) => {
    const content = 'some content'
    const responseOpts = { url: 'http://myserver.com/mysuperlogfile.gpx', status: 200 }
    const r = new NodeFetchResponse(content, responseOpts)
    r.headers.set('content-disposition', `attachment; filename="Oh My Captain.vcc"; filename*=UTF-8''Oh%20My%20Captain.vcc`)

    VCCLoader.fromString = jest.fn()
    SaltedRosetta.fromResponse(r as unknown as Response).then(() => {
      expect(VCCLoader.fromString).toHaveBeenCalledWith(content)
      done()
    })
  })
})