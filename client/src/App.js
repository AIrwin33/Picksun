import React, {Fragment, useEffect, useState} from "react";
import {Row, Col, Image} from "react-bootstrap";
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import {Provider} from "react-redux";
import {createStore} from "redux";
import {SocketContext, socket} from './socket';

import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Reset from './components/Reset';
import Lobby from './components/Lobby';
import Profile from './components/Profile';
import Contests from './components/Contests';
import Contest from './components/Contest';
import Questions from './components/Questions';
import TopPanel from './components/TopPanel';
import Landing from './components/Landing';
import backtotop from './assets/backtotop.png';


function App() {

    const [isProfile, setIsProfile] = useState(false);

    //check if the user is authenticated
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
        // snap the view back to the top of the page
        window.scrollTo({
            top: 0,
            behavior: "smooth"
          });
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

    const setProfile = boolean => {
        //set if the page is the profile or not for CSS changes
        setIsProfile(boolean);
    }

    const setAuth = boolean => {
        setIsAuthenticated(boolean);
    };

    return (
        <Provider store={store}>
            <SocketContext.Provider value={socket}>
                <Fragment>
                    <Router>
                        <div>

                            <div id="top">
                                <TopPanel profile={isProfile}/>
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
                                <Route path="/Reset"
                                       render={props =>
                                           <Reset {...props}/>
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
                                               <Profile {...props} setProfile={setProfile} setAuth={setAuth}/>
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
                                <Route path="/"
                                    render={props =>
                                        (
                                        <Landing {...props}/>
                                        )
                                    }
                                />
                            </Switch>

                            <div className="footer">
                                <Row className="justify-content-md-center">
                                    <Col md="4">
                                    </Col>
                                    <Col md="4 text-center">
                                            <p className="proxima whiteText mt-2">© 2021 PickFun. All rights reserved. Lorem ipsum dolor
        sit amet, consectetur adipiscing elit. </p>
                                    </Col>
                                    <Col md="4">
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
