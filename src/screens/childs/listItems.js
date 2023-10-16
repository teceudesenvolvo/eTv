import React, { Component } from 'react';

import axios from 'axios'

import {connect} from 'react-redux';
import {openAula, clickButton, LoggedOut} from '../../store/actions/index';
import { bindActionCreators } from 'redux';

import MainMenu from '../../components/mainMenu'

import '../../App.css'

//Icones

// function onClickHandler(){
//     // const data = new FormData() 
//     // data.append('file', this.state.selectedFile)
//     console.log('Botão funciona')
// }

// function goHome(){
//   window.location.href = "/buscar"
// }

// function content(){
//     window.location.href = "/item"
// }

// function goFilter(){
//     window.location.href = "/listItems"
// }


class ListItem extends Component{
  constructor(props){
    super(props)
    this.state = {
      id: '566',
      tipo: 'aviso',
      avisos: [],
      carregar: 'Carregar Avisos',
      btnLoad: "visitanteBtn",
      searchCourse: '',

    }
  }

  loadAvisos = async () => {
    // await axios.get(`/sessoes.json`)
    // await axios.get(`/class.json`)
    await axios.get(``)
            .catch(err => console.log(err))
            .then(res => {
                const avisoAll = res.data.items
                let avisos = []
                for(let key in avisoAll){
                    avisos.push({
                        ...avisoAll[key],
                        id: key
                    })
                }
             
                // if(avisos.length > 4){
                //   avisos.reverse()
                //   avisos.length = 12;
                // }

                
                
                avisos = avisos.filter(content => content.snippet.title.toUpperCase().includes(this.state.searchCourse.toUpperCase()))
                this.setState({avisos: avisos})
                console.log({avisos: avisos})             

               

               

            })
  }

 // pesquisar aula
  
 

  componentDidMount(){

   

    const loadPage  = () => this.loadAvisos()
    loadPage()
  }

  
  render() {
    
    // Carregar Aulas
    const avisos = this.state.avisos 
  
    const listAvisos = avisos.map((aviso) => 
        <li className="Areas type1" key={aviso.id}
        onClick={
          () => {this.setState({idAula: `${aviso.id}`, idCurso: `${aviso.idCourse}`, tipo: 'class'}, () => {
            (this.props.openAula(this.state))
            (window.location.href = "/player")
          })}
        }
        >
              <img src={aviso.snippet.thumbnails.high.url} alt='Thumb' />
              <p className='titleCard'> {
              aviso.snippet.title
              } </p>
              {/* <p className='txtCard'> {aviso.description} </p> */}
      </li>
    )

    return (
      <div className="App">
        <MainMenu />
        <div className="backgroundHero heroPg">
            <input type="text" className="searchText" placeholder="Qual o conteúdo que você deseja assistir?"
              value={this.state.search} onChange={(event) => {
                this.setState({ searchCourse: event.target.value });
                this.loadAvisos()
              }}
            />
        </div>

      <header className="App-header">
          <div className="search">
               
              {/* <div className="searchBox">
              </div> */}
            <ul className="listBox">
                {listAvisos}
            </ul>
          </div>
    </header>
    {/* <div className="footerSeparator">
    </div> */}

    </div>
    )
  }
}


const mapDispatchToProps = dispatch => {
  return bindActionCreators({openAula, clickButton, LoggedOut}, dispatch);
}

export default connect(null, mapDispatchToProps)(ListItem);