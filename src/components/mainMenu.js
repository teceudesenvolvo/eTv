import React from 'react';
import '../App.css'

import { connect } from 'react-redux'
import { LoggedOut } from '../store/actions/index'
import { bindActionCreators } from 'redux';

import firebase from 'firebase'

import {FaSearch, FaBell, FaUserCircle, FaAngleDown} from 'react-icons/fa'


// ITEMS MENU
import logo from '../assets/images/logo-pacatuba.png'
// import logo from '../assets/images/EUDESENVOLVO-10.png'
// import profile from '../assets/images/profile.png'

function goInicio() {
  window.location.href = "/"
}

function goSingup() {
  window.location.href = "/cadastro"
}








class MainMenu extends React.Component {

  componentDidMount() {
    if(this.props.userId){
      this.setState({
        profileOptions: 'Profile',
        profileOptions2: 'Sair'
      })
    }
  }

  


  constructor(props){
    super(props)
    this.state = {
      profileOptions: 'Login',
      profileOptions2: 'Cadastre-se'
    }
  }

  logOut = () => {
    this.props.LoggedOut(this.state)
    window.location.href = "/login"
  }

  goLogin = () => {
    firebase.auth().signOut().then(() => {
      this.props.LoggedOut(this.state)
      window.location.href = "/login"
    })
  }

   goProfile = () => {
    if(this.props.userId){
      window.location.href = "/dashboard"
    }else{
      window.location.href = "/login"
    }
    
  }
  


  render() {
    // menu-menu
    return (
      <nav className="main-menu">

        <img className="logo-menu" src={logo} onClick={goInicio} alt='logomarca' />

        <div className="menu-items">
          {/* <a className="itemsMenu" onClick={goInicio}>Podcast</a>
          <a className="itemsMenu">Talk Show</a>
          <a className="itemsMenu">Class</a> */}
        </div>

        <div>
          <div className="left-menu">
            <FaSearch className="search-icon"/>
            <a href="/buscar" className="left-menu-item">Buscar</a>
            <FaBell className="notification"/>
          </div>
          <div className="profile-items" >
            {/* <img className="profile-icon" onClick={goProfile} src={profile} /> */}
            <FaUserCircle className="profile-icon" onClick={this.goProfile} />
            {/* <FaAngleDown/> */}
            <div className="dropMenu">
              <ul className="dropMenu-items">
                {/* <li className="dropMenu-btn-li dropMenu-btn-li1" ><a className="dropMenu-btn" href='/#' onClick={
                    () => {
                      if(this.props.userId){
                        this.goProfile()
                      }else{
                        this.logOut()
                      }
                    }
                  }>{this.state.profileOptions}</a></li> */}
                {/* <li className="dropMenu-btn-li dropMenu-btn-li2"><a className="dropMenu-btn" href='/#' onClick={
                    () => {
                      if(this.props.userId){
                        this.logOut()
                      }else{
                        goSingup()
                      }
                    }
                  }>{this.state.profileOptions2}</a></li> */}
              </ul>
            </div>
          </div>
        </div>

      </nav>
    );
  }
}

const mapStateToProps = store => {
  return{
    email: store.user.email,
    userId: store.user.userId,
  }
};
const mapDispatchToProps = dispatch => {
  return bindActionCreators({ LoggedOut }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(MainMenu)