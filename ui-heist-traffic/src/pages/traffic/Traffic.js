import React, { useRef, useState } from "react";
import { APP_CONSTANTS } from "../../constants/appConstants";
import "./Traffic.scss";
import CarTwoModal from "../../component/carModalTwo/CarModalTwo";
import GasStation from "../../component/gasStation/GasStation";
import CricketStadium from "../../component/cricketStadium/CricketStadium";
import People from "../../component/people/people";

const Traffic = () => {

    const [showCar, setShowCar] = useState(false);


    const showCarHandler = () => {
        setShowCar(true);
    }

    return (
        <>
            <div className="traffic-container">
                <div className="traffic-image">
                    <img onLoad={showCarHandler} src={APP_CONSTANTS.TRAFFIC_IMAGE_URL} alt={APP_CONSTANTS?.TRAFFIC_IMAGE}></img>
                </div>
                {showCar && <CarTwoModal></CarTwoModal>}
                <GasStation></GasStation>
                <CricketStadium></CricketStadium>
                <People></People>
            </div>

        </>
        

        
    )
}

export default Traffic;