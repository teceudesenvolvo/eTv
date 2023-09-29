import React from 'react';
import '../App.css'

import {connect} from 'react-redux'
import {clickButton, LoggedOut} from '../store/actions/index'
import { bindActionCreators } from 'redux';

import axios from 'axios'

// Icones

  //mudança de páginas

  
  class eClass extends React.Component{
    
    constructor(props){
      super(props)
      this.state = {
        id: '566',
        tipo: 'aviso',
        avisos: [],
        carregar: 'Carregar Avisos',
        btnLoad: "visitanteBtn"
      }
    }

    loadAvisos = async () => {
      // await axios.get(`/courses.json`)
      await axios.get(``)
              .catch(err => console.log(err))
              .then(res => {
                  console.log('1')
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
                    avisos.length = 4;
                    this.setState({avisos: avisos})
                  }
              })
    }

    componentDidMount() {
      const loadPage  = () => console.log(this.loadAvisos())
      loadPage()
    }
  
  render(){

    // Avisos
    const avisos = this.state.avisos 
  
    const listAvisos = avisos.map((aviso) => 
        <li className="Areas typePodcast" key={aviso.id}
        onClick={
          () => {this.setState({id: aviso.contentDetails.videoId}, () => {
            (this.props.clickButton(this.state))
            (window.location.href = "/player")
          })}
        }
        >
              <img src={aviso.snippet.thumbnails.high.url} alt='thumb' />
              <p className='titleCard'> {aviso.snippet.title} </p>
              {/* <p className='txtCard'> {aviso.description} </p> */}
      </li>
    )
  
    return (
    <div>
        <section className="courses">
          <div className="divTitleSection">
            <h1 className="titleSection">Recentes</h1>
            <p className="newsSection">Eventos e sessões mais recentes</p>
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

export default connect(null, mapDispatchToProps)(eClass);