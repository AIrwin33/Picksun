import { Fragment, useEffect, useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes
} from 'react-router-dom'
import { SocketContext, socket } from './socket'

import './App.css'
import Login from './components/Login.jsx'
import Register from './components/Register.jsx'
import Reset from './components/Reset.jsx'
import Lobby from './components/Lobby.jsx'
import Profile from './components/Profile.jsx'
import Contests from './components/Contests.jsx'
import Contest from './components/Contest.jsx'
import Questions from './components/Questions.jsx'
import TopPanel from './components/TopPanel.jsx'
import Landing from './components/Landing.jsx'

function App () {
  const [isProfile, setIsProfile] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  //check if the user is authenticated
  const checkAuthenticated = async () => {
    try {
      const header = {
        Accept: 'application/json',
        'Content-type': 'application/json',
        jwt_token: localStorage.token
      }
      const res = await fetch('/auth/verify', {
        method: 'POST',
        headers: header
      })

      const parseRes = await res.json();
      console.log(parseRes);
      parseRes === true ? setAuth(true) : setAuth(false)
    } catch (err) {
      console.error(err.message)
    }
  }

  useEffect(() => {
    console.log(isAuthenticated);
    checkAuthenticated()

  }, [])

  const setProfile = boolean => {
    //set if the page is the profile or not for CSS changes
    setIsProfile(boolean)
  }

  const setAuth = boolean => {
    setIsAuthenticated(boolean)
  }

  return (
    <SocketContext.Provider value={socket}>
      <Fragment>
        <Router>
          <div>
            <div id='top'>
              <TopPanel profile={isProfile} />
            </div>

            <Routes>
              <Route
              path='/Login'
              element={<Login setAuth={setAuth} />}
              />
              <Route
                path='/Register'
                element={<Register setAuth={setAuth} />}
              />
              <Route
                path='/Resetpassword'
                element={<Reset />}
              />
              <Route
                path='/Lobby'
                  render={props =>
                    isAuthenticated ? (
                        <Lobby {...props}  />
                    ) : (
                        <Login/>
                    )
                }
              />
              <Route
                path='/Contests'
                element={props =>
                  isAuthenticated ? (
                    <Contests {...props} />
                  ) : (
                    <Navigate to='/Login' />
                  )
                }
              />
              <Route
                path='/Profile'
                element={props =>
                  isAuthenticated ? (
                    <Profile
                      {...props}
                      setProfile={setProfile}
                      setAuth={setAuth}
                    />
                  ) : (
                    <Navigate to='/Login' />
                  )
                }
              />
              <Route
                path='/Contest/:id'
                element={props =>
                  isAuthenticated ? (
                    <Contest {...props} setAuth={setAuth} />
                  ) : (
                    <Navigate to='/Login' />
                  )
                }
              />
              <Route
                path='/Questions/:contestid'
                element={props =>
                  isAuthenticated ? (
                    <Questions {...props} />
                  ) : (
                    <Navigate to='/Login' />
                  )
                }
              />
              <Route path='/' element={<Landing />} />
            </Routes>

            <div className='footer'>
              <Row className='justify-content-md-center'>
                <Col md='4'></Col>
                <Col md='4 text-center'>
                  <p className='proxima whiteText mt-2'>
                    © 2022 PickFun. All rights reserved. 
                  </p>
                </Col>
                <Col md='4'></Col>
              </Row>
            </div>
          </div>
        </Router>
      </Fragment>
    </SocketContext.Provider>
  )
}

export default App
