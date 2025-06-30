import { v4 as uuidv4 } from 'uuid';
 
export function withPrefix(prefix) {
  return `${prefix}_${uuidv4()}`;
} 