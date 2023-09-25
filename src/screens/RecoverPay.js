import React, { Component } from 'react';
import '../App.css'

import { connect } from 'react-redux'
import { LoggedIn } from '../store/actions'
import { bindActionCreators } from 'redux'


import axios from 'axios'

import MainMenu from '../components/mainMenu'

// // Background
// import backgroundIMG from '../../src/assets/images/bg106.jpg'

import pagarme from 'pagarme'
// import firebase from 'firebase'


const API_KEY = 'ak_live_b8qQSH3mDivhqgwXhFNc5JnAggaA8m'
const BaseURL = 'https://api.pagar.me/1/subscriptions'
const EK_KEY = 'ek_live_CwgSVhbDMCSIIKt0hxCdyQ2EOHB4b1'
const IDPLAN = '1212867'



//Voltar para início
// function goHome() {
//   window.location.href = "/"
// }


class Payment extends Component {
  state = {
    userId: this.props.userId,
    email: this.props.email,
    tel: this.props.telefone,
    name: this.props.nome,
    subId: '',
    cardNumber: '',
    paymentMethodId: '',
    venc: '',
    cvv: '',
    cardHash: '',
    status: 'Atualizar o pagamento',
    classErr: 'titleLogin',
    btnStatus: 'Continuar'
  }

  // Atualizando Formas de Pagamento
  handlerPayment = () => {

    // Pegando ID da assinatura usuário
    axios.get(`/users/${this.props.userId}.json`)
      .catch(err => console.log(err))
      .then(res => {
        this.setState({
          subId: res.data.idPay
        })
      })




    // Alterando o Cartão ---------------

    // ----------------------------------

    // Gerando CardHash
    pagarme.client.connect({ api_key: `${API_KEY}` })
      .then(client => client.transactions.all())

    const card = {
      card_number: this.state.cardNumber,
      card_holder_name: this.state.name,
      card_expiration_date: this.state.venc,
      card_cvv: this.state.cvv,
    }

    let cardValidations = pagarme.validate({ card: card })

    if (!cardValidations.card.card_number) {
      this.setState({ status: 'Verifique os dados do cartão', classErr: 'txtErro' })
    } else if (!cardValidations.card.card_expiration_date) {
      this.setState({ status: 'Verifique os dados do cartão', classErr: 'txtErro' })
    } else if (!cardValidations.card.card_cvv) {
      this.setState({ status: 'Verifique os dados do cartão', classErr: 'txtErro' })
    }

    pagarme.client.connect({ encryption_key: `${EK_KEY}` })
      .then(client => client.security.encrypt(card))
      .then(card_hash => { this.setState({ cardHash: card_hash }) })


    // Realizando a alteração
    // for send - json
    const paymentData = {
      api_key: `${API_KEY}`,
      card_hash: this.state.cardHash,
      payment_method: "credit_card",
      plan_id: `${IDPLAN}`,
    }
    const options = {
      headers: {
        'Content-Type': 'application/json'
      }
    }
    // Enviando dados para o Server
    axios.put(`${BaseURL}/${this.state.subId}`, paymentData, options)
      .then(transactions => {
        window.location.href = "/dashboard"
      })
      .catch((err) => {
        if (err) { this.setState({ status: 'Erro no pagamento, tente novamente ou contate o administrador do cartão...', classErr: 'txtErro' }) }
        console.log(err)
      })


  }

  componentDidMount = () => {
    setInterval(() => this.setState({ status: 'Atualizar o pagamento', classErr: 'titleLogin' }), 20000);
  }


  render() {
    return (
      <div className="App app-login">
       
        <MainMenu />
        <div className='modifyBox singupBox'>
          <h1 className="title-msg-atualizar-pagamento">Alterar dados de pagamento</h1>
          <h1 className="desc-msg-atualizar-pagamento">Atualize seu pagamento e continue aproveitando todo o conteúdo.</h1>

          <h1 className={this.state.classErr}>{this.state.status}</h1>
          <form>
            <input type="text" className="input-login input-dash" placeholder="Nome no cartão*"
              value={this.state.name} onChange={(event) => this.setState({ name: event.target.value })}
            />
            <br />
            <input type="number" className="input-login input-dash" placeholder="Número do cartão*" maxLength={16}
              value={this.state.cardNumber} onChange={(event) => this.setState({ cardNumber: event.target.value })}
            />
            <br />
            <input type="number" className="input-login input-dash input-medium input-medium-correct" placeholder="00/00*" maxLength={4}
              value={this.state.venc} onChange={(event) => this.setState({ venc: event.target.value })}
            />
            <input type="number" className="input-login input-dash input-small" placeholder="CVV*" maxLength={3}
              value={this.state.cvv} onChange={(event) => this.setState({ cvv: event.target.value })}
            />
            <br />
            <div className="btnBox">
              <input type="button" onClick={
                (() => {

                  // Validação de input vazio
                  if (this.state.name === '') {
                    this.setState({ status: 'Digite o nome corretamente', classErr: 'txtErro' })
                  } else if (this.state.cardNumber === '') {
                    this.setState({ status: 'Digite o número do cartão', classErr: 'txtErro' })
                  } else if (this.state.venc === '') {
                    this.setState({ status: 'Digite a Validade corretamente', classErr: 'txtErro' })
                  } else if (this.state.cvv === '') {
                    this.setState({ status: 'Digite o CVV', classErr: 'txtErro' })
                  } else {
                    this.setState({ status: 'Processando...', classErr: '', btnStatus: 'Processando...' })
                    this.handlerPayment();
                  }
                }
                )
              } className="btnLogin btnPay" value="Atualizar Pagamento" />

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