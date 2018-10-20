import { appStorage } from '../firebase-admin';

const filenameRe = /user\/([a-zA-Z0-9]+)\/uploads\/(.*)/
const LOG_DOWNLOAD_LINK_VALIDITY = 10*60*1000

export interface LogFile {
  id: string
  uploaderId: string
  name: string
  url: string
}

export function listAllLogFiles() {
  return appStorage.getFiles({ prefix: 'user/' })
  .then( ([files]) => {
    return Promise.all(files.map(async file => {
      const results = filenameRe.exec(file.name)
      if (results && results.length === 3) {
        return {
          id: file.name,
          uploaderId: results[1],
          name: results[2],
          url: (await file.getSignedUrl({ action: 'read', expires: Date.now() + LOG_DOWNLOAD_LINK_VALIDITY}))[0]
        }
      }
      else {
        return null
      }
    }))
  })
  .then(logFiles => {
    return logFiles.filter(x => x !== null)
  })
}

export function listUserLogFiles(userId: string) {
  return listAllLogFiles().then(files => {
    return files.filter(f => f.uploaderId === userId)
  })
}