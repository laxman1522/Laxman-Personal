import React, { useRef, useState } from "react";
import { APP_CONSTANTS } from "../../constants/appConstants";
import "./Traffic.scss";
import CarTwoModal from "../../component/carModalTwo/CarModalTwo";

const Traffic = () => {

    const [showCar, setShowCar] = useState(false);


    const showCarHandler = () => {
        setShowCar(true);
    }

    const testt = useRef();

    const test = (event) => {
        console.log(event, testt)
    }

    return (
        <>
            <div className="traffic-container">
                <div className="traffic-image">
                    <img onLoad={showCarHandler} src={APP_CONSTANTS.TRAFFIC_IMAGE_URL} alt={APP_CONSTANTS?.TRAFFIC_IMAGE}></img>
                </div>
                {showCar && <CarTwoModal></CarTwoModal>}
            </div>

        </>
        

        
    )
}

export default Traffic;