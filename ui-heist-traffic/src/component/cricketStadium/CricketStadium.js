import React from "react";
import { Canvas } from "@react-three/fiber";
import { PresentationControls, Stage, useGLTF } from "@react-three/drei";
import cricketStadium from "../../assets/3dModals/cricket.glb";
import "./CricketStadium.scss";

const CricketStadium = () => {

    const {scene} = useGLTF(cricketStadium);

    return(
        <>
            <Canvas dpr={[1,2]} shadows camera={{fov: 45}} className="cricketStadium">
                <PresentationControls speed={1.5} global polar={[-0.1, Math.PI/4]} >
                    <Stage environment={null}>
                        <primitive object={scene} rotation={[0.25,-4,0.05]} scale={0.0025}></primitive>
                    </Stage>
                </PresentationControls>

            </Canvas>
        </>
    )
}

export default CricketStadium;