import React, { Component } from 'react';

// import {connect} from 'react-redux'

import bg101 from '../../assets/images/BANNER.png'
import '../../App.css'

//Icones
// function goHome(){
//   window.location.href = "/homeManager"
// }
// function goDashboard(){
//     window.location.href = "/dashboard"
// }
// function goPainelFinanceiro(){
//     window.location.href = "/painelFinanceiro"
//   }

class Dashboard extends Component{
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
      // const listItem = items.map((item) => 
      //     <option>
      //       {item.morador}
      //     </option>
      // )
    return (
    <div className="App">
    <div className="backgroundHero heroPg">
      
    <p>
      <img className="backgroundHero heroPg" alt='BgAdmin' src={bg101}/>
    </p>
    
        </div>

        

        <div className="searchBox mensalBoxInsert boxAdmin ">
            <p className="searchTitle">Cadastrar Condomínio</p>
            <input type="text" className="inputStyle searchText inputText inputSmall inputItem " placeholder="Condomínio"/>
            <input type="text" className="inputStyle searchText inputText inputSmall inputItem " placeholder="Responsável"/>
            <input type="email" className="inputStyle searchText inputText inputSmall inputItem " placeholder="email"/>
            <input type="text" className="inputStyle searchText inputText inputSmall inputItem " placeholder="Senha"/>
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



export default Dashboard
// export default Gestao