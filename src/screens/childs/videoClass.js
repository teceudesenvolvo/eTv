import React, { Component } from 'react';
import ReactPlayer from 'react-player'

import axios from 'axios'

import {connect} from 'react-redux'
import firebase from 'firebase'

// Componetes
import ClassPlayer from '../../components/classPlayer'
import MainMenu from '../../components/mainMenu'



import '../../App.css'



function onClickHandler(){
    // const data = new FormData() 
    // data.append('file', this.state.selectedFile)
    console.log('Botão funciona')
    console.log(this.state.id)
}

function goFilter(){
    window.location.href = "/listItems"
  }

class Gestao extends Component{
  constructor(props){
    super(props)
    this.state = {
      idAula: this.props.idAula,
      idCouse: this.props.idCourse,
      tipo: this.props.tipoItem,
      userType: this.props.tipo,
      title: '',
      description: '',
      data: '',
      teacher: 'Professor',
      uriVideo: ``,
    }
  }


  loadAula = async () => {  
      console.log(this.props.idAula)
      console.log(this.props.tipoAula) 
      await axios.get(`class/${this.props.idAula}.json`)
      // await axios.get(`https://graph.facebook.com/facebook/picture?redirect=false`)
              .catch(err => console.log(err))
              .then(res => {
                this.setState({
                  title: res.data.title,
                  description: res.data.description,
                  uriVideo: res.data.url,
                  idCouse: res.data.idCourse,
                })
              })
  }

  componentDidMount() {
    // this.providerGoogle = new firebase.auth.GoogleAuthProvider();
    // if (this.props.userId === '') {
    //   window.location.href = "/login"
    // }
    const loadPage  = () => this.loadAula()
    loadPage()
  }

  
  
  render() {
    return (
      <div className="App">
        <MainMenu/>
        <div className='box-video-aula'>
          <div className='video-play'>
            <ReactPlayer width='100%' height='480px' url={this.state.uriVideo} controls='true'/> 
            <div className='desc-video'>
              <h1>{this.state.title}</h1>
              <p>{this.state.description}</p>    
            </div>
          </div>
          <div className='players-video'>
            <ClassPlayer />
          </div>
        </div>
        
    </div>
    )
  }
}

const mapStateToProps = store => {
  return{
    id: store.course.id,
    idAula: store.course.idAula,
    idCourse: store.course.idCurso,
    tipoAula: store.course.tipoAula,
    tipoItem: store.course.tipo,
    userId: store.user.userId,
  }
};

export default connect(mapStateToProps)(Gestao)