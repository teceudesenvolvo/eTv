import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import '../App.css'

import logo from '../assets/images/logo12.png'

import {connect} from 'react-redux'
import {clickButton, LoggedIn} from '../store/actions/index'
import { bindActionCreators } from 'redux';

import axios from 'axios'

//Imagens
import bgSite from '../assets/images/curso-bg-1.png'
// import logoCursoDestaque from '../assets/images/logo-curso-andré-1.png'

// Icones

// Components
import MainMenu from '../components/mainMenu'
import Course from '../components/courses'
import Eclass from '../components/eclass'
import Lancamentos from '../components/launch'
import Elas from '../components/elas'
import Talk from '../components/talk'


  //mudança de páginas
  function inicio(){
    window.location.href = "/inicio"
  }
  
  class Home extends Component{
    constructor(props){
      super(props)
      this.state = {
        userType: this.props.tipo,
        ouvidoria: '',
        botao:'Enviar',
        title: '',
        description: '',
        teacher: '',
        logoUrl: '',
        idCourseDestaque: '',
        cousesAll: '',
      }
    }

    loadAllCourse = async () => {
      await axios.get(`courseFeacture.json`)
        .catch(err => console.log(err))
        .then(res => {
          this.setState({
            cousesAll: res.data
          })
          console.log(this.state.cousesAll)

          this.loadCouseFeactures()
        })
    }


    loadCouseFeactures = async () => {
      await axios.get(`courses/${this.state.cousesAll}.json`)
              .catch(err => console.log(err))
              .then(res => {
                this.setState({
                  title: res.data.title,
                  subtitle: res.data.subtitle,
                  description: res.data.description,
                  teacher: res.data.teacher,
                  logoUrl: res.data.logoUrl,
                  imgUrl: res.data.bgUrl,
                })
              })
    }
  
    componentDidMount() {
      const loadPage = () => {
        this.loadAllCourse()
      }

      loadPage()
    }

  
  render(){  

   const userType = () => {
      if(this.props.tipo === 'sindico'){
        window.location.href = "/homeManager"
      }else if(this.props.tipo === ''){
        window.location.href = "/"
      }else{

      }
    }
    
    return (

      <div className="App" onClick={
        userType()
      }>
        <MainMenu/>
        
        <div className="backgroundHero">
          <p><img className="backgroundHero" src={this.state.imgUrl}/></p>
          <div className="curso-destaque">
            {/* <p><img className="logo-curso-destaque" src={this.state.logoUrl}/></p> */}
            <h1 className="title-curso-destaque">{this.state.title}</h1>
            <p className="desc-curso-destaque">{this.state.subtitle}</p>
            <p><input type="button" value="Começar" className="btn-curso-destaque" 
              onClick={
                () => {this.setState({id: this.state.cousesAll}, () => {
                  (this.props.clickButton(this.state))
                  (window.location.href = "/item")
                })}}
                /></p>
          </div>
        </div>
        
        

        <Eclass/>

        <Lancamentos/>

        {/* <Talk /> */}

        {/* <Elas /> */}

        <Course />

        {/* <Lives /> */}

      </div>
    );
  }
}

const mapStateToProps = store => {
  return{
    // id: store.lembretes.id,
    // tipo: store.user.tipo,
    // nome: store.user.name,
    // condominio: store.user.condominio,
  }
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({clickButton, LoggedIn}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);