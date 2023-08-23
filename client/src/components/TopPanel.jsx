import React, { useEffect, useState } from 'react'
import { Navbar } from 'react-bootstrap'

import './TopPanel.css'

import headerIcon from '../assets/pickfun.png'

const TopPanel = props => {
  const [name, setName] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const getProfile = async () => {
    try {
      const res = await fetch('/myprofile', {
        method: 'POST',
        headers: { jwt_token: localStorage.token }
      })

      const parseData = await res.json();
      console.log(parseData.name);
      setIsAuthenticated(true)
      setName(parseData.name)
    } catch (err) {
      console.error(err.message)
    }
  }

  useEffect(() => {
    getProfile()
    // if(props.profile){
    //   $('.TopPanelCont').addClass('profile');
    //   $('.menu-toggler__line').addClass('white');
    // }
  }, [props])

  return (
    <Navbar className='TopPanelCont' expand='md'>
      <input type='checkbox' id='menuToggler' className='input-toggler' />
      <label htmlFor='menuToggler' className='menu-toggler ml-3'>
        <span className='menu-toggler__line'></span>
        <span className='menu-toggler__line'></span>
        <span className='menu-toggler__line'></span>
      </label>
      <aside className='sidebar '>
        <ul className='menu aptifer ml-5'>
          <li className='menu__item'>
            <a className='menu__link' href='/'>
              Home
            </a>
          </li>
          <li className='menu__item'>
            <a className='menu__link' href='/Lobby'>
              Lobby
            </a>
          </li>
          <li className='menu__item'>
            <a className='menu__link' href='/Contests'>
              My Contests
            </a>
          </li>
          <li className='menu__item'>
            <a className='menu__link' href='/Profile'>
              Profile
            </a>
          </li>
          <li className='menu__item'>
            <a className='menu__link' href='https://pick.fun/rules'>
              Rules
            </a>
          </li>
        </ul>
      </aside>
      <Navbar.Brand className='nav-logo ml-auto'>
        <img src={headerIcon} height='50'></img>
      </Navbar.Brand>
    </Navbar>
  )
}

export default TopPanel
