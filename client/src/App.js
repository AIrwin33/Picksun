import React, {Fragment, useEffect, useState} from "react";
import {Row, Col, Image} from "react-bootstrap";
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import {Provider} from "react-redux";
import {createStore} from "redux";
import {SocketContext, socket} from './socket';
import Auth0Provider from "./auth0-provide";
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Lobby from './components/Lobby';
import Profile from './components/Profile';
import Contests from './components/Contests';
import Contest from './components/Contest';
import Questions from './components/Questions';
import TopPanel from './components/TopPanel';
import Landing from './components/Landing';
import backtotop from './assets/backtotop.png';
import { useAuth0 } from "@auth0/auth0-react";

function App() {

    const [email,setemail]=useState("")
    const [name,setname]=useState("")
    const [userId,setuserId]=useState("")
    const [isProfile, setIsProfile] = useState(false);
    const { loginWithRedirect,isAuthenticated,user,getAccessTokenSilently } = useAuth0();
    //check if the user is authenticated
    // const checkAuthenticated = async () => {
    //     try {
    //         const header = {
    //             Accept: 'application/json',
    //             'Content-type': 'application/json',
    //             'jwt_token': localStorage.token,
    //         }
    //         const res = await fetch("/auth/verify", {
    //             method: "POST",
    //             headers: header
    //         });

    //         const parseRes = await res.json();
    //         parseRes === true ? setIsAuthenticated(true) : setIsAuthenticated(false);
    //     } catch (err) {
    //         console.error(err.message);
    //     }
    // };

    const handleBackToTop = async () => {
        // snap the view back to the top of the page
        window.scrollTo({
            top: 0,
            behavior: "smooth"
          });
    }

    // useEffect(() => {
    //     checkAuthenticated();
    // }, []);

    // const [isAuthenticated, setIsAuthenticated] = useState(true);
useEffect(async()=>{
    if(isAuthenticated)
    {
        // alert('Apps')
        // alert(isAuthenticated)        
        // alert(JSON.stringify(user))
        setname(user.nickname)
        setemail(user.email)
        const res = await fetch("/auth/signup", {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${getAccessTokenSilently()}`,
                          },
                        body: {
                            email: user.email,
                            name: user.nickname ,
                          }
                    });
        const parseRes = await res.json();
    }

},[])
   
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
        // setIsAuthenticated(boolean);
    };

    return (
        <Provider store={store}>
            <SocketContext.Provider value={socket}>
                <Fragment>
                    <Router>
                        <Auth0Provider>
                            <div>

                            <div id="top">
                                <TopPanel profile={isProfile} name={name}/>
                            </div>

                            <Switch>
                                {/* <Route path="/Login"
                                       render={props => {loginWithRedirect();}
                                        //    <Login {...props} setAuth={setAuth}/>
                                       }
                                /> */}
                                {/* <Route path="/Register"
                                       render={props =>loginWithRedirect();
                                        //    <Register {...props} setAuth={setAuth}/>
                                       }
                                /> */}
                                <Route path="/Lobby"
                                       render={props =>  <Lobby {...props} userId={userId} />
                                        //    isAuthenticated ? (
                                        //        <Lobby {...props}  />
                                        //    ) : (
                                        //        <Redirect to="/Login"/>
                                        //    )
                                       }
                                />
                                <Route path="/Contests" render={props =>    <Contests {...props} userId={userId} />
                                        //    isAuthenticated ? (
                                        //        <Contests {...props}  />
                                        //    ) : (
                                        //        <Redirect to="/Login"/>
                                        //    )
                                       }
                                />
                                <Route path="/Profile"
                                       render={props =>   <Profile {...props} setProfile={setProfile} setAuth={setAuth} userId={userId}/>
                                        
                                        //    isAuthenticated ? (
                                        //        <Profile {...props} setProfile={setProfile} setAuth={setAuth}/>
                                        //    ) : (
                                        //        <Redirect to="/Login"/>
                                        //    )
                                       }
                                />
                                <Route path="/Contest/:id"
                                       render={props => <Contest {...props} setAuth={setAuth} userId={userId}/>
                                        //    isAuthenticated ? (
                                        //        <Contest
                                        //            {...props}
                                        //            setAuth={setAuth}/>
                                        //    ) : (
                                        //        <Redirect to="/Login"/>
                                        //    )
                                       }
                                />
                                <Route path="/Questions/:contestid"
                                       render={props => <Questions  {...props} userId={userId}/>
                                        //    isAuthenticated ? (
                                        //        <Questions
                                        //            {...props}
                                        //        />
                                        //    ) : (
                                        //        <Redirect to="/Login"/>
                                        //    )
                                             
                                           
                                       }
                                />
                                <Route path="/" render={props => ( <Landing {...props} userId={userId}/>  )     }
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
                                        <Image  className="float-right mt-2 mr-2" src={backtotop} onClick={handleBackToTop}></Image>
                                    </Col>
                                </Row>
                            </div>

                        </div>
                        </Auth0Provider>
                    </Router>
                </Fragment>
            </SocketContext.Provider>

        </Provider>
    );
}

export default App;
