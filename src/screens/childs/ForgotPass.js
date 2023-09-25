import React, { Component } from 'react';

import {connect} from 'react-redux'
import {LoggedIn} from '../../store/actions'
import {bindActionCreators} from 'redux'

import logo from '../../assets/images/logo12.png'
import '../../App.css'


import firebase from 'firebase'
import firebaseConfig from '../firebaseConfig'

//Icones
function goHome(){
  window.location.href = "/"
}

// const onKeyDown = (event) => {
//   if(event.key === 'Enter'){
//     // entrar();
//   }else{
//     console.log('Não fui')
//   }
// }

class Login extends Component{
  state = {
      email: '',
      name: '',
      celular: '',
      status: 'Recuperar a senha'
    }


    componentDidMount() {
      firebase.initializeApp(firebaseConfig);
      this.auth = firebase.auth()
  
      // Mudando o texto do status 
      setInterval(() => this.setState({ status: 'Recuperar a senha', classErr: '' }), 20000);
    }

    sendEmail = () => {
      firebase.auth().sendPasswordResetEmail(this.state.email)
        .then(res => {
          this.setState({status: 'Verifique seu email!'})
        })
    }

  
  render() {
    return (
    <div className="App app-login">
    {/* <div className="backgroundHero heroPg">
        <img className="backgroundHero heroPg heroLogin" src={bg101}/>
    </div> */}

        <header className="item-header-dashboard"></header>

        <div className="searchBox itemBoxInsert loginBox singupBox forgotBox">
            <img className="logo-login" src={logo} alt="Logotipo" onClick={goHome}/>
            <h1>{this.state.status}</h1>
            <form>
              <h2>Informe o mesmo e-mail que você utilizou ao criar sua conta.</h2>
              <input type="email" className="input-login" placeholder="Email" 
              value={this.state.email} onChange={(event) => this.setState({email: event.target.value})}
              />
              <br/>
              <div className="btnBox">
                  <input type="button" onClick={
                  (() => {
                    if(this.state.email === ''){
                      alert('digite sua email')
                    }
                    else{
                      this.sendEmail()
                    }
                  }
                  )
                    }className="btnLogin" value="Continuar"/>
              </div>
            </form>
        </div>

    </div>
    )
  }
}

const mapStateToProps = store => {
  return{
    nome: store.user.name,
    tipo: store.user.tipo,
  }
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ LoggedIn }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Login)
// export default Gestao