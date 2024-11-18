import React, { Component, useEffect, useState } from 'react'
import { Container, Row, Col, Image } from 'react-bootstrap'

import { Link } from 'react-router-dom'

import './Landing.css'

import justLogo from '../assets/logoOnly.png'

const Landing = props => {
  return (
    <>
      {/* Main Body */}
      <Container className='landingBody'>
        <Row className='justify-content-md-center pt-3 pb-3'>
          <Col md={2} sm={1} lg={2}></Col>
          <Col md={8} sm={10} lg={8}>
            <Image src={justLogo}></Image>
            <h5 className='whiteText aptifer'> How to Pickfun</h5>
            <span className='whiteText aptifer fontBold text-center'>Pick</span>
            <br />
            <div className='justify-content-start'>
              <span className='whiteText proxima'>
                - Pick answers to questions about what will happen in your
                favorite live event
              </span>
              <br />
              <span className='whiteText proxima'>
                - Questions are graded in real-time
              </span>
              <br />
              <span className='whiteText proxima'>
                - You are removed from the contest when / if your number of
                wrong answers reaches a given ‘knockout limit’
              </span>
              <br />
              <span className='whiteText proxima'>
                - Last player remaining wins the prize. If multiple participants
                survive, player with the fewest number of wrong answers wins the
                prize. Prize is split if there’s a tie.
              </span>
              <br />
              <br />
              <br />
            </div>

            <span className='whiteText aptifer fontBold text-center'>Fun</span>
            <br />
            <div className='justify-content-start'>
              <span className='whiteText proxima'>
                - Contests cover short time segments so you have more chances to
                win and quick gratification
              </span>
              <br />
              <span className='whiteText proxima'>
                - No complicated scoring
              </span>
              <br />
              <span className='whiteText proxima'>
                - Your results depend not only on being right, but also the
                order in which things happen within the live event
              </span>
              <br />
              <span className='whiteText proxima'>- Free prizes</span>
              <br />
            </div>
            <Link className='btn btn-primary mt-3' label='lets go!' to='/Login'>
              Let's Go!
            </Link>
          </Col>
          <Col md={2} sm={1} lg={2}></Col>
        </Row>
      </Container>
    </>
  )
}

export default Landing
