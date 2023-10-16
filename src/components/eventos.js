import React from 'react';
import '../App.css'

import {connect} from 'react-redux'
import {openAula, clickButton, LoggedOut} from '../store/actions/index'
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
                  avisos = avisos.filter(content => content.snippet.title.toUpperCase().includes('Audiência'))
                  if(avisos.length > 4){
                    avisos.length = 4;
                    this.setState({avisos: avisos})
                  }
                  console.log('1')
              })
    }

    componentDidMount() {
      const loadPage  = () => console.log(this.loadAvisos())
      loadPage()
    }
  
  render(){

    // Carregar Aulas
    const avisos = this.state.avisos 
  
    const listAvisos = avisos.map((aviso) => 
        <li className="Areas type1" key={aviso.id}
        onClick={
          () => {this.setState({idAula: aviso.contentDetails.videoId, idCurso: aviso.id, tipo: 'class'}, () => {
            (this.props.openAula(this.state))
            console.log(this.props.idAula)
            (window.location.href = "/player")
          })}
        }
        >
              <img src={aviso.snippet.thumbnails.high.url} alt='thurmb'/>
              <p className='titleCard'> {aviso.snippet.title} </p>
              {/* <p className='titleCard'> {aviso.etag} </p> */}
              {/* <p className='txtCard'> {aviso.description} </p> */}
      </li>
    )
  
    return (
    <div>
        <section className="courses">
          <div className="divTitleSection">
            {/* <div className="item-separator"></div> */}
            <h1 className="titleSection">Eventos</h1>
            <p className="newsSection">Todos os eventos da câmara</p>
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
  return bindActionCreators({openAula, clickButton, LoggedOut}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Elas);