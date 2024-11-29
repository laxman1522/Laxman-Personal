import React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PresentationControls, Stage, useGLTF } from "@react-three/drei";
import people from "../../assets/3dModals/people.glb";
import "./people.scss";

const People = () => {

    const {scene} = useGLTF(people);

    return(
        <>
            <Canvas dpr={[1,5]} shadows camera={{fov: 45}} className="peopleCanvas">
                <PresentationControls speed={1.5} global polar={[-0.1, Math.PI/4]} >
                    <Stage environment={null}>
                        <primitive object={scene} position={[20,0,-20]} rotation={[5,3,0]} scale={-4}></primitive>
                    </Stage>
                </PresentationControls>

            </Canvas>
        </>
    )
}

export default People;