import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import '../App.css';

import {connect} from 'react-redux';
import {openAula, clickButton, LoggedOut} from '../store/actions/index';
import { bindActionCreators } from 'redux';

import axios from 'axios';


// ITEMS ICONS
import imgCourseFeacture from '../assets/images/gerencia-e-controle.png'

// Icones

  //mudança de páginas
  function list(){
    window.location.href = "/listItems"
  }
  function inicio(){
    window.location.href = "/inicio"
  }
  function itemClick(){
    window.location.href = "/item"
    console.log(this.state.id)
  }

  class Avisos extends React.Component{
    
    constructor(props){
      super(props)
      this.state = {
        id: '566',
        idCourse: '',
        idCurso: '',
        idAula: '',
        tipo: 'aviso',
        avisos: [],
        carregar: 'Carregar Avisos',
        btnLoad: "visitanteBtn"
      }
    }

    loadAvisos = async () => {
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
                  // consultas
                  // visitantes = visitantes.filter(content => {
                  //     return content.condominio.includes(this.state.email)
                  // })
                  if(avisos.length > 4){
                    avisos.reverse()
                    avisos.length = 12;
                    this.setState({avisos: avisos})
                  }
              })
    }

    componentDidMount() {
      const loadPage  = () => this.loadAvisos()
      loadPage()
    }
  
  render(){

    // Carregar Aulas
    const avisos = this.state.avisos 
  
    const listAvisos = avisos.map((aviso) => 
        <li className="Areas type1" key={aviso.id}
        onClick={
          () => {this.setState({idAula: aviso.id, idCurso: aviso.etag, tipo: 'class'}, () => {
            (this.props.openAula(this.state))
            // (window.location.href = "/player")
            console.log(this.props.idAula)
            console.log(this.state.idCurso)
            console.log(this.state.tipo)
          })}
        }
        >
              <img src={aviso.snippet.thumbnails.high.url}/>
              <p className='titleCard'> {aviso.snippet.title} </p>
              <p className='titleCard'> {aviso.etag} </p>
              {/* <p className='txtCard'> {aviso.description} </p> */}
      </li>
    )
  
    return (
    <div>
        <section className="courses">
          <div className="divTitleSection">
            {/* <div className="item-separator"></div> */}
            <h1 className="titleSection">Eventos</h1>
            <p className="newsSection">Nossos Eventos</p>
          </div>
            <ul  className="listAreas2">
              {listAvisos}
            </ul>
        </section>

      </div>
    );
  }
}


const mapDispatchToProps = dispatch => {
  return bindActionCreators({openAula, LoggedOut}, dispatch);
}

export default connect(null, mapDispatchToProps)(Avisos);