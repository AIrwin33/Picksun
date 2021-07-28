import React, {Fragment, useEffect, useState} from "react";
import {Col, Container, Image, Row, Tab, Tabs,} from "react-bootstrap";
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Lobby from './components/Lobby';
import Profile from './components/Profile';
import Contests from './components/Contests';
import Contest from './components/Contest';
import Questions from './components/Questions';
import TopPanel from './components/TopPanel';
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";

import backtotop from './assets/backtotop.png';
import whitePickfun from './assets/pickfun.png';
import {Provider} from "react-redux";
import {createStore} from "redux";
import {SocketContext, socket} from './socket';


function App() {

    const checkAuthenticated = async () => {
        try {
            const header = {
                Accept: 'application/json',
                'Content-type': 'application/json',
                'jwt_token': localStorage.token,
            }
            const res = await fetch("/auth/verify", {
                method: "POST",
                headers: header
            });

            const parseRes = await res.json();
            parseRes === true ? setIsAuthenticated(true) : setIsAuthenticated(false);
        } catch (err) {
            console.error(err.message);
        }
    };

    const handleBackToTop = async () => {
        console.log('back to top');
    }

    useEffect(() => {
        checkAuthenticated();
    }, []);

    const [isAuthenticated, setIsAuthenticated] = useState(true);

    const Initval = {
        questions: []
    }

    function reducer(state = Initval, action) {
        console.log(action);
        return state;
    }

    const store = createStore(reducer);
    store.dispatch({type: "INCREMENT!"});

    const setAuth = boolean => {
        setIsAuthenticated(boolean);
    };

    return (
        <Provider store={store}>
            <SocketContext.Provider value={socket}>
                <Fragment>
                    <Router>
                        <div className="container">

                            <div id="top">
                                <TopPanel/>
                            </div>

                            <Switch>
                                <Route path="/Login"
                                       render={props =>
                                           <Login {...props} setAuth={setAuth}/>
                                       }
                                />
                                <Route path="/Register"
                                       render={props =>
                                           <Register {...props} setAuth={setAuth}/>
                                       }
                                />
                                <Route path="/Lobby"
                                       render={props =>
                                           isAuthenticated ? (
                                               <Lobby {...props}  />
                                           ) : (
                                               <Redirect to="/Login"/>
                                           )
                                       }
                                />
                                <Route path="/Contests"
                                       render={props =>
                                           isAuthenticated ? (
                                               <Contests {...props}  />
                                           ) : (
                                               <Redirect to="/Login"/>
                                           )
                                       }
                                />
                                <Route path="/Profile"
                                       render={props =>
                                           isAuthenticated ? (
                                               <Profile {...props} setAuth={setAuth}/>
                                           ) : (
                                               <Redirect to="/Login"/>
                                           )
                                       }
                                />
                                <Route path="/Contest/:id"
                                       render={props =>
                                           isAuthenticated ? (
                                               <Contest
                                                   {...props}
                                                   setAuth={setAuth}/>
                                           ) : (
                                               <Redirect to="/Login"/>
                                           )
                                       }
                                />
                                <Route path="/Questions/:contestid"
                                       render={props =>
                                           isAuthenticated ? (
                                               <Questions
                                                   {...props}
                                               />
                                           ) : (
                                               <Redirect to="/Login"/>
                                           )
                                       }
                                />
                            </Switch>

                            <div className="footer">
                                <Image  className="float-right mt-3 mr-3" src={backtotop} onClick={handleBackToTop}></Image>
                                <Row>
                                    <Col lg="4">
                                    </Col>
                                    <Col md="auto">
                                        <div>
                                            
                                            <Image src={whitePickfun}></Image>
                                            <p className="proxima whiteText center-text">© 2021 PickFun. All rights reserved. Lorem ipsum dolor
        sit amet, consectetur adipiscing elit. </p>
                                        </div>
                                    </Col>
                                    <Col lg="4">
                                    </Col>
                                </Row>
                            </div>

                        </div>
                    </Router>
                </Fragment>
            </SocketContext.Provider>

        </Provider>
    );
}

export default App;
