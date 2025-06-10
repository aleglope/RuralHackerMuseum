/**
 * 3D Models Utilities
 * Helpers for transformations and type conversions
 */

import { Vector3Object, Vector3Tuple } from "../types";
import { Vector3Like } from "./types";

// ===== TRANSFORMADORES DE VECTORES =====

/**
 * Converts any Vector3Like type to Vector3Object
 */
export const toVector3Object = (value: Vector3Like): Vector3Object => {
  if (typeof value === "number") {
    return { x: value, y: value, z: value };
  }

  if (Array.isArray(value)) {
    return { x: value[0], y: value[1], z: value[2] };
  }

  return value as Vector3Object;
};

/**
 * Converts any Vector3Like type to Vector3Tuple
 */
export const toVector3Tuple = (value: Vector3Like): Vector3Tuple => {
  if (typeof value === "number") {
    return [value, value, value];
  }

  if (Array.isArray(value)) {
    return value as Vector3Tuple;
  }

  return [value.x, value.y, value.z];
};

/**
 * Extracts x, y, z coordinates from any Vector3Like type
 */
export const extractVector3Coords = (
  value: Vector3Like | undefined
): { x: number; y: number; z: number } => {
  if (!value) {
    return { x: 0, y: 0, z: 0 };
  }

  const vec = toVector3Object(value);
  return { x: vec.x, y: vec.y, z: vec.z };
};

/**
 * Converts any scale to number array for Three.js
 */
export const scaleToArray = (
  scale: Vector3Like | undefined
): [number, number, number] => {
  if (!scale) {
    return [1, 1, 1];
  }

  if (typeof scale === "number") {
    return [scale, scale, scale];
  }

  if (Array.isArray(scale)) {
    return scale as [number, number, number];
  }

  return [scale.x, scale.y, scale.z];
};

// ===== HELPERS ESPECÍFICOS PARA MODELOS =====

/**
 * Helper para escalar modelos que tienen configuraciones complejas
 */
export const getModelScale = (config: any): [number, number, number] => {
  if (!config?.scale) {
    return [1, 1, 1];
  }

  return scaleToArray(config.scale);
};

/**
 * Helper para posición de modelos
 */
export const getModelPosition = (config: any): [number, number, number] => {
  if (!config?.position) {
    return [0, 0, 0];
  }

  return toVector3Tuple(config.position);
};

/**
 * Helper para rotación de modelos
 */
export const getModelRotation = (config: any): [number, number, number] => {
  if (!config?.rotation) {
    return [0, 0, 0];
  }

  return toVector3Tuple(config.rotation);
};

// ===== VALIDADORES =====

/**
 * Validates if a value is a valid Vector3
 */
export const isValidVector3 = (value: any): boolean => {
  if (typeof value === "number") return true;
  if (Array.isArray(value) && value.length === 3) return true;
  if (
    value &&
    typeof value === "object" &&
    "x" in value &&
    "y" in value &&
    "z" in value
  )
    return true;
  return false;
};

// ===== EXPORT POR DEFECTO =====
export default {
  toVector3Object,
  toVector3Tuple,
  extractVector3Coords,
  scaleToArray,
  getModelScale,
  getModelPosition,
  getModelRotation,
  isValidVector3,
};
