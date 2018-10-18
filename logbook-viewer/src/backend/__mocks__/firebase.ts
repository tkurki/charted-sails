const onAuthStateChanged = jest.fn()

const getRedirectResult = jest.fn(() => {
  return Promise.resolve({
    user: {
      displayName: 'redirectResultTestDisplayName',
      email: 'redirectTest@test.com',
      emailVerified: true
    }
  })
})

const sendEmailVerification = jest.fn(() => {
  return Promise.resolve('result of sendEmailVerification')
})

const sendPasswordResetEmail = jest.fn(() => Promise.resolve())

const createUserWithEmailAndPassword = jest.fn(() => {
  return Promise.resolve('result of createUserWithEmailAndPassword')
})

const signInWithEmailAndPassword = jest.fn(() => {
  return Promise.resolve('result of signInWithEmailAndPassword')
})

const signInWithRedirect = jest.fn(() => {
  return Promise.resolve('result of signInWithRedirect')
})

export const auth = ({
  onAuthStateChanged,
  currentUser: {
    displayName: 'testDisplayName',
    email: 'test@test.com',
    emailVerified: true
  },
  getRedirectResult,
  sendPasswordResetEmail
})

export const facebookProvider = jest.fn(() => {})
