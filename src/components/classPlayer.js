import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import '../App.css'

import {connect} from 'react-redux'
import {openAula, clickButton} from '../store/actions/index'
import { bindActionCreators } from 'redux';

import axios from 'axios'

import {FaPlayCircle} from 'react-icons/fa'

// ITEMS ICONS
import imgAvisos from '../assets/images/for-courses.png'

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

  class Class extends React.Component{
    
    constructor(props){
      super(props)
      this.state = {
        classId: '566',
        tipo: 'aviso',
        aulas: [],
        carregar: 'Carregar Avisos',
        btnLoad: "visitanteBtn",
        idCourse: this.props.idCourse,
        idAula: '',
        tipoItem: this.props.tipoAula,
        
      }
    }

    loadAvisos = async () => {
      // Lista de itens
      await axios.get(`/class.json`)
              .catch(err => console.log(err))
              .then(res => {
                  const aulaAll = res.data
                  let aulas = []
                  for(let key in aulaAll){
                      aulas.push({
                          ...aulaAll[key],
                          id: key
                      })
                  }
                  console.log('aula: ' + this.props.idAula)
                  console.log('curso: ' +this.props.idCourse)

                  // consultas
                  aulas = aulas.filter(aula => {
                      return (
                        aula.idCourse === this.props.idCurso
                      )
                  })

                  
                  // aulas = aulas.filter(aula => aula.idCourse === this.props.id)

                  this.setState({aulas: aulas})
                  
                  
              })
    }

    componentDidMount() {
      const loadPage  = () => this.loadAvisos()
      loadPage()
    }
  
  render(){

    // Avisos
    const aulas = this.state.aulas
  
    const listAvisos = aulas.map((aula) => 
        {
        return <li className="class" key={aula.id}
          onClick={() => {
            this.setState({ idAula: `${aula.id}`, tipoAula: `${this.state.tipoItem}`, idCurso: `${aula.idCourse}` }, () => {
              (this.props.openAula(this.state))
              (window.location.href = "/player");
            });
          } }
        >
          <img src={aula.imageUrl}/>
          <FaPlayCircle className="iconPlay" /> 
          <p className='titleCard'> {aula.title}</p>
          <p className='courseCard'>{this.state.titleCourse}</p>
        </li>;
      }
    )
  
    return (
    <div>
        <section className="class-section">
            <ul  className="class-list">
              {listAvisos}
            </ul>
        </section>
      </div>
    );
  }
}


const mapStateToProps = store => {
  return{
    idAula: store.course.idAula,
    idCurso: store.course.idCurso,
    idCourse: store.course.id,
    tipoAula: store.course.tipoAula,
  }
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({openAula, clickButton}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Class);