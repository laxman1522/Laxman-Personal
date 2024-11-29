import React, { useState, useEffect } from "react";
import bmw2 from "../../assets/3dModals/bmw2.glb";
import bmw3 from "../../assets/3dModals/bmw3.glb";
import porsche1 from "../../assets/3dModals/porsche.glb";
import porsche2 from "../../assets/3dModals/porsche2.glb";
import Car from "../car/Car";
import "./CarModalTwo.scss";
import { Canvas } from "@react-three/fiber";
import gif from "../../assets/boom.gif";
import People from "../people/people";


const haltPositions = [6.5, -6.5, 5, -5];


const CarTwoModal = () => {

    const [position, setPosition] = useState([[1.5, 2, -16],[-1.5, 2, 16],[-10, 2, -2.5],[10, 2, 2.5]]);

    const [peoplePosition, setPeoplePosition] = useState([0,0,-0.25]);

    const [peopleRotation, setPeopleRotation] =  useState([1.75,3,0])

    const [rotation, setRotation] = useState([[0,0,0],[0, -3.15, 0],[0, -4.725, 0],[0, 4.75, 0]]);

    const signalArray = [1,2,3,4] ;

    const [carLoaded, setCarLoaded] = useState([false, false, false, false]); // Track loading state for all cars
    const [signal, setSignal] = useState(1);

    const [showBoom, setShowBoom] = useState(false);

    const [showPedestrianCrossing, setShowPedestrianCrossing] = useState(false);

    const [carConfigs, setCarConfigs] = useState([
        {
            name: bmw2,
            axis: 'z',
            direction: 1,
        },
        {
            name: bmw3,
            axis: 'z',
            direction: -1
        },
        {
            name: porsche1,
            axis: 'x',
            direction: 1
        },
        {
            name: porsche2,
            axis: 'x',
            direction: -1
        }
    ]);

    useEffect(() => {
        const trafficInterval = setInterval(() => {
            if(signal % 2 === 0) {
                setShowPedestrianCrossing(true);
                setTimeout(() => {
                    setShowPedestrianCrossing(false);
                    setSignal((prev) => (prev === 4 ? 1 : prev + 1));
                },5000);
            } else {
                setSignal((prev) => (prev === 4 ? 1 : prev + 1));
            }
        }, 15000);
      
        return () => clearInterval(trafficInterval); // Clear interval on cleanup
      }, [signal, showPedestrianCrossing]); // Empty dependency array ensures this effect runs only once


      useEffect(() => {
        const carInterval = setInterval(() => {
            if(showPedestrianCrossing) {
                setPeoplePosition((prevPeoplePosition) => [prevPeoplePosition[0],prevPeoplePosition[1],prevPeoplePosition[2]]);
            }
            if(position[0][0] > 1.5 && position[0][0]-2 < position[3][0] && !carConfigs[3]?.accidented) {
                setShowBoom(true);
                setTimeout(() => {
                    setShowBoom(false);
                },3000)
                setRotation((prevRotation) => {
                    return prevRotation?.map((rotation, index) => {
                        if(index === 3) {
                            return [rotation[0]+5, rotation[1]+0.5, rotation[2]+0.5]
                        } else {
                            return rotation;
                        }
                    })
                })

                // Queue carConfig update separately
                setCarConfigs((prevConfigs) =>
                    prevConfigs.map((config, configIndex) =>
                        configIndex === 3
                            ? { ...config, axis: "y", direction: -1, acidented: true }
                            : config
                    )
                );

                setPosition((prevPosition) => {
                    return prevPosition?.map((position,index) => {
                        if(index === 3) {
                            return [position[0]-2, position[1]-3, position[2]-2]
                        } else {
                            return position;
                        }
                    })
                })
            }
            setPosition((prevPosition) =>
                prevPosition.map((carPosition, index) => {
                    const carData = carConfigs[index];
                    if (carData.axis === "z" && carData.direction === 1 && !carData?.accidented ) {
                        // Car moving along +z direction
                        if (carLoaded[index]) {
                            if((rotation[index][1] < -0.7 && signal !== 1) || (position[index][2] > 0)) {
                                setRotation((prevRotation) =>
                                    prevRotation.map((rotation, rotationIndex) => {
                                        if (rotationIndex === index) {
                                            return [rotation[0], -1.5, rotation[2]];
                                        } else {
                                            return rotation;
                                        }
                                    })
                                );

                                // Queue carConfig update separately
                                setCarConfigs((prevConfigs) =>
                                    prevConfigs.map((config, configIndex) =>
                                        configIndex === index
                                            ? { ...config, axis: "x", direction: -1 }
                                            : config
                                    )
                                );

                                return [-5,carPosition[1],2.5];
                            } else if(carLoaded[1] && carPosition[2] > -4 && signal === 1 && carPosition[2] < 6) {
                                setRotation((prevRotation) =>
                                    prevRotation.map((rotation, rotationIndex) => {
                                        if (rotationIndex === index) {
                                            return [rotation[0], rotation[1] - 0.0075, rotation[2]];
                                        } else {
                                            return rotation;
                                        }
                                    })
                                );
                                return [carPosition[0]-0.065,carPosition[1], carPosition[2]+0.125];
                            } else if (signal === 1 || (carPosition[2] < -6.6 || carPosition[2] >= 6.5)) {
                                return carPosition[2] > 16
                                    ? [carPosition[0], carPosition[1], -16]
                                    : [carPosition[0], carPosition[1], carPosition[2] + 0.15];
                            } else if (carPosition[2] > -6.5 && signal !== 1) {
                                return [carPosition[0], carPosition[1], haltPositions[0]];
                            }
                        }
                    } else if (carData.axis === "z" && carData.direction === -1 && !carData?.accidented) {
                        // Car moving along -z direction
                        if (carLoaded[index]) {
                            if (signal === 2 || (carPosition[2] > 6.6 || carPosition[2] <= -6.5)) {
                                return carPosition[2] < -16
                                    ? [carPosition[0], carPosition[1], 16]
                                    : [carPosition[0], carPosition[1], carPosition[2] - 0.15];
                            } else if (carPosition[2] < 6.5 && signal !== 2) {
                                return [carPosition[0], carPosition[1], haltPositions[1]];
                            }
                        }
                    } else if (carData.axis === "x" && carData.direction === 1 && !carData?.accidented) {
                         if (carLoaded[index]) {
                            if (signal === 3 || (carPosition[0] < -4.35 || carPosition[0] >= 5)) {
                                return carPosition[0] > 10
                                    ? [-10, carPosition[1], carPosition[2]]
                                    : [carPosition[0]+0.15, carPosition[1], carPosition[2]];
                            } else if (carPosition[0] > -4.25 && signal !== 2) {
                                return [haltPositions[2], carPosition[1], carPosition[2]];
                            }
                        }
                    } else if (carData.axis === "x" && carData.direction === -1 && !carData?.accidented) {
                        // Car moving along x direction
                        if (carLoaded[index]) {
                            if (signal === 4 || (carPosition[0] > 4.35 || carPosition[0] <= -5)) {
                                return carPosition[0] < -10
                                    ? [10, carPosition[1], carPosition[2]]
                                    : [carPosition[0]-0.15, carPosition[1], carPosition[2]];
                            } else if (carPosition[0] < 4.25 && signal !== 2) {
                                return [haltPositions[3], carPosition[1], carPosition[2]];
                            }
                        }
                    }
                    return carPosition; // Default to existing position
                })
            );
        }, 5);
    
        return () => clearInterval(carInterval);
    }, [carConfigs, carLoaded, signal, rotation, position, showPedestrianCrossing]);
    


    const handleCarLoad = (carIndex) => {
        setCarLoaded((prev) => {
          const newState = [...prev];
          newState[carIndex] = true; // Mark the specific car as loaded
          return newState;
        });
      };

    const constructSignalClassName = (signalCount) => {
        let className;
        if(signalCount === signal) {
            className = `signal${signalCount}On`;
        } else {
            className = `signal${signalCount}`;
        } 
        return className;
    }
    

    return(
        <>
            <div className="car-container">
            <Canvas dpr={[1,2]} shadows camera={{ position: [1, 15, 0] }}>
                <ambientLight intensity={1} />
                <directionalLight position={[5, 5, 5]} />
                {carConfigs?.map((carData, index) => {
                    return (
                       <Car key={carData?.name} position={position[index]} carModal={carData?.name} rotation={rotation[index]} onLoad={() => handleCarLoad(index)} ></Car>
                    )
                })}
            </Canvas> 
            {signalArray?.map((signal) => {
                return <div className={constructSignalClassName(signal)}></div>
            })}
            {showBoom && <div className="boom"><img src={gif} alt="boom gif"></img></div>}
                <div className="pedestrianCrossingBar bar1">
                   <div className="bar"></div> 
                   <div className="bar"></div>
                   <div className="bar"></div>
                   <div className="bar"></div>
                   <div className="bar"></div>
                </div>
                <div className="pedestrianCrossingBar bar2">
                   <div className="bar"></div> 
                   <div className="bar"></div>
                   <div className="bar"></div>
                   <div className="bar"></div>
                   <div className="bar"></div>
                </div>
                <div className="pedestrianCrossingBar3">
                   <div className="bar"></div> 
                   <div className="bar"></div>
                   <div className="bar"></div>
                   <div className="bar"></div>
                   <div className="bar"></div>
                   <div className="bar"></div>
                   <div className="bar"></div>
                   <div className="bar"></div>
                </div>
                <div className="pedestrianCrossingBar4">
                   <div className="bar"></div> 
                   <div className="bar"></div>
                   <div className="bar"></div>
                   <div className="bar"></div>
                   <div className="bar"></div>
                   <div className="bar"></div>
                   <div className="bar"></div>
                   <div className="bar"></div>
                </div>
            </div>
        </>
    )
}

export default CarTwoModal;