/*
Unified Plant Components
Uses GenericModel3D to eliminate code duplication
*/

import { GenericModel3D } from "../../shared/GenericModel3D";
import { MODEL_PATHS } from "../../../config/models";
import { GroupProps } from "@react-three/fiber";

// Componentes individuales de plantas (mantenemos compatibilidad)
export function Plant1(props: GroupProps) {
  return <GenericModel3D modelPath={MODEL_PATHS.PLANTS.PLANT_1} {...props} />;
}

export function Plant2(props: GroupProps) {
  return <GenericModel3D modelPath={MODEL_PATHS.PLANTS.PLANT_2} {...props} />;
}

export function Plant3(props: GroupProps) {
  return <GenericModel3D modelPath={MODEL_PATHS.PLANTS.PLANT_3} {...props} />;
}

export function Plant4(props: GroupProps) {
  return <GenericModel3D modelPath={MODEL_PATHS.PLANTS.PLANT_4} {...props} />;
}

export function PlantExterior(props: GroupProps) {
  return (
    <GenericModel3D modelPath={MODEL_PATHS.PLANTS.PLANT_EXTERIOR} {...props} />
  );
}

// Generic component that accepts plant type
interface PlantProps extends GroupProps {
  plantType: keyof typeof MODEL_PATHS.PLANTS;
}

export function Plant({ plantType, ...props }: PlantProps) {
  return (
    <GenericModel3D modelPath={MODEL_PATHS.PLANTS[plantType]} {...props} />
  );
}
