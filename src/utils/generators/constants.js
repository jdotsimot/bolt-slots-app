export const TOOLS = {
  HIGH_FEED: {
    diameter: 1.0,
    mazak: { tool: 'T22', holder: 'H22' },
    bigMills: { tool: 'T51', holder: 'H51' },
    stepdown: 0.025,
    zOvercut: 0.250,
    rpm: 1900,
    feed: 105
  },
  BULLNOSE: {
    diameter: 0.75,
    mazak: { tool: 'T7', holder: 'H7' },
    bigMills: { tool: 'T35', holder: 'H35' },
    stepdown: 0.100,
    zOvercut: 0.125,
    rpm: 2546,
    feed: 31
  },
  SCRIBE: {
    tool: 'T2',
    holder: 'H2',
    diameter: 0.25, // For clearance math if needed
    rpm: 2000,
    feed: 100
  }
};

export const MACHINES = {
  MAZAK: 'Mazak',
  BIG_MILLS: 'Big Mills'
};
