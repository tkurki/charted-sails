import { BucketQuery, File } from '@google-cloud/storage';
import { appStorage } from '../firebase-admin';
import { listAllLogFiles, listUserLogFiles } from "./logfiles";

jest.mock('../firebase-admin')

const aUserId = '424242'

interface MockFile {
  name: string
}

const mockStorage : MockFile[] = [
  { name: `user/${aUserId}/uploads/tukki-inreach-export.gpx`},
  { name: 'user/anotherUser/uploads/log1.gpx' },
  { name: 'user/anotherUser/uploads/log2.gpx' },
  { name: 'anotherfile/that/should/not/be/included' }
]

function makeMockFile(mockFile: MockFile): File {
  const f = mockFile as File
  f.getSignedUrl = () => Promise.resolve([`supersecure:///` + f.name] as [string])
  return f
}

beforeAll(() => {
  appStorage.getFiles = (query?: BucketQuery): Promise<[File[]]> => {
    const ret : [File[]] = [ mockStorage.map(f => makeMockFile(f)) ]
    return Promise.resolve(ret)
  }
})

it('can serve the list of all logfiles', (done) => {
  listAllLogFiles().then(files => {
    expect(files).not.toBeNull()
    files.slice(0, files.length-1).forEach((file, index) => {
      expect(file.name).toEqual(mockStorage[index].name.split('/').pop())
      if (index === 0) {
        expect(file.uploaderId).toEqual(aUserId)
      }
      else {
        expect(file.uploaderId).toEqual('anotherUser')
      }
    })
    done()
  })
})

it('can filter the list of log files per user', (done) => {
  listUserLogFiles(aUserId).then(files => {
    expect(files).toHaveLength(1)
    done()
  })
})
