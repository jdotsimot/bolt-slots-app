import { MACHINES } from './constants.js';
import { generateMazak } from './mazak.js';
import { generateBigMills } from './bigmills.js';

export const generateGCode = (machine, params) => {
    if (machine === MACHINES.MAZAK) {
        return generateMazak(params);
    } else if (machine === MACHINES.BIG_MILLS) {
        return generateBigMills(params);
    }
    return "";
};

export { MACHINES, TOOLS } from './constants.js';
