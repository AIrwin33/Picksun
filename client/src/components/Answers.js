import React, {useEffect, useState} from 'react';
import {Carousel, Col, Button, Container, Modal, Row, Image} from "react-bootstrap";


import "./Answers.css";

import $ from 'jquery';

const Answers = (props) => {

    const [answers, setAnswers] = useState([]);


    const getWrongTotal = async (infoWrong, infoTotal) => {
        var ans = [];

        for (var i = 0;i < infoTotal; i++) {
            var an = {
                id : i,
                wrong : false
            }
            ans.push(an);
        }
        console.log(ans);
        for (var w = 0; w < infoWrong; w++) {
            for (var a = 0; a < ans.length; a++) {
                ans[a].wrong = true;
            }
        }
        console.log('show wrong answers' + ans);
        setAnswers(ans);

    }

    useEffect(() => {
       getWrongTotal(props.wrong, props.total);
       console.log(props.wrong);
       console.log(props.total);
    }, [props]);

    return (
        <>
            <div >
                {/* if number wrong is  */}
                <div className="d-inline-block">
                <p>Wrong Answers:</p>
                {answers.map((answer, index) => {
                    return <div  className={`circle   ${answer.wrong ? "wrong" : ""}`} key={index}></div>
                })}                
                </div>
            </div>
        </>
    )

}

export default Answers;