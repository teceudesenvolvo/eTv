import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import '../App.css'

import {connect} from 'react-redux'
import {clickButton, LoggedOut} from '../store/actions/index'
import { bindActionCreators } from 'redux';

import axios from 'axios'

import bgSite from '../assets/images/bg102.jpg'

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

  class Lançamento extends React.Component{
    
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

    loadAllCourse = async () => {
      await axios.get(`courseFeacture2.json`)
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
      // await axios.get(`courses/-MTks9hBiO1B4EkO14vt.json`)
      await axios.get(`/courses/${this.state.cousesAll}.json`)
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

      // loadPage()
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
              <img src={aviso.imageUrl}/>
              <p className='titleCard'> {aviso.title} </p>
              {/* <p className='txtCard'> {aviso.description} </p> */}
      </li>
    )
  
    return (
    <div>
      <section>
          <div className="backgroundLaunch">
            <p><img className="backgroundLaunch imgFilter" src={this.state.imgUrl}/></p>
            <div className="curso-lancamento">
              <h1 className="title-curso-lancamento">{this.state.title}</h1>
              <p className="desc-curso-lancamento">{this.state.description}</p>
              <p>
                  <input type="button" value="Assista Agora" className="btn-curso-lancamento" 
                  onClick={
                    () => {this.setState({id: this.state.cousesAll}, () => {
                      (this.props.clickButton(this.state))
                      (window.location.href = "/item")
                    })}}
                    />
                    {/* <input type="button" value="Saber Mais" className="btn-curso-lancamento2" 
                  onClick={
                    () => {this.setState({id: this.state.idCourseDestaque}, () => {
                      (this.props.clickButton(this.state))
                      (window.location.href = "/item")
                    })}}
                    /> */}
                </p>
            </div>
          </div>
        </section>
      </div>
    );
  }
}


const mapDispatchToProps = dispatch => {
  return bindActionCreators({clickButton, LoggedOut}, dispatch);
}

export default connect(null, mapDispatchToProps)(Lançamento);