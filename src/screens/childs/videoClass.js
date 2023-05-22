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
      avisos: '',
      videos: ''
    }
  }


  loadAula = async () => {  
            axios.get(``)
              .catch(err => console.log(err))
              .then(res => {
                const videoAll = res.data.items

                const videos = videoAll.filter(content => content.id.videoId.includes(this.props.idAula)) 
                console.log(videos)
                this.setState({
                  videos: videos,
                  title: videos[0].snippet.title,
                  description: videos[0].snippet.description,

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
            <ReactPlayer scrolling="no" frameborder="0" onload="iFrameResize()" 
            url={`www.youtube.com/watch?v=${this.props.idAula}`} controls='true'/> 
            <div className='desc-video' >
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