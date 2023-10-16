import React from 'react';
import '../App.css'

import {connect} from 'react-redux'
import {openAula, LoggedOut} from '../store/actions/index'
import { bindActionCreators } from 'redux';

import axios from 'axios'

// Icones

  //mudança de páginas

  
  class eClass extends React.Component{
    
    constructor(props){
      super(props)
      this.state = {
        id: '566',
        idCurso: '',
        idAula: '',
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
                  
                  // consultas
                  // visitantes = visitantes.filter(content => {
                  //     return content.condominio.includes(this.state.email)
                  // })
                  console.log(avisoAll.length)
                  avisoAll.length = 8;
                  this.setState({avisos: avisoAll})
                  
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
          () => {this.setState({idAula: aviso.contentDetails.videoId, idCurso: aviso.id, tipo: 'class'}, () => {
            (this.props.openAula(this.state))
            console.log(this.props.idAula)
            (window.location.href = "/player")
            // iRnqTM31iww
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

const mapStateToProps = store => {
  return{
    id: store.course.id,
    idAula: store.course.idAula,
    idCurso: store.course.idCurso,
    tipoAula: store.course.tipoAula,
    tipoItem: store.course.tipo,
    userId: store.user.userId,
  }
};


const mapDispatchToProps = dispatch => {
  return bindActionCreators({openAula, LoggedOut}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(eClass);