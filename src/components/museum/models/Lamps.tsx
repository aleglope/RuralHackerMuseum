/*
Unified Lamp Components
Uses GenericModel3D to eliminate code duplication
*/

import { GenericModel3D } from "../../shared/GenericModel3D";
import { MODEL_PATHS } from "../../../config/models";
import { GroupProps } from "@react-three/fiber";

// Componentes individuales de lámparas (mantenemos compatibilidad)
export function CeilingLamp(props: GroupProps) {
  return (
    <GenericModel3D modelPath={MODEL_PATHS.LAMPS.CEILING_MOON} {...props} />
  );
}

export function CeilingLamp2(props: GroupProps) {
  return <GenericModel3D modelPath={MODEL_PATHS.LAMPS.CEILING_2} {...props} />;
}

// Generic component that accepts lamp type
interface LampProps extends GroupProps {
  lampType: keyof typeof MODEL_PATHS.LAMPS;
}

export function Lamp({ lampType, ...props }: LampProps) {
  return <GenericModel3D modelPath={MODEL_PATHS.LAMPS[lampType]} {...props} />;
}
