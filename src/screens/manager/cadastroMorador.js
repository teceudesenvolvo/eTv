import React, { Component } from 'react';
import ReactPlayer from 'react-player'

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
function goPainelFinanceiro(){
    window.location.href = "/painelFinanceiro"
  }

class CadastroMorador extends Component{
  constructor(props){
    super(props)
    this.state = {
      title: 'Praia Exemplo',
      txtContent: 'Nam consequat lacus in lacus vestibulum blandit.',
      date: ['10/02/2019', '15/03/2019'],
      id: this.props.id,
    }
  }
  
  render() {
    // Apartamentos
    const items = [
      {
          id: 1,
          morador: '910-A',
          condominio: 'Modelo'
      },
      {
        id: 2,
        morador: '910-B',
        condominio: 'Modelo'
      },

      ]  
      const listItem = items.map((item) => 
          <option>
            {item.morador}
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

        <header className="item-header">
            <div className="btnBox btnFinanceiro">
                <h5 className="titleTxt" style={{color: '#7f32ee'}}>Condomínio Modelo</h5>
                <input type="button" onClick={goPainelFinanceiro} className="btnSend btnFinanceiroIn" value="Painel Financeiro"/>
                <input type="button" onClick={goDashboard} className="btnSend btnFinanceiroIn" value="Dashboard"/>
            </div>
        </header>

        <div className="searchBox itemBoxInsert ">
            <p className="searchTitle">Cadastrar Usuário</p>
            <input type="email" className="inputStyle searchText inputText inputSmall inputItem " placeholder="Email"/>
            <input type="text" className="inputStyle searchText inputText inputSmall inputItem " placeholder="Senha"/>
            <input type="text" className="inputStyle searchText inputText inputSmall inputItem " placeholder="Unidade, ex.: 902-A "/>
            <select className="inputStyle searchText inputText inputSmall inputItem selectInput ">
              <option>Morador</option>
              <option>Porteiro</option>
              <option>Zelador</option>
              <option>Ronda</option>
            </select>
            <div className="btnBox">
                <input type="button"  className="btnSend" value="Cadastrar"/>
            </div>
        </div>

        <div className="footerSeparator">
            
        </div>
    </div>
    )
  }
}

export default CadastroMorador