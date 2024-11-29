import React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PresentationControls, Stage, useGLTF } from "@react-three/drei";
import gasStation from "../../assets/3dModals/gasStation.glb";
import "./GasStation.scss";

const GasStation = () => {

    const {scene} = useGLTF(gasStation);

    return(
        <>
            <Canvas dpr={[1,5]} shadows camera={{fov: 45}} className="gasStationCanvas">
                <PresentationControls speed={1.5} global polar={[-0.1, Math.PI/4]} >
                    <Stage environment={null}>
                        <primitive object={scene} scale={0.0075}></primitive>
                    </Stage>
                </PresentationControls>

            </Canvas>
        </>
    )
}

export default GasStation;