import React from 'react';
import logo from '../assets/images/logo.png'
import '../App.css'

// import {FontAwesomeIcon} from 'react'

//Icones
import imgProfile from '../assets/images/cliente.jpg'


  //mudança de páginas
  function logout(){
    window.location.href = "/inicio"
  }
  function materialPage(){
    window.location.href = "/filterSeries"
  }
  function forumPage(){
    window.location.href = "/forum"
  }
  function notesPage (){
    window.location.href = "/notas"
  }
  function atividadePage(){
    alert('Este recurso ainda não está disponível')
    // window.location.href = "/atividades"
  }

  
function Home() {


    return (
      <div className="App">
       
      </div>
    );
  }
  
  export default Home;