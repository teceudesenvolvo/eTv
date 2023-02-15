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
function goPainelFinanceiro(){
    window.location.href = "/painelFinanceiro"
}



class FluxoCaixa extends Component{
  constructor(props){
    super(props)
    this.state = {
      title: 'Praia Exemplo',
      txtContent: 'Nam consequat lacus in lacus vestibulum blandit.',
      date: ['10/02/2019', '15/03/2019'],
      fluxo: []
    }
  }

  loadFluxo = async () => {
    await axios.get(`/fluxo.json`)
            .catch(err => console.log(err))
            .then(res => {
                const fluxoAll = res.data
                let fluxo = []
                for(let key in fluxoAll){
                    fluxo.push({
                        ...fluxoAll[key],
                        id: key
                    })
                }
                // consultas
                // fluxo = fluxo.filter(content => {
                //     return content.condominio.includes(this.props.condominio)
                // })

                this.setState({fluxo: fluxo})
            })
  }

  componentDidMount() {
    const loadPage  = () => {
      this.loadFluxo()
    }
    loadPage()
  }
  
  render() {
    // Apartamentos
      const items = this.state.fluxo

      const listItem = items.map((item) => 
      <li className="fluxCaixaLI">
          <p>{item.data}</p>
          <p>{item.description}</p>
          <p>{item.conta}</p>
          <p>R$ {item.valor}</p>
      </li>
      );
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
                <h5 className="titleTxt" style={{color: '#7f32ee'}}>Condomínio Modelo</h5>
                <input type="button" onClick={goPainelFinanceiro} className="btnSend btnFinanceiroIn" value="Painel Financeiro"/>
                <input type="button" onClick={goDashboard} className="btnSend btnFinanceiroIn" value="Dashboard"/>
            </div>
        </header>

        <div className="searchBox itemBoxInsert ">
            <p className="searchTitle">Fluxo de Caixa</p>
            <ul className="fluxoCaixaUL">
                {listItem}
            </ul>
        </div>

        <div className="footerSeparator">
            
        </div>
    </div>
    )
  }
}


export default FluxoCaixa