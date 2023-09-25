import React from 'react';
import '../App.css'

import {connect} from 'react-redux'
import {clickButton, LoggedOut} from '../store/actions/index'
import { bindActionCreators } from 'redux';

import axios from 'axios'


// Icones

  //mudança de páginas
  // function list(){
  //   window.location.href = "/listItems"
  // }
  // function inicio(){
  //   window.location.href = "/inicio"
  // }
  // function itemClick(){
  //   window.location.href = "/item"
  //   console.log(this.state.id)
  // }

  class Elas extends React.Component{
    
    constructor(props){
      super(props)
      this.state = {
        id: '566',
        tipo: 'aviso',
        avisos: [],
        carregar: 'Carregar Elas',
        btnLoad: "visitanteBtn"
      }
    }

    loadAvisos = async () => {
      await axios.get(`/courses.json`)
              .catch(err => console.log(err))
              .then(res => {
                  const avisoAll = res.data
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
                    avisos.length = 4;
                    this.setState({avisos: avisos})
                  }
              })
    }

    componentDidMount() {
      const loadPage  = () => this.loadAvisos()
      loadPage()
    }
  
  render(){

    // Avisos
    const avisos = this.state.avisos 
  
    const listAvisos = avisos.map((aviso) => 
        <li className="Areas type1" key={aviso.id}
        onClick={
          () => {this.setState({id: aviso.id}, () => {
            (this.props.clickButton(this.state))
            (window.location.href = "/item")
          })}
        }
        >
              <img src={aviso.imageUrl} alt='cardImg' />
              <p className='titleCard titleCardMargin'> {aviso.title} </p>
              {/* <p className='txtCard'> {aviso.description} </p> */}
      </li>
    )
  
    return (
    <div>
        <section className="courses">
          <div className="divTitleSection">
            {/* <div className="item-separator"></div> */}
            <h1 className="titleSection">Reuniões</h1>
            <p className="newsSection">Todas reuniões plenárias</p>
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
  return bindActionCreators({clickButton, LoggedOut}, dispatch);
}

export default connect(null, mapDispatchToProps)(Elas);