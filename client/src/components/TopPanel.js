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



const TopPanel = ({setAuth}) => {

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


    useEffect(() => {
        getProfile();
    }, []);
        
    
    return (
            
        <Navbar  className="TopPanelCont" expand="md">
            <Navbar.Brand   className="nav-logo">
                <img src={headerIcon} height="50"></img>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" className="custom-toggler"/>
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="ml-auto">
                <Nav.Link className="lightBlueText" href="/Lobby">Lobby</Nav.Link>
                <Nav.Link className="lightBlueText" href="/Contests">My Contests</Nav.Link>
                {isAuthenticated && 
                    <Nav.Link href="/Profile" className="lightBlueText">{name}</Nav.Link>
                }
                {!isAuthenticated && 
                    <Nav.Link href="/Login">Login</Nav.Link>
                }  
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    )
}

export default TopPanel;