import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useFBX, Environment, Stage, Float, OrbitControls } from '@react-three/drei';
import { Loader2 } from 'lucide-react';

/* 
   Model Component 
   - Loads the FBX
   - Applies auto-rotation
*/
function Model() {
    const fbx = useFBX('/models/medal.fbx');
    const ref = useRef<any>();

    // Auto-rotate the medal slowly
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y += 0.005;
            // Add a slight floating wobble if needed, but Float wrapper handles that better
        }
    });

    return (
        <group ref={ref}>
            <primitive object={fbx} />
        </group>
    );
}

const Medal3D = () => {
    return (
        <div className="w-full h-full min-h-[400px] relative">
            <Canvas
                shadows
                dpr={[1, 2]}
                camera={{ fov: 45, position: [0, 0, 10] }}
                gl={{ alpha: true, antialias: true }}
                className="!absolute inset-0"
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />

                <Suspense fallback={null}>
                    {/* Stage automatically centers and scales the model to fit the view */}
                    <Stage environment="city" intensity={0.5} contactShadow={{ opacity: 0.5, blur: 2 }}>
                        <Float
                            speed={2} // Animation speed
                            rotationIntensity={0.5} // XYZ rotation intensity
                            floatIntensity={0.5} // Up/down float intensity
                            floatingRange={[-0.1, 0.1]} // Range of y-axis values the object will float within
                        >
                            <Model />
                        </Float>
                    </Stage>
                </Suspense>

                {/* Allow user to rotate the view (optional, but professional) */}
                <OrbitControls enableZoom={false} autoRotate={false} />
            </Canvas>

            {/* Loading Fallback (managed by parent Suspense usually, but simple overlay here works) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
                {/* Placeholder skeleton or spinner could go here if Suspense takes long */}
            </div>
        </div>
    );
};

// Preload the model to avoid pop-in
useFBX.preload('/models/medal.fbx');

export default Medal3D;
