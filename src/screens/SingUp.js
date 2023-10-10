import React, { Component } from 'react';

import { connect } from 'react-redux'
import { LoggedIn } from '../store/actions'
import { bindActionCreators } from 'redux'
// import { createUser } from '../store/actions/index'

import axios from 'axios'

import firebase from 'firebase'
import firebaseConfig from './firebaseConfig'

import { cpf } from 'cpf-cnpj-validator'

import logo from '../assets/images/logo-pacatuba.png'

import '../App.css'



const authBaseURL = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty'
const API_KEY_FIREBASE = 'AIzaSyARJhClRUouS0OCKm1YzdNna-ayyTRZjwU'


//Icones
function goHome() {
  window.location.href = "/"
}
// function goPayment() {
//   window.location.href = "/pagamento"
// }

class SignUp extends Component {

  auth = undefined;

  state = {
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    telefone: '',
    ddd: '',
    id: '',
    status: 'Crie sua conta',
    classErr: 'titleLogin',
    user: null,
    userId: '',
    cpf: '',
  }

  componentDidMount() {
    firebase.initializeApp(firebaseConfig);
    this.auth = firebase.auth()

    // Mudando o texto do status 
    setInterval(() => this.setState({ status: 'Crie sua conta', classErr: 'titleLogin' }), 20000);
  }

  createUser = () => {
    axios.post(`${authBaseURL}/signupNewUser?key=${API_KEY_FIREBASE}`, {
      email: this.state.email,
      password: this.state.password,
      returnSecureToken: true
    })
      .then(res => {
        const userId = res.data.localId
        this.setState({ userId: userId })
        this.props.LoggedIn(this.state)
      

        axios.patch(`/users/${this.state.userId}.json`, {
          name: this.state.name,
          telefone: this.state.telefone,
          ddd: this.state.ddd,
          cpf: this.state.cpf,
        })
        .then(res => {
          window.location.href = "/pagamento"
        })
          .catch(err => console.log(err))

      })
      .catch(err => {
        if (err !== '') {
          this.setState({ status: 'Este email já foi cadastrado', classErr: 'txtErro' })
        }
      })
  }

  render() {
    return (
      <div className="app-login">
        <header className="item-header-dashboard"></header>

        <div className="searchBox itemBoxInsert loginBox singupBox">
          <img className="logo-login" src={logo} alt="Logotipo" onClick={goHome} />
          <h1 className={this.state.classErr}>{this.state.status}</h1>
          <form>
            <input type="text" className="input-login" placeholder="Nome*"
              value={this.state.name} onChange={(event) => this.setState({ name: event.target.value })}
            />
            <input type="number" className="input-login" placeholder="CPF*"
              value={this.state.cpf} onChange={(event) => this.setState({ cpf: event.target.value })}
            />
            <br />
            <input type="email" className="input-login" placeholder="Email*"
              value={this.state.email} onChange={(event) => this.setState({ email: event.target.value })}
            />
            <input type="password" className="input-login" placeholder="Senha*"
              value={this.state.password} onChange={(event) => this.setState({ password: event.target.value })}
            />
            <br />
            <input type="password" className="input-login" placeholder="Confirmar Senha*"
              value={this.state.confirmPassword} onChange={(event) => this.setState({ confirmPassword: event.target.value })}
            />
            <br />
            <input type="number" className="input-login input-small" placeholder="DDD*" maxLength={3}
              value={this.state.ddd} onChange={(event) => this.setState({ ddd: event.target.value })}
            />
            <input type="tel" className="input-login input-medium" placeholder="Celular*"
              value={this.state.telefone} onChange={(event) => this.setState({ telefone: event.target.value })}
            />
            <br />
            <div className="politicPrivacy">
              <h3 id="politic-privacy"> Clicando em continuar você concorda todas as <a className="a-politic-privacy" href="https://eudesenvolvo.com/politica-privacidade">Politicas de privacidade.</a> </h3>
            </div>
            <div className="btnBox">
              <input type="button" className="btnLogin btnCadastro" value="Entrar" onClick={
                  (() => {
                    window.location.href = "/login"
                  }
                  )
                }/>
              <input type="button" onClick={
                (() => {
                  if (this.state.name === '') {
                    this.setState({ status: 'Digite seu nome', classErr: 'txtErro' })
                  }

                  // Validação de CPF
                  else if (this.state.cpf === '') {
                    this.setState({ status: 'Digite seu CPF', classErr: 'txtErro' })
                  } else if (cpf.isValid(this.state.cpf) === false) {
                    this.setState({ status: 'Digite um CPF válido', classErr: 'txtErro' })
                  }


                  // Validação de email
                  else if (this.state.email === '') {
                    this.setState({ status: 'Digite sua email', classErr: 'txtErro' })
                  } else if (this.state.email.includes('@') === false) {
                    this.setState({ status: 'Digite um email válido', classErr: 'txtErro' })
                  } else if (this.state.email.includes('.') === false) {
                    this.setState({ status: 'Digite um email válido', classErr: 'txtErro' })
                  } else if (this.state.email.length < 8) {
                    this.setState({ status: 'Digite um email válido', classErr: 'txtErro' })
                  }

                  // Validação de senha
                  else if (this.state.password === '') {
                    this.setState({ status: 'Digite seu senha', classErr: 'txtErro' })
                  } else if (this.state.password.length < 6) {
                    this.setState({ status: 'Digite uma senha segura, maior que 6 caracteres com números e letras', classErr: 'txtErro' })
                  } else if(this.state.confirmPassword !== this.state.password){
                    this.setState({ status: 'Confirmação de senha está diferente', classErr: 'txtErro' })
                  }

                  // Validação de DDD
                  else if (this.state.ddd === '') {
                    this.setState({ status: 'insira o DDD corretamente. Ex: 011', classErr: 'txtErro' })
                  } else if (this.state.ddd.length < 2) {
                    this.setState({ status: 'insira o DDD corretamente. Ex: 011', classErr: 'txtErro' })
                  } else if (this.state.ddd.includes('0') === false) {
                    this.setState({ status: 'insira o DDD corretamente. Ex: 011', classErr: 'txtErro' })
                  }

                  // Validação de Celular
                  else if (this.state.celular === '') {
                    this.setState({ status: 'Digite sua celular', classErr: 'txtErro' })
                  }

                  else {
                    this.createUser()
                  }
                }
                )
              } className="btnLogin" value="Cadastrar" />
              
            </div>
          </form>
        </div>

      </div>
    )
  }
}


const mapDispatchToProps = dispatch => {
  return bindActionCreators({ LoggedIn }, dispatch);
}



export default connect(null, mapDispatchToProps)(SignUp)