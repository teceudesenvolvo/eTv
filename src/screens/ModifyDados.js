import React, { Component } from 'react';
import '../App.css'

import { connect } from 'react-redux'
import { LoggedIn } from '../store/actions'
import { bindActionCreators } from 'redux'

// import { cpf } from 'cpf-cnpj-validator'

import axios from 'axios'

import MainMenu from '../components/mainMenu'

// // Background
// import backgroundIMG from '../../src/assets/images/bg106.jpg'


// Firebase
import firebase from 'firebase'
import firebaseConfig from './firebaseConfig'


// const authBaseURL = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty'
// const API_KEY_FIREBASE = 'AIzaSyARJhClRUouS0OCKm1YzdNna-ayyTRZjwU'



//Voltar para início
// function goHome() {
//   window.location.href = "/"
// }



class Payment extends Component {


  state = {
    userId: this.props.userId,
    email: this.props.email,
    tel: this.props.telefone,
    ddd: this.props.ddd,
    name: this.props.nome,
    password: '',
    newPass: '',
    status: 'Editar Conta',
    classErr: 'titleLogin',
    btnStatus: 'Continuar',
    confirmNewPass: ''
  }


// Carregando a página
  componentDidMount = () => {
    firebase.initializeApp(firebaseConfig)
    console.log('carreguei a página e as funções')
    setInterval(() => this.setState({ status: 'Editar Conta', classErr: 'titleLogin' }), 10000);
  }


  // Atualizando Dados do Usuário

  authenticate() {

    // var user = firebase.auth().currentUser;
    var newPassword = this.state.newPass;
    var newEmail = this.state.email;
    // var credential;

    firebase.auth().signInWithEmailAndPassword(this.props.email, this.state.password)
      .then(res => {

        // Update Senha
        if(this.state.newPass){
          this.setState({
            password: this.state.newPass
          })
          firebase.auth().currentUser.updatePassword(newPassword)

        }
          //  Update Email
        else if(this.state.email !== this.props.email){
          firebase.auth().currentUser.updateEmail(newEmail)
            .catch(err => {
              this.setState({ status: 'Email já cadastrado!', classErr: 'txtErro' })
            })
        }

        axios.patch(`/users/${this.props.userId}.json`, {
          nome: this.state.name,
          ddd: this.state.ddd,
          telefone: this.state.tel
        }).catch(err => console.log(err))
        
        this.props.LoggedIn(this.state)
        window.location.href = "/dashboard"
      })
      .catch(err => {
        this.setState({ status: `${err.message}`, classErr: 'txtErro' })
      })
  };






  render() {
    return (
      <div className="App app-login">
        {/* <div className="backgroundHero heroPg">
          <img className="backgroundHero heroPg heroLogin" src={backgroundIMG} />
        </div> */}
        <MainMenu />
        <div className='modifyBox'>
        <h1 className={this.state.classErr}>{this.state.status}</h1>
          <form>
            <input type="text" className="input-login input-dash" placeholder="Nome"
              value={this.state.name} onChange={(event) => this.setState({ name: event.target.value })}
            />
            <br />
            <input type="email" className="input-login input-dash" placeholder="Email"
              value={this.state.email} onChange={(event) => this.setState({ email: event.target.value })}
            />
            <br />
            <input type="number" className="input-login input-small input-dash" placeholder="DDD" maxLength={3}
              value={this.state.ddd} onChange={(event) => this.setState({ ddd: event.target.value })}
            />
            <input type="tel" className="input-login input-medium input-dash" placeholder="Celular"
              value={this.state.tel} onChange={(event) => this.setState({ tel: event.target.value })}
            />
            <h1 className="titleLogin">Editar senha</h1>
            <input type="password" className="input-login input-dash" placeholder="Senha Atual"
              value={this.state.password} onChange={(event) => this.setState({ password: event.target.value })}
            />
            <input type="password" className="input-login input-dash" placeholder="Nova Senha"
              value={this.state.newPass} onChange={(event) => this.setState({ newPass: event.target.value })}
            />
            <input type="password" className="input-login input-dash" placeholder="Confirmar Nova Senha"
              value={this.state.confirmNewPass} onChange={(event) => this.setState({ confirmNewPass: event.target.value })}
            />
            <br />
            
            <br />
            <div className="btnBox">
              <input type="button" onClick={
                (() => {
                  if (this.state.name === '') {
                    this.setState({ status: 'Digite seu nome', classErr: 'txtErro' })
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
                  } else if (this.state.confirmNewPass !== this.state.password) {
                    this.setState({ status: 'A confirmação está diferente da senha escolhida', classErr: 'txtErro' })
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
                  else if (this.state.tel === '') {
                    this.setState({ status: 'Digite sua celular', classErr: 'txtErro' })
                  }

                  else {
                    this.authenticate()
                  }
                }
                )
              } className="btnLogin input-dash btn-dash" value={this.state.status} />
            </div>
          </form>





        </div>



        {/* <div className="searchBox itemBoxInsert modifyBox">
          <div>
            
          </div>
        </div> */}
























      </div>
    )
  }
}

const mapStateToProps = store => {
  return {
    nome: store.user.name,
    email: store.user.email,
    telefone: store.user.telefone,
    userId: store.user.userId,
    ddd: store.user.ddd,
    cpf: store.user.cpf,
  }
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ LoggedIn }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Payment)
// export default Gestao