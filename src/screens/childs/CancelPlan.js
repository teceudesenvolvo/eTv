import React, { Component } from 'react';
import '../../App.css'

import { connect } from 'react-redux'
import { LoggedIn } from '../../store/actions'
import { bindActionCreators } from 'redux'


import axios from 'axios'

import MainMenu from '../../components/mainMenu'

// // Background
// import backgroundIMG from '../../src/assets/images/bg106.jpg'

// import pagarme from 'pagarme'
// import firebase from 'firebase'



const API_KEY = 'ak_live_b8qQSH3mDivhqgwXhFNc5JnAggaA8m'
const BaseURL = 'https://api.pagar.me/1/subscriptions'
// const EK_KEY = 'ek_live_CwgSVhbDMCSIIKt0hxCdyQ2EOHB4b1'
// const IDPLAN = '1212867'



//Voltar para início
// function goHome() {
//   window.location.href = "/"
// }


class Payment extends Component {
  state = {
    userId: this.props.userId,
    email: this.props.email,
    tel: this.props.telefone,
    name: '',
    subId: '',
    cancelOpt1: '',
    cancelOpt2: '',
    cancelOpt3: '',
    paymentMethodId: '',
    status: 'Cancelar minha assinatura',
    classErr: 'titleLogin',
    btnStatus: 'Continuar'
  }

  // Atualizando Formas de Pagamento
  handlerCancel = () => {

    // Pegando ID da assinatura usuário
    axios.get(`/users/${this.props.userId}.json`)
      .catch(err => console.log(err))
      .then(res => {
        this.setState({
          subId: res.data.idPay
        })
      })



    // Realizando o cancelamento
    // for send - json
    const paymentData = {
      api_key: `${API_KEY}`
    }
    const options = {
      headers: {
        'Content-Type': 'application/json'
      }
    }
    // Enviando dados para o Server
    axios.post(`${BaseURL}/${this.state.subId}/cancel`, paymentData, options)
      .then(transactions => {
        axios.patch(`/users/${this.props.userId}.json`, {
          idPay: null
        }).catch(err => console.log(err))
        window.location.href = "/dashboard"
      })
      .catch((err) => {
        if (err) { this.setState({ status: 'Erro no servidor', classErr: 'txtErro' }) }
        console.log(err)
      })


  }

  componentDidMount = () => {
    setInterval(() => this.setState({ status: 'Cancelar minha assinatura', classErr: 'titleLogin' }), 20000);
  }


  render() {
    return (
      <div className="App app-login">
        <MainMenu />
        <div className='modifyBox'>
        <div className='left-infos'></div>
        
          <h1 className={this.state.classErr}>{this.state.status}</h1>
          <form>
            <input type="text" className="input-login input-dash" placeholder="Digite seu nome"
              value={this.state.name} onChange={(event) => this.setState({ name: event.target.value })}
            />

            <br />
            <select type="number" className="input-login input-dash"
              value={this.state.cardNumber} onChange={(event) => this.setState({ cardNumber: event.target.value })}>
              <option>Não encontrei o conteúdo que precisava.</option>
              <option>A plataforma não foi sufiente.</option>
              <option>Não quero ser um empreendedor.</option>
            </select>

            <br />
            <select type="number" className="input-login input-dash"
              value={this.state.cardNumber} onChange={(event) => this.setState({ cardNumber: event.target.value })}>
              <option>Muito boa, porém não encontrei o que buscava.</option>
              <option>Não gostei.</option>
              <option>Achei o conteúdo interessante, porém não me identifiquei.</option>
            </select>

            <br />
            <select type="number" className="input-login input-dash"
              value={this.state.cardNumber} onChange={(event) => this.setState({ cardNumber: event.target.value })}>
              <option>Sim</option>
              <option>Não</option>
              <option>Talvez</option>
            </select>

            
            <br />
            <div className="btn-dash">
              <input type="button" onClick={
                (() => {

                  // Validação de input vazio
                  if (this.state.name === '') {
                    this.setState({ status: 'Digite o nome corretamente', classErr: 'txtErro' })
                  }else {
                    this.setState({ status: 'Processando...', classErr: '', btnStatus: 'Processando...' })
                    this.handlerCancel();
                  }
                }
                )
              } className="btnLogin" value='Cancelar Assinatura' />

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