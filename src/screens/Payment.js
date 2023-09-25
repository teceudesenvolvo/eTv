import React, { Component } from 'react';
import '../App.css'

import { connect } from 'react-redux'
import { LoggedIn } from '../store/actions'
import { bindActionCreators } from 'redux'


import axios from 'axios'

import logo from '../assets/images/logo12.png'

import pagarme from 'pagarme'
import firebase from 'firebase'



const API_KEY = "ak_live_b8qQSH3mDivhqgwXhFNc5JnAggaA8m"
const BaseURL = 'https://api.pagar.me/1/subscriptions'
const EK_KEY = "ek_live_CwgSVhbDMCSIIKt0hxCdyQ2EOHB4b1"
const IDPLAN = '1212867'



//Voltar para início
// function goHome() {
//   window.location.href = "/"
// }



class Payment extends Component {
  state = {
    userId: '',
    email: '',
    tel: '',
    name: '',
    cardNumber: '',
    paymentMethodId: '',
    venc: '',
    cvv: '',
    cep: '',
    adress: '',
    number_adress: '',
    bairro: '',
    cidade: '',
    estado: '',
    cardHash: '',
    status: 'Realizar pagamento',
    classErr: 'titleLogin',
    btnStatus: 'Continuar'
  }


  // Realizar Pagamento
  handlerPayment = () => {

    axios.patch(`/users/${this.props.userId}.json`, {
      cep: this.state.cep,
      adress: this.state.adress,
      number_adress: this.state.number_adress,
      bairro: this.state.bairro,
      uf: this.state.estado,
      cidade: this.state.cidade,
    })
      .catch(err => console.log(err))

    // Criando Assinatura - Cartão

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

    const paymentData = {
      api_key: `${API_KEY}`,
      card_hash: this.state.cardHash,
      customer: {
        address: {
          neighborhood: this.state.bairro,
          street: this.state.adress,
          street_number: this.state.number_adress,
          zipcode: this.state.cep
        },
        document_number: this.props.cpf,
        email: this.state.email,
        name: this.state.name,
        phone: {
          ddd: this.state.ddd,
          number: this.state.telefone,
        }
      },
      payment_method: "credit_card",
      plan_id: `${IDPLAN}`,


    }
    const options = {
      headers: {
        'Content-Type': 'application/json'
      }
    }
    axios.post(`${BaseURL}`, paymentData, options)
      .then((transactions) => {
        axios.patch(`/users/${this.props.userId}.json`, {
          idPay: transactions.data.id,
          nome: this.state.nome,
          ddd: this.state.ddd,
          telefone: this.state.telefone,
          cpf: this.state.cpf,
        })
          .then((res) => {
            if (res.data.idPay) {
              window.location.href = "/inicio"
              firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
                .then(signedUser => {
                  this.setState({ userId: signedUser.uid })
                })
            } else {
              this.setState({ status: 'Erro no servidor, aguarde...', classErr: 'txtErro' })
            }
          })
          .catch(err => console.log(err))
      })
      .catch(err => { if (err.code === 400) { this.setState({ status: 'Erro no pagamento, tente novamente ou contate o administrador do cartão...', classErr: 'txtErro' }) } })
  }

  changeCep = () => {
    this.setState({
      adress: 'Carregando...',
      bairro: 'Carregando...',
      cidade: 'Carregando...',
      estado: 'Carregando...',
    })
    axios.get(`https://viacep.com.br/ws/${this.state.cep}/json`)
      .then((res) => {
        this.setState({
          adress: res.data.logradouro,
          bairro: res.data.bairro,
          estado: res.data.uf,
          cidade: res.data.localidade,
        })
      })
      .catch((erro) => {
        this.setState({ status: 'Cep Invalido', classErr: 'txtErro' })
        console.log(erro)
      })
  }

  componentDidMount = () => {
    setInterval(() => this.setState({ status: 'Realize o pagamento', classErr: 'titleLogin' }), 20000);
    

    // Capturando os dados do usuário no DB
    axios.get(`/users/${this.props.userId}.json`)
      .then((res) => {
        this.setState({
          name: res.data.name,
          telefone: res.data.telefone,
          ddd: res.data.ddd,
          cpf: res.data.cpf,
        })
      })
      .catch((erro) => {
        this.setState({ status: 'Usuário não encontrado', classErr: 'txtErro' })
        console.log(erro)
      })
  }


  render() {
    return (
      <div className="App app-login">
        {/* <div className="backgroundHero heroPg">
              <img className="backgroundHero heroPg heroLogin" src={bg101}/>
            </div> */}
        <header className="item-header-dashboard"></header>

        <div className="searchBox itemBoxInsert loginBox singupBox paymentBox">

          <img className="logo-login" src={logo} alt="Logotipo" />
          <h1 className={this.state.classErr}>{this.state.status}</h1>
          <form>
            {/* <div className='div-label'><label>Nome no cartão*</label></div> */}
            <input type="text" className="input-login" placeholder="Nome no cartão*"
              value={this.state.name} onChange={(event) => this.setState({ name: event.target.value })}
            />
            <br />
            {/* <div className='div-label'><label>Numero do cartão*</label></div> */}
            <input type="number" className="input-login" placeholder="Número do cartão*" maxLength={16}
              value={this.state.cardNumber} onChange={(event) => this.setState({ cardNumber: event.target.value })}
            />
            <br />
            {/* <div className='div-label'><label>Validade*</label><br /></div> */}
            <input type="number" className="input-login" placeholder="00/00*" maxLength={4}
              value={this.state.venc} onChange={(event) => this.setState({ venc: event.target.value })}
            />
            <br />
            {/* <div className='div-label'><label>CVV*</label><br /></div> */}
            <input type="number" className="input-login" placeholder="CVV*" maxLength={3}
              value={this.state.cvv} onChange={(event) => this.setState({ cvv: event.target.value })}
            />
            <br />
            <div className='paymentInfos'>
              <h1>Total:</h1>
              <h2>R$ 59,99/mês</h2>
              <p>Renovação mensal automática. Cancele a qualquer momento.</p>
            </div>
            <h1 className="titleLogin">Dados de endereço</h1>
            {/* <div className='div-label'><label>CEP*</label><br /></div> */}
            <input type="number" className="input-login" placeholder="00000000*" maxLength={8}
              value={this.state.cep} onChange={(event) => this.setState({ cep: event.target.value })}
            />
            <br />
            {/* <div className='div-label'><label>Endereço*</label><br /></div> */}
            <input type="text" className="input-login" placeholder="Rua Exemplo*" onFocus={() => this.changeCep()}
              value={this.state.adress} onChange={(event) => this.setState({ adress: event.target.value })}
            />
            <br />
            {/* <div className='div-label'><label>Número*</label><br /></div> */}
            <input type="number" className="input-login" placeholder="XXX*" maxLength={6}
              value={this.state.number_adress} onChange={(event) => this.setState({ number_adress: event.target.value })}
            />
            <br />
            {/* <div className='div-label'><label>Bairro*</label><br /></div> */}
            <input type="text" className="input-login" placeholder="Bairro*"
              value={this.state.bairro} onChange={(event) => this.setState({ bairro: event.target.value })}
            />
            <br />
            {/* <div className='div-label'><label>Cidade*</label><br /></div> */}
            <input type="text" className="input-login" placeholder="Cidade*" maxLength={2}
              value={this.state.cidade} onChange={(event) => this.setState({ cidade: event.target.value })}
            />
            <br />
            {/* <div className='div-label'><label>Estado*</label><br /></div> */}
            <input type="text" className="input-login" placeholder="Estado (UF)*" maxLength={2}
              value={this.state.estado} onChange={(event) => this.setState({ estado: event.target.value })}
            />
            <br />

            <div className="politicPrivacy">
              <h3>Clicando em continuar você concorda todas as <a className="btnLoginTxt a-politic-privacy" href="https://eudesenvolvo.com/politica-privacidade">Politicas de privacidade.</a></h3>
            </div>


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
                  } else if (this.state.cep === '') {
                    this.setState({ status: 'Digite o CEP corretamente', classErr: 'txtErro' })
                  } else if (this.state.adress === '') {
                    this.setState({ status: 'Digite o seu Endereço corretamente', classErr: 'txtErro' })
                  } else if (this.state.bairro === '') {
                    this.setState({ status: 'Digite o seu Bairro corretamente', classErr: 'txtErro' })
                  } else {
                    this.setState({ status: 'Processando...', classErr: '', btnStatus: 'Processando...' })
                    this.handlerPayment();
                  }
                }
                )
              } className="btnLogin btnPay" value={this.state.status} />

            </div>
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