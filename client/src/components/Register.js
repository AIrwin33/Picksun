import React, {Component, useState} from 'react';
import {
    Container, 
    Row,
    Col,
    Image,
    Button,
    ResponsiveEmbed, Form
} from "react-bootstrap";
import "./Register.css";

import { toast } from "react-toastify";

const Register = ({ setAuth }) => {

    const [inputs, setInputs] = useState({
        email: "",
        password: "",
        name: ""
      });

      const { email, password, name } = inputs;

  const onChange = e =>
    setInputs({ ...inputs, [e.target.name]: e.target.value });

  const onSubmitForm = async e => {
    e.preventDefault();
    try {
      const body = { email, password, name };
      const response = await fetch(
        "http://localhost:5000/auth/register",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify(body)
        }
      );
      const parseRes = await response.json();

      console.log(JSON.stringify(parseRes));
      if (parseRes.token) {
        localStorage.setItem("token", parseRes.token);
        setAuth(true);
        toast.success("Register Successfully");
        window.location = "/Lobby";
      } else {
        setAuth(false);
        console.log('parseRes? ' + parseRes);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

    return (
            <>
            {/* Main Body */}
            <Container fluid id="MainContainer">
            <Row>
                <Col >
                    <h4 className="text-center mt-3 textWhite">Register</h4>
                </Col>
            </Row>
            <Row>
                <Col sm={{ span: 6, offset: 3 }}>
                  
                    <Form onSubmit={onSubmitForm}>
                        <Form.Group>
                            <Form.Label className="textWhite">Name</Form.Label>
                            <Form.Control type="text" name="name" placeholder="Name" onChange={e => onChange(e)}/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="textWhite">Username</Form.Label>
                            <Form.Control type="text" name="username" placeholder="Username" onChange={e => onChange(e)}/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="textWhite">Email</Form.Label>
                            <Form.Control type="email" name="email" placeholder="Email address" onChange={e => onChange(e)}/>
                        </Form.Group>

                        <Form.Group>
                            <Form.Label className="textWhite">Password</Form.Label>
                            <Form.Control type="password" name="password" placeholder="password" onChange={e => onChange(e)}/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="textWhite">Confirm Password</Form.Label>
                            <Form.Control type="password" name="confirm" placeholder="confirm password" onChange={e => onChange(e)}/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Check className="textWhite" type="checkbox" label="I have read the Term and Conditions" />
                        </Form.Group>
						<Form.Group>
							{/* include actual link */}
							<Form.Label className="textWhite"><a href="#">Terms and Conditions</a></Form.Label>
						</Form.Group>
                        <Button variant="primary" type="submit" className="btnRed float-right mb-3">
                            Sign Up
                        </Button>
                    </Form>
                    
                    </Col>
                    </Row>
            </Container>

            </>
        )
}

export default Register;