import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';



import { Provider } from "react-redux";
import store from "./redux/store";

const Initval = {
  questions: []
}

function reducer(state = Initval, action) {
  console.log(action);
  return state;
}

const store = createStore(reducer);
store.dispatch({type: "INCREMENT!"})

const App = () => (  
  <Provider store={store}>
  </Provider>
);


ReactDOM.render(
    <App />,
  document.getElementById('root')
);



