import React, { Component } from 'react';

import axios from 'axios'

import {connect} from 'react-redux'

import '../../App.css'

import MainMenu from '../../components/mainMenu'


// Firebase
import firebase from 'firebase'
import firebaseConfig from '../firebaseConfig'




const API_KEY = 'ak_live_b8qQSH3mDivhqgwXhFNc5JnAggaA8m'
const BaseURL = 'https://api.pagar.me/1/subscriptions'



class Dashboard extends Component{
  constructor(props){
    super(props)
    this.state = {
      id: this.props.id,
      name: this.props.name,
      email: this.props.email,
      telefone: this.props.telefone,
      ddd: this.props.ddd,
      date: '12/02/2020',
      cardNumber: `XXXX`,
      cardFlag: 'Carregando...',
      planName: 'Carregando...',
    }
  }


  componentDidMount() {
    firebase.initializeApp(firebaseConfig)
    firebase.auth().onAuthStateChanged((signedUser) => {
      if(signedUser){
        this.setState({
          user: signedUser,
          id: signedUser.uid,
        });

        axios.get(`/users/${this.props.userId}.json`)
            .then(res => {

              // Pegando dados Sub PagarME
              const paymentData = {
                api_key: `${API_KEY}`
              }
              const options = {
                headers: {
                  'Content-Type': 'application/json'
                }
              }
              axios.get(`${BaseURL}/${res.data.idPay}`, {params: paymentData}, options)
                .then(res => {
                  this.setState({
                    planName: `${res.data.plan.name}`,
                    cardNumber: `${res.data.card_last_digits}`,
                    cardFlag: `${res.data.card_brand}`,
                  })
                })
              this.setState({
                telefone: res.data.telefone,
                ddd: res.data.ddd,
                name: res.data.nome
              })
            })
            .catch(err => console.log(err))

        // 
      }
      else{
        this.setState({
          user: undefined
        });
      }
    })
  }


  render() {
    return (
    <div className="App">
      <MainMenu/>
      <div className="backgroundHero heroPg">
          <p>
            {/* <img className="backgroundHero heroPg" src={bg101}/> */}
          </p>
      </div>
      
      <div className='infos'>
        <div className='left-infos'>
          <div className='title-infos'>
            <h1>Visão Geral</h1>
          </div>
          <h1>Nome <h2>{this.state.name}</h2></h1> <br/>
          
          <h1>Email <p>{this.state.email}</p></h1> <br/>
          
          <h1>Telefone <p>{this.state.ddd} {this.state.telefone}</p></h1> <br/>
          
          <input type="button" className='btnLogin btnDash' value="Editar Perfil" onClick={
            () => {
              window.location.href = "/alterardados"
            }
          }/>
        </div>



        <div className='rigth-infos'>
          <div className='title-infos'>
            <h1>Pagamento</h1>
          </div>
          <h2> Você faz parte do {this.state.planName}</h2>
          <h2>Cartão {this.state.cardFlag} que termina com {this.state.cardNumber} </h2>
          <input type="button" className='btnLogin btnDash' value="Atualizar" onClick={
            () => {
              window.location.href = "/alterarpagamento"
            }}
          />
          <input type='button' className='btnCadastro btnLogin btnDash' value='Cancelar Assinatura' onClick={
            () => {
              window.location.href = "/cancelarassinatura"
            }} />
        </div>
      </div>
          
    
    </div>
    )
  }
}

const mapStateToProps = store => {
  return{
    email: store.user.email,
    name: store.user.name,
    telefone: store.user.telefone,
    userId: store.user.userId,
  }
};

export default connect(mapStateToProps)(Dashboard);
// export default Dashboard