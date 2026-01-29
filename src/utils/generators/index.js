import { MACHINES } from './constants';
import { generateMazak } from './mazak';
import { generateBigMills } from './bigmills';

export const generateGCode = (machine, params) => {
    if (machine === MACHINES.MAZAK) {
        return generateMazak(params);
    } else if (machine === MACHINES.BIG_MILLS) {
        return generateBigMills(params);
    }
    return "";
};

export { MACHINES, TOOLS } from './constants';
