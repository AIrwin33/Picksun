import React, {useEffect, useState} from 'react';
import {Carousel, Col, Button, Container, Modal, Row, Image} from "react-bootstrap";

import knockout from "../assets/knockedout.png";
import "./Answers.css";

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

        for (var w = 0; w < infoWrong; w++) {
            ans[w].wrong = true;
        }
        setAnswers(ans);

    }

    useEffect(() => {

        getWrongTotal(props.wrong, props.total);

       

    }, [props]);

    return (
        <>
            <div className='inline'>
                {/* if number wrong is  */}
                
                <div className="d-inline-block">
                    <div>
                        <img alt="knockout limit" width='50' src={knockout}/>
                    <p className="font20">Knockout Limit:</p>
                    </div>
                {answers.map((answer, index) => {
                    return <div  className={`circle   ${answer.wrong ? "wrong" : ""}`} key={index}></div>
                })}                
                </div>
            </div>
        </>
    )

}

export default Answers;