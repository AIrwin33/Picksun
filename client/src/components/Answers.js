import React, {useEffect, useState} from 'react';
import {Carousel, Col, Button, Container, Modal, Row, Image} from "react-bootstrap";


import "./Answers.css";

import $ from 'jquery';

const Answers = (props) => {

    const [totals, setTotal] = useState(0);
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
                {totals.map((total, index) => {
                    return <div key={total.id} className="totalWhite">

                            </div>
                })}
            </div>
        </>
    )

}

export default Answers;