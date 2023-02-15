import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import '../App.css'

import {connect} from 'react-redux'
import {clickButton, visitRegister} from '../store/actions/index'
import { bindActionCreators } from 'redux';

import moment from 'moment'

import axios from 'axios'

// Icones


import imgEvent from '../assets/images/for-courses.png'


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

  class Mensalidade extends Component{
    constructor(props){
      super(props)
      this.state = {
        newId: '566',
        eventos: [],
      }
    }

    loadEventos = async () => {
      await axios.get(`/evento.json`)
              .catch(err => console.log(err))
              .then(res => {
                  const eventAll = res.data
                  let eventos = []
                  for(let key in eventAll){
                      eventos.push({
                          ...eventAll[key],
                          id: key
                      })
                  }
                  // consultas
                  // visitantes = visitantes.filter(content => {
                  //     return content.condominio.includes(this.state.email)
                  // })
                  this.setState({eventos: eventos})
              })
    }

    componentDidMount() {
      const loadPage  = () => this.loadEventos()
      loadPage()
    }
  render(){
    moment.locale('pt-br')

    // Calendário
    const eventos = this.state.eventos
    const listEvent = eventos.map((evento) => 
            <li className="Areas type3" >
                <div className="type3">
                    <img src={imgEvent}/>
                    <h1>{moment(evento.data).format('L')}</h1>
                    <p>{evento.evento}</p>
                </div>
            </li>
    )
  
    return (
        <section className="lives">
          <div className="divTitleSection">
            <div className="item-separator"></div>
            <h1 className="titleSection">Lives</h1>
          </div>
            <ul  className="listAreas2">
              {listEvent}
            </ul>
        </section>
    );
  }
}

export default Mensalidade;