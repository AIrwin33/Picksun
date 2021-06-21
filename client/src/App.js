import React , {Fragment, useState, useEffect} from "react";
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Lobby from './components/Lobby';
import Profile from './components/Profile';
import Contests from './components/Contests';
import Contest from './components/Contest';
import Questions from './components/Questions';
import TopPanel from './components/TopPanel';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";



import { Provider } from "react-redux";
import {createStore} from "redux";





function App() {

  const checkAuthenticated = async () => {
    try {
      const header ={
        Accept: 'application/json',
         'Content-type': 'application/json',
         'jwt_token':localStorage.token,
      }
      const res = await fetch("/auth/verify", {
        method: "POST",
        headers: header
      });

      const parseRes = await res.json();
      console.log('check auth' + parseRes);
      parseRes === true ? setIsAuthenticated(true) : setIsAuthenticated(false);
    } catch (err) {
      console.error(err.message);
    }
  };

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


    <Fragment>

      <Router>
        <div className="container">

          <div >
           <TopPanel/>
         </div>

          <Switch>
            <Route path="/Login"
              render={props =>
                  <Login {...props} setAuth={setAuth} />
              }
            />
            <Route path="/Register"
              render={props =>
                  <Register {...props} setAuth={setAuth} />
              }
            />
            <Route path="/Lobby"
              render={props =>
                isAuthenticated ? (
                  <Lobby {...props}  />
                ) : (
                  <Redirect to="/Login" />
                )
              }
            />
            <Route path="/Contests"
              render={props =>
                isAuthenticated ? (
                  <Contests {...props}  />
                ) : (
                  <Redirect to="/Login" />
                )
              }
            />
            <Route  path="/Profile"
              render={props =>
                isAuthenticated ? (
                  <Profile {...props} setAuth={setAuth} />
                ) : (
                  <Redirect to="/Login" />
                )
              }
            />
            <Route  path="/Contest/:id"
              render={props =>
                isAuthenticated ? (
                  <Contest
                  {...props}
                  setAuth={setAuth} />
                ) : (
                  <Redirect to="/Login" />
                )
              }
            />
             <Route  path="/Questions/:contestid"
              render={props =>
                isAuthenticated ? (
                  <Questions
                  {...props}
                  />
                ) : (
                  <Redirect to="/Login" />
                )
              }
            />
          </Switch>

        </div>
      </Router>
    </Fragment>
    </Provider>
  );
}

export default App;
