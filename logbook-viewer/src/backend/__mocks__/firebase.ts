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

const sendPasswordResetEmail = jest.fn(() => Promise.resolve())

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

export const facebookProvider = jest.fn(() => { return })
