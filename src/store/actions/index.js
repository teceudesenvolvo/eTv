import {CLICK_UPDATE, VISIT_REGISTER, USER_LOGGED_IN, USER_LOGGED_OUT, OPEN_AULA} from './actionsTypes'
import axios from 'axios'

const authBaseURL = 'https://www.googleapis.com/identitytookit/v3/realyingparty'
const API_KEY = 'AIzaSyARJhClRUouS0OCKm1YzdNna-ayyTRZjwU'

export const clickButton = course => ({
  type: CLICK_UPDATE,
  payload: course,
})

export const openAula = aula => ({
  type: OPEN_AULA,
  payload: aula,
})

export const visitRegister = (event) => ({
  type: VISIT_REGISTER,
  payload: event.target.value
})

export const LoggedIn = user => ({
  type: USER_LOGGED_IN,
  payload: user
})

export const LoggedOut = () => ({
  type: USER_LOGGED_OUT
})


export const createUser = user => {
  return dispatch => {
    axios.post(`${authBaseURL}/signupNewUser?key${API_KEY}`, {
      email: user.email,
      password: user.password,
      returnSecureToken: true
    })
    .catch(err => console.log(err))
    .then(res => {
      if(res.data.localId){
        axios.put(`/users/${res.data.localId}.json`,{
          name: user.name,
          telefone: user.telefone
        })
        .catch(err => console.log(err))
        .then(res => {
          console.log('Bem vindo ao eudesenvolvo.com')
        })
      }
    })
  }
}
