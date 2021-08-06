import React, {useEffect, useState} from 'react';
import {Carousel, Col, Button, Container, Modal, Row, Image} from "react-bootstrap";


import "./Answers.css";

import $ from 'jquery';

const Answers = (props) => {

    const [total, setTotal] = useState(0);
    const [wrong, setWrong] = useState(0);


    const getWrongTotal = async (infoWrong, infoTotal) => {
        console.log(infoWrong);
        console.log(infoTotal);
        setTotal(infoTotal);
    }

    useEffect(() => {
       getWrongTotal(props.wrong, props.total)
    }, [props]);

    return (
        <>
            <div>
                <h4>Wrong Answers:</h4>
                return <ul>{Array.from(Array(total), (e, i) => {
                    return <li key={i}>{i}</li>
                })}</ul>
            </div>
        </>
    )

}

export default Answers;