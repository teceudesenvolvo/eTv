import React, { Component } from 'react';

import { connect } from 'react-redux'
import { LoggedIn } from '../store/actions'
import { bindActionCreators } from 'redux'

import axios from 'axios'

import logo from '../assets/images/logo-pacatuba.png'

import '../App.css'
import { PAGARME_API_KEY, PAGARME_BASE_URL } from '../config'

// Firebase
import firebase from 'firebase'
import firebaseConfig from './firebaseConfig'




const API_KEY = PAGARME_API_KEY
const BaseURL = PAGARME_BASE_URL
// const EK_KEY = process.env.REACT_APP_PAGARME_ENCRYPTION_KEY || ''
// const IDPLAN = process.env.REACT_APP_PAGARME_PLAN_ID || '1212867'



//Icones
function goHome() {
  window.location.href = "/"
}

function hasFirebaseLoginConfig(config) {
  return Boolean(config.apiKey && config.authDomain && config.projectId)
}

class Login extends Component {
  providerGoogle = null;
  user = undefined;

  state = {
    email: '',
    password: '',
    name: '',
    id: '',
    telefone: '',
    userId: this.props.userId,
    status: 'Entrar',
    classErr: 'titleLogin',
    idPay: null,
  }

  componentDidMount() {
    if (!hasFirebaseLoginConfig(firebaseConfig)) {
      this.setState({
        status: 'Entrar na conta',
        classErr: 'txtErro'
      })
      return
    }

    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig)
      }
    } catch (err) {
      this.setState({
        status: 'Não foi possível iniciar o Firebase. Verifique a API key.',
        classErr: 'txtErro'
      })
      return
    }

    // this.providerGoogle = new firebase.auth.GoogleAuthProvider();
    if (this.state.userId) {
      window.location.href = "/"
    }
    try {
      firebase.auth().onAuthStateChanged((signedUser) => {
        if (signedUser) {
          this.setState({
            user: signedUser,
            userId: signedUser.uid,
          });
        }
        else {
          this.setState({
            user: undefined
          });
        }
      }, (err) => {
        this.setState({
          status: err.code === 'auth/invalid-api-key'
            ? 'API key do Firebase inválida. Verifique o arquivo .env local.'
            : 'Não foi possível conectar ao Firebase Auth.',
          classErr: 'txtErro'
        })
      })
    } catch (err) {
      this.setState({
        status: err.code === 'auth/invalid-api-key'
          ? 'API key do Firebase inválida. Verifique o arquivo .env local.'
          : 'Não foi possível conectar ao Firebase Auth.',
        classErr: 'txtErro'
      })
    }

  }

  handleLoginWithGoogle = () => {
    // dados do usuário
    this.providerGoogle.addScope('profile');
    this.providerGoogle.addScope('email');
    this.providerGoogle.addScope('phone');

    // referencia de classe
    var ref = this;

    // chamar  popup auth
    firebase.auth().signInWithPopup(this.providerGoogle)
      .then(function (result) {
        ref.setState({ user: result.user, name: result.user.displayName, email: result.user.email, })
        localStorage.setItem(ref.state.name, ref.state.email)
        ref.props.LoggedIn(ref.state)

        // salvando dados do usuário
        axios.put(`/users/${result.user.uid}.json`, {
          nome: result.user.displayName,
        }, console.log(result.user.uid))
          .catch(err => console.log(err));
      })

      // window.location.href = "/inicio"


      .catch((err) => {
        // var erroCode = err.code;
        // var erroMessage = err.message;
      })
  }

  authenticate() {
    if (!hasFirebaseLoginConfig(firebaseConfig)) {
      this.setState({
        status: 'Configuração do Firebase ausente. Verifique o arquivo .env local.',
        classErr: 'txtErro'
      })
      return
    }

    var ref = this;
    firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
      .then((userOn) => {
        console.log(userOn.user.uid)
        ref.setState({ userId: userOn.user.uid })
        axios.get(`/users/${this.state.userId}.json`)
          .then(res => {
            console.log(res.data)
            if(res.data.idPay){
              this.setState({
                idPay: res.data.idPay
              })
            }else{
              this.setState({
                name: res.data.nome,
                ddd: res.data.ddd,
                telefone: res.data.telefone,
              })
            }
            

            ref.props.LoggedIn(ref.state)
            if (this.state.userId) {
            
              // Retornando Assinatura - Pagamento
              const paymentData = {
                api_key: `${API_KEY}`
              }
              const options = {
                headers: {
                  'Content-Type': 'application/json'
                }
              }
              if(this.state.idPay){
                axios.get(`${BaseURL}/${res.data.idPay}`, { params: paymentData }, options)
                  .then(res => {
                    if (res.data.current_transaction.status === 'paid') {
                      if(this.props.id){
                        window.location.href = "/item"
                      }else{
                        window.location.href = "/"
                      }
                    }
                    else{
                      window.location.href = "/alterarpagamento"
                    }
                  })
                  .catch(err => {window.location.href = "/alterarpagamento"})
              }else if(this.state.idPay === null){
                window.location.href = "/pagamento"
              }


                // Caso der erro no email ou senha
            } else {
              this.setState({ status: 'Email e/ou Senha invalidos', classErr: 'txtErro' })
            }
          })
          .catch(err => console.log(err))
      })
      .catch(function (err) {
        // var erroCode = err.code;
        var erroMessage = err.message;
        if (erroMessage) {
          ref.setState({ status: `Usuário e/ou Senha invalidos`, classErr: 'txtErro' })
        }
      })
  };

  handleLoginWithFacebook = () => {
    var provider = new firebase.auth.FacebookAuthProvider()

    // dados do usuário
    provider.addScope('user_birthday')
    provider.addScope('name')
    provider.addScope('email')

    // firebase.auth().languageCode = 'pt'

    firebase
      .auth()
      .signInWithPopup(provider)
      .then((result) => {
        var credential = result.credential
        var user = result.user
        var acessToken = credential.acessToken
        this.setState({
          email: user.email,
          name: user.name,
          id: acessToken,
        })
      })
      .catch((error) => {
        var errorCode = error.code
        var errorMessage = error.message
        // var email = error.email
        // var credentialError = error.credential
        this.setState({ status: errorMessage, classErr: 'txtErro' })
        console.log(errorCode, ' / ', errorMessage, ' / ')
      })

  }


  render() {
    return (
      <div className="modern-login-page">
        <section className="modern-login-shell">
          <div className="modern-login-copy">
            <span className="section-kicker">Área de acesso</span>
            <h1>Entrar na TV Câmara</h1>
            <p>Acesse sua conta para continuar acompanhando os conteúdos da Câmara Municipal de Pacatuba.</p>
          </div>

          <div className="modern-login-card">
            <button type="button" className="modern-login-brand" onClick={goHome}>
              <img className="logo-login" src={logo} alt="Câmara Municipal de Pacatuba" />
            </button>
            <h2 className={this.state.classErr}>{this.state.status}</h2>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (this.state.email === '') {
                  this.setState({ status: 'Digite seu email', classErr: 'txtErro' })
                } else if (this.state.password === '') {
                  this.setState({ status: 'Digite sua senha', classErr: 'txtErro' })
                } else {
                  this.authenticate()
                }
              }}
            >
              <label>
                Email
                <input
                  type="email"
                  className="input-login"
                  placeholder="seuemail@exemplo.com"
                  value={this.state.email}
                  onChange={(event) => this.setState({ email: event.target.value })}
                />
              </label>
              <label>
                Senha
                <input
                  type="password"
                  className="input-login"
                  placeholder="Digite sua senha"
                  value={this.state.password}
                  onChange={(event) => this.setState({ password: event.target.value })}
                />
              </label>
              <button type="submit" className="btnLogin">Entrar</button>
              <a className="btnLoginTxt forgotPass" href="/esqueci-a-senha">Esqueceu a senha?</a>
            </form>
          </div>
        </section>
      </div>
    )
  }
}

const mapStateToProps = store => {
  return {
    nome: store.user.name,
    email: store.user.email,
    userId: store.user.userId,
    id: store.course.id
  }
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ LoggedIn }, dispatch);
}
 

export default connect(mapStateToProps, mapDispatchToProps)(Login)
// export default Gestao
