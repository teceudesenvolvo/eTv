import React, { Component } from 'react';

import { connect } from 'react-redux'
import { LoggedIn } from '../store/actions'
import { bindActionCreators } from 'redux'

import axios from 'axios'

import logo from '../assets/images/logo-pacatuba.png'

import '../App.css'

// Firebase
import firebase from 'firebase'
import firebaseConfig from './firebaseConfig'




const API_KEY = 'ak_live_b8qQSH3mDivhqgwXhFNc5JnAggaA8m'
const BaseURL = 'https://api.pagar.me/1/subscriptions'
// const EK_KEY = 'ek_live_CwgSVhbDMCSIIKt0hxCdyQ2EOHB4b1'
// const IDPLAN = '1212867'



//Icones
function goHome() {
  window.location.href = "/"
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
    firebase.initializeApp(firebaseConfig)
    // this.providerGoogle = new firebase.auth.GoogleAuthProvider();
    if (this.state.userId) {
      window.location.href = "/"
    }
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
    })

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
      <div className="App app-login">
        {/* <div className="backgroundHero heroPg">
        <img className="backgroundHero heroPg heroLogin" src={bg101}/>
    </div> */}

        <header className="item-header-dashboard"></header>

        <div className="searchBox itemBoxInsert loginBox">
          <img className="logo-login" src={logo} alt="Logotipo" onClick={goHome} />
          <h1 className={this.state.classErr}>{this.state.status}</h1>
          {/* <p className="searchTitle">Login</p> */}
          <form>
            <input type="email" className="input-login" placeholder="Email"
              value={this.state.email} onChange={(event) => this.setState({ email: event.target.value })}
            /><br />
            <input type="password" className="input-login" placeholder="Senha"
              value={this.state.password} onChange={(event) => this.setState({ password: event.target.value })}
            />
            <div className="btnBox">
              <input type="button" onClick={
                (() => {
                  if (this.state.email === '') {
                    this.setState({ status: 'Digite seu email', classErr: 'txtErro' })
                  } else if (this.state.password === '') {
                    this.setState({ status: 'Digite sua senha', classErr: 'txtErro' })
                  } else {
                    this.authenticate()
                  }
                }
                )
              } className="btnLogin" value="Entrar" />
              <br />
              
              
              
              
              
              
              
              {/* <input type="button" className="btnLogin btnCadastro" value="Cadastre-se" onClick={
                (() => {
                  window.location.href = "/cadastro"
                }
                )
              }/> */}





            </div>
            <br />
            {/* <input type="button" className="btnLoginSM" value="Conectar Facebook"
              onClick={() => {
                this.handleLoginWithFacebook()
              }}
            />
            <br />
            <input type="button" className="btnLoginSM" value="Conectar Google"
              onClick={() => {
                this.handleLoginWithGoogle()
              }
              }
            /> */}
            <br />
            <a className="btnLoginTxt forgotPass" href="/esqueci-a-senha">Esqueceu a senha?</a>
          </form>
        </div>

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