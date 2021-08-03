import React, {Component, useEffect, useState} from 'react';
import {
    Container,
    Navbar,
    Nav,
    Image,
    NavDropdown,
    ResponsiveEmbed
} from "react-bootstrap";
import { LinkContainer } from 'react-router-bootstrap'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";


import "./TopPanel.css";

import headerIcon from "../assets/pickfun.png";
import Login from './Login';
import $ from 'jquery';


const TopPanel = (props) => {

    const [name, setName] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
  
    const getProfile = async () => {
      try {
        const res = await fetch("/profile", {
          method: "POST",
          headers: { jwt_token: localStorage.token }
        });
  
        const parseData = await res.json();
        setIsAuthenticated(true);
        setName(parseData.name);
      } catch (err) {
        console.error(err.message);
      }
    };

    const handleToggle = async () => {
      $('.sidebar').toggleClass('hidden');
    }



    useEffect(() => {
        getProfile();
        console.log(props.profile);
        if(props.profile){
          $('.TopPanelCont').addClass('profile');
        }

    }, [props]);
        
    
    return (
            
        <Navbar  className="TopPanelCont" expand="md">
            

            <input type="checkbox" id="menuToggler" className="input-toggler" onClick={handleToggle}/>
            <label for="menuToggler" className="menu-toggler ml-3">
              <span className="menu-toggler__line"></span>
              <span className="menu-toggler__line"></span>
              <span className="menu-toggler__line"></span>
            </label>
            <aside className="sidebar hidden">
              <ul className="menu aptifer ml-3">
                
                <li className="menu__item"><a className="menu__link" href="/">Home</a></li>
                <li className="menu__item"><a className="menu__link" href="/Lobby">Lobby</a></li>
                <li className="menu__item"><a className="menu__link" href="/Contests">My Contests</a></li>
                <li className="menu__item"><a className="menu__link" href="/Profile">Profile</a></li>
                <li className="menu__item"><a className="menu__link" href="https://pick.fun">Rules</a></li>
              </ul>
            </aside>
            <Navbar.Brand   className="nav-logo ml-auto">
                <img src={headerIcon} height="50"></img>
            </Navbar.Brand>
            {/* <Navbar.Toggle aria-controls="responsive-navbar-nav" className="custom-toggler"/>
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="ml-auto">
                <Nav.Link className="lightBlueText aptifer" href="/Lobby">Lobby</Nav.Link>
                <Nav.Link className="lightBlueText aptifer" href="/Contests">My Contests</Nav.Link>
                {isAuthenticated && 
                    <Nav.Link href="/Profile" className="lightBlueText aptifer">{name}</Nav.Link>
                }
                {!isAuthenticated && 
                    <Nav.Link className="aptifer lightBlueText" href="/Login">Login</Nav.Link>
                }  
                </Nav>
            </Navbar.Collapse> */}
        </Navbar>
    )
}

export default TopPanel;