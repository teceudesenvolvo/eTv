import React from 'react';
import '../App.css'

import {Switch, Route} from 'react-router-dom'

// Firebase
// import firebaseConfig from './firebaseConfig'

//Logomarca

//Início
import Inicio from '../screens/Inicio'

//Screen Home
import Home from '../screens/Home'

// Screen Childs
import item from './childs/item'
import videoClass from './childs/videoClass'
import ForgotPass from './childs/ForgotPass'

// Filter
import ListItem from './childs/listItems'

// Manager
import Dashboard from './manager/dashboard'
import Login from './Login';
import SingUp from './SingUp';
import ModifyDados from './ModifyDados';
import admin from './admin/admin';

// Pagamentos
import Payment from './Payment';
import RecoverPay from './RecoverPay'
import CancelPlan from './childs/CancelPlan'

import moment from 'moment'

function App() {
  return (
    <div className="App">
        <Switch>
          {/* Tela de Início */}
          <Route exact path="/" component={Inicio}/>
          <Route path="/home" component={Home}/>
          <Route exact path="/login" component={Login}/>
          <Route exact path="/cadastro" component={SingUp}/>

          {/* Pagamento */}
          <Route exact path="/pagamento" component={Payment}/>
          <Route exact path="/alterarpagamento" component={RecoverPay}/>
          <Route exact path="/cancelarassinatura" component={CancelPlan}/>
          
          {/* Telas Childs */}
          <Route path="/buscar" component={ListItem}/>
          <Route path="/esqueci-a-senha" component={ForgotPass}/>


          {/* Telas Manager */}
          <Route path="/dashboard" component={Dashboard}/>
          <Route exact path="/alterardados" component={ModifyDados}/>


          {/* Telas Grandson */}
          <Route path="/item" component={item}/>
          <Route path="/player" component={videoClass}/>



          {/* Telas Admin */}
          <Route path="/adminMeuhallRoot" component={admin}/>


        </Switch>
      
      <footer className="footer">
        <div className="footer-logo">
          {/* <img src={Logo} className="logoFooter"/> */}
          <p> <a href="https://eudesenvolvo.com/govtech" >e | Videos</a> &copy; 2020 - {moment().format('YYYY')} </p>
        </div>
      </footer>
    </div>
    
  );
}

export default App;
