import React, { Component } from 'react';
import ReactPlayer from 'react-player'

import axios from 'axios'

import {connect} from 'react-redux'

import logo from '../../assets/images/LOGO-MEUHALL-SF.png'
import bg101 from '../../assets/images/BANNER.png'
import '../../App.css'

//Icones
function goHome(){
  window.location.href = "/homeManager"
}
function goDashboard(){
    window.location.href = "/dashboard"
  }
function goCadastroMorador(){
    window.location.href = "/cadastroMorador"
}
function goFluxoCaixa(){
    window.location.href = "/fluxoCaixa"
}



class Financeiro extends Component{
  constructor(props){
    super(props)
    this.state = {
      title: 'Praia Exemplo',
      txtContent: 'Nam consequat lacus in lacus vestibulum blandit.',
      
      tipoConta: '',
      data: '',
      description: '',
      categoria: '',
      valor: '',

      contas: [],

      botao: 'Inserir'

    }
  }
  
  render() {
    // Tipo de Conta
    const tipoConta = () => {
    const contasAll = [
      {
          id: 1,
          tipo: 'Recebimentos Condomínio',
          contaTipe: 'Receita'
      },
      
      {
          id: 2,
          tipo: 'Outros Recebimentos',
          contaTipe: 'Receita'
      },
      {
          id: 3,
          tipo: 'Despesas Fixas',
          contaTipe: 'Despesa'
      },
      
      {
          id: 4,
          tipo: 'Despesas Variáveis',
          contaTipe: 'Despesa'
      },

      {
          id: 5,
          tipo: 'Empresas Terceirizadas',
          contaTipe: 'Despesa'
      },

      {
          id: 6,
          tipo: 'Serviços',
          contaTipe: 'Despesa'
      },

      {
          id: 7,
          tipo: 'Contratos',
          contaTipe: 'Despesa'
      },
      ]  
      let contas = []
      for(let key in contasAll){
        contas.push({
            ...contasAll[key],
            id: key
        })
    }
    // consultas
    contas = contas.filter(conta => {
        return conta.contaTipe.includes(this.state.tipoConta)
    })

    this.setState({contas: contas})
    console.log(this.state.contas)
  }
  
    const contasList = this.state.contas

    const contasTips = contasList.map((conta) => 
      <option value={conta.tipo}>
        {conta.tipo}
      </option>
    )
      
    return (
    <div className="App">
    <div className="backgroundHero heroPg">
      
    <p>
      <img className="backgroundHero heroPg" src={bg101}/>
    </p>
    
        </div>
        <img className="App-logo" src={logo} alt-text="Logotipo" onClick={goHome}/>

        <header className="item-header-dashboard">
            <div className="btnBox btnFinanceiro">
                <h5 className="titleTxt" style={{color: '#7f32ee'}}>{this.props.condominio}</h5>
                <input type="button" onClick={goCadastroMorador} className="btnSend btnFinanceiroIn" value="Cadastrar Morador"/>
                <input type="button" onClick={goDashboard} className="btnSend btnFinanceiroIn" value="Dashboard"/>
            </div>
        </header>

        <div className="searchBox itemBoxInsert ">
            <p className="searchTitle">Fluxo de Caixa</p>
            <select className="inputStyle searchText inputText inputSmall inputItem selectInput" value={this.state.tipoConta} 
            onChange={(event) => this.setState({tipoConta: event.target.value})}>
                <option value=''>Selecione o Tipo</option>
                <option value='Receita'>Receitas</option>
                <option value='Despesa'>Despesas</option>
            </select>
            <input type="date" className="inputStyle searchText inputText inputSmall inputItem " placeholder="Data" value={this.state.data} onChange={(event) => this.setState({data: event.target.value})}/>
            <input type="text" className="inputStyle searchText inputText inputSmall inputItem " placeholder="Descrição" value={this.state.description} onChange={(event) => this.setState({description: event.target.value})}/>
            <select className="inputStyle searchText inputText inputSmall inputItem selectInput" value={this.state.categoria} onChange={(event) => this.setState({categoria: event.target.value})} onFocus={() => tipoConta()}>
              <option value=''>Selecione a Categoria</option>
                {contasTips}
            </select>
            <input type="number" className="inputStyle searchText inputText inputSmall inputItem " placeholder="Valor" value={this.state.valor} 
            onChange={(event) => this.setState({valor: event.target.value})}/>
            <div className="btnBox">
                <input type="button"  className="btnSend" value={this.state.botao}
                onClick={() => {
                  if(this.state.tipoConta === ''){
                    this.setState({botao: 'Selecione o Tipo'})
                  }
                  else if(this.state.data === ''){
                    this.setState({botao: 'Selecione sua data'})
                  }
                  else if(this.state.description === ''){
                    this.setState({botao: 'Digite uma Descrição'})
                  }
                  else if(this.state.categoria === ''){
                    this.setState({botao: 'Selecione uma categoria'})
                  }
                  else if(this.state.valor === ''){
                    this.setState({botao: 'Digite o Valor'})
                  }
                  else if(this.state.tipoConta === 'Despesa'){
                    axios.post(`/fluxo.json`, {
                      conta: this.state.tipoConta,
                      data: this.state.data,
                      description: this.state.description,
                      categoria: this.state.categoria,
                      valor: -this.state.valor,
                      condominio: this.props.condominio,
                      sindico: this.props.nome,
                    })
                    this.setState({botao: 'Enviando', tipoConta: '', data: '', description: '', categoria: '', valor: '' })
                    setInterval(() => {
                      this.setState({
                        botao: 'Enviar',
                      })
                    }, 2000)
                  }
                  else if(this.state.tipoConta === 'Receita'){
                    this.setState({valor: +this.state.valor})
                    axios.post(`/fluxo.json`, {
                      conta: this.state.tipoConta,
                      data: this.state.data,
                      decrição: this.state.description,
                      categoria: this.state.categoria,
                      valor: this.state.valor,
                      condominio: this.props.condominio,
                      sindico: this.props.nome,
                    })
                    this.setState({botao: 'Enviando', tipoConta: '', data: '', description: '', categoria: '', valor: '' })
                    setInterval(() => {
                      this.setState({
                        botao: 'Enviar',
                      })
                    }, 2000)
                  }
                }
              }
                />
            </div>
        </div>

        <div className="btnBox btnFinanceiro boxFluxoCaixa">
                <input type="button" onClick={goFluxoCaixa} className="btnSend btnFinanceiroIn" value="Fluxo de Caixa"/>
        </div>

        <div className="footerSeparator">
            
        </div>
    </div>
    )
  }
}
const mapStateToProps = store => {
  return{
    id: store.lembretes.id,
    tipo: store.user.tipo,
    nome: store.user.name,
    condominio: store.user.condominio,
  }
};

export default connect(mapStateToProps)(Financeiro);
// export default Financeiro