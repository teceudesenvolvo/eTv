import React, { Component } from 'react';

import axios from 'axios'

import {connect} from 'react-redux'
import {clickButton, LoggedIn} from '../../store/actions/index'
import { bindActionCreators } from 'redux';

// Componetes
import Class from '../../components/class'
import MainMenu from '../../components/mainMenu'

import '../../App.css'



//Icones

// function onClickHandler(){
//     // const data = new FormData() 
//     // data.append('file', this.state.selectedFile)
//     console.log('Botão funciona')
//     console.log(this.state.id)
// }

// function goFilter(){
//     window.location.href = "/listItems"
//   }


class Gestao extends Component{
  constructor(props){
    super(props)
    this.state = {
      id: this.props.id,
      tipo: this.props.tipoItem,
      userType: this.props.tipo,
      title: '',
      description: '',
      data: '',
      teacher: 'Carregando...',
      logoUrl: '',
      bgUrl: '',
      idCourse: '',
    }
  }


  loadAvisos = async () => {
    await axios.get(`/courses/${this.props.id}.json`)
            .catch(err => console.log(err))
            .then(res => {
              this.setState({
                idCourse: this.props.id,
                title: res.data.title,
                description: res.data.description,
                teacher: res.data.teacher,
                logoUrl: res.data.logoUrl,
                bgUrl: res.data.bgUrl,
              })
              this.props.clickButton(this.state)
            })
  }

  componentDidMount() {
    const loadPage  = () => this.loadAvisos()
    loadPage()
  }

  
  
  render() {
    return (
      <div className="App">
        <MainMenu/>
        <div className="backgroundHero heroPg">
            <p><img alt='heroBackground' className="backgroundHero heroPg" src={this.state.bgUrl}/></p>
        </div>
        <header className="item-header-content">
            <div className="box-class">
                  <div className="boxClass-text txt-course">
                    {/* <img src={this.state.logoUrl}/> */}
                    <h1>{this.state.title} </h1>
                    <h2>{this.state.teacher} </h2>
                    {/* <p className="txtItem txtBigItem">
                      {this.state.description}
                    </p> */}
                    {/* <FaSearch className="searchIcon"/>
                    <input className="searchItem" type="text" placeholder="Pesquisar" /> */}
                    {/* <p><FaLock/> Conteúdo exclusivo para assinantes <b>eudesenvolvo.com</b></p> */}
                  </div>
            </div>
        </header>
        <Class/>
        <section className="ficha-tecnica">
          <div className="ficha-tecnica-left">
              <h1 className="titleFichaTecnica">Ficha Tecnica</h1>
              <div className="underline"></div>
              <h2 className="subTitleFichaTecnica">Sinopse</h2>
              <p className="txtFichaTecnica">{this.state.description}</p>
              <p className="txtFichaTecnica"><b>Gênero: </b> Educação</p>
              {/* <p className="txtFichaTecnica"><b>Ano de lançamento: </b> 2021</p> */}
          </div>
          <div className="ficha-tecnica-rigth">
              <p className="txtFichaTecnica"><b>Titulo Original: </b> {this.state.title}</p>
              {/* <p className="txtFichaTecnica"><b>Duração: </b> Tempo em minutos</p> */}
              <p className="txtFichaTecnica"><b>Autor: </b> {this.state.teacher}</p>
              {/* <p className="txtFichaTecnica"><b>Direção: </b> Diretor de set</p> */}
              <p className="txtFichaTecnica"><b>Elenco: </b> {this.state.teacher}</p>
          </div>
        </section>
    </div>
    )
  }
}

const mapStateToProps = store => {
  return{
    id: store.course.id
  }
};


const mapDispatchToProps = dispatch => {
  return bindActionCreators({clickButton, LoggedIn}, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Gestao)
