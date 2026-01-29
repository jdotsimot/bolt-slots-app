import { TOOLS } from './constants';

export const generateMazak = (params) => {
    const { slotWidth, slotLength, parallelWidth, parallelLength, footHeight } = params;

    const tool = slotWidth > 1.0 ? TOOLS.HIGH_FEED : TOOLS.BULLNOSE;
    const toolName = slotWidth > 1.0 ? "HIGH FEED" : "BULLNOSE END MILL";

    const railEndX = parallelLength / 2;
    const slotDepthX = railEndX - slotLength;
    const yOffset = (slotWidth - tool.diameter) / 2;
    const scribeY = parallelWidth / 2;
    const zTarget = -(footHeight + tool.zOvercut);

    let lines = [];
    lines.push("O1111");
    lines.push("(DOCUMENT: BOLT-SLOTS-APP V1)");
    lines.push(`(JOB DESCRIPTION: MAZAK ${slotWidth > 1.0 ? 'STANDARD' : 'SMALL'} SLOT)`);
    lines.push(`(T2 D=0.25 CR=0. TAPER=45DEG - ZMIN=0.05 - CHAMFER MILL)`);
    lines.push(`(${tool.mazak.tool} D=${tool.diameter} CR=0.03 - ZMIN=${zTarget.toFixed(3)} - ${toolName})`);

    lines.push("N1 G90 G94 G17 G49 G40 G80");
    lines.push("N2 G20");
    lines.push("N3 G91 G28 G0 Z0.");
    lines.push("N4 IF [#5201 EQ 0] GOTO 6");
    lines.push("N5 #3006=1(CHECK X SHIFT)");
    lines.push("N6 IF [#5202 EQ 0] GOTO 8");
    lines.push("N7 #3006=1(CHECK Y SHIFT)");
    lines.push("N8 IF [#5203 EQ 0] GOTO 10");
    lines.push("N9 #3006=1(CHECK Z SHIFT)");

    // Scribe Section
    lines.push("");
    lines.push("(SCRIBE TO VERIFY)");
    lines.push("(ADJUST Y0 TO MAKE SURE THAT Y IS CENTERED ON THE ENDS OF THE RAIL)");
    lines.push("N10 T2T0 M6");
    lines.push("N11 G91G28Z0.");
    lines.push("N12 G91G28Y0.");
    lines.push(`N13 ${tool.mazak.tool}`);
    lines.push("N14 M39");
    lines.push(`N15 S2000 M3`);
    lines.push("N16 G54 G90");

    // Right Scribe
    lines.push(`N17 G90 G0 X${(railEndX - 1).toFixed(3)} Y${scribeY.toFixed(3)}`);
    lines.push("N18 G43 Z4. H2");
    lines.push("N19 G0 Z0.25");
    lines.push("N20 G1 Z0.05 F100.");
    lines.push(`N21 X${railEndX.toFixed(3)}`);
    lines.push(`N22 Y${(-scribeY).toFixed(3)}`);
    lines.push(`N23 X${(railEndX - 1).toFixed(3)}`);
    lines.push("N24 Z0.25");
    lines.push("N25 G0 Z4.");

    // Left Scribe
    lines.push(`N26 X${-(railEndX - 1).toFixed(3)} Y${scribeY.toFixed(3)}`);
    lines.push("N27 Z0.25");
    lines.push("N28 G1 Z0.05 F100.");
    lines.push(`N29 X${(-railEndX).toFixed(3)}`);
    lines.push(`N30 Y${(-scribeY).toFixed(3)}`);
    lines.push(`N31 X${-(railEndX - 1).toFixed(3)}`);
    lines.push("N32 Z0.25");
    lines.push("N33 G0 Z4.");
    lines.push("N34 M5");
    lines.push("N35 G91 G28 Z0.");

    // Check WCS again
    lines.push("N36 IF [#5201 EQ 0] GOTO 38");
    lines.push("N37 #3006=1(CHECK X SHIFT)");
    lines.push("N38 IF [#5202 EQ 0] GOTO 40");
    lines.push("N39 #3006=1(CHECK Y SHIFT)");
    lines.push("N40 IF [#5203 EQ 0] GOTO 42");
    lines.push("N41 #3006=1(CHECK Z SHIFT)");

    // Mill Section
    lines.push("");
    lines.push("(MILL BOLT SLOTS)");
    lines.push("N42 M1");
    lines.push(`N43 ${tool.mazak.tool}T0 M6`);
    lines.push("N44 G91G28Z0.");
    lines.push("N45 G91G28Y0.");
    lines.push("N46 T2");
    lines.push("N47 M39");
    lines.push(`N48 S${tool.rpm} M3`);
    lines.push("N49 G54 G90");
    lines.push("N50 M50");

    let lineNum = 51;
    const startX = railEndX + 0.75;
    const innerX = slotDepthX;

    // Right Slot
    lines.push(`N${lineNum++} G90 G0 X${startX.toFixed(3)} Y${yOffset.toFixed(3)}`);
    lines.push(`N${lineNum++} G43 Z4. H${tool.mazak.holder.replace('H', '')}`);
    lines.push(`N${lineNum++} G0 Z0.25`);

    let currentZ = 0;
    const step = tool.stepdown;

    while (currentZ > zTarget) {
        currentZ = Math.max(currentZ - step, zTarget);
        lines.push(`N${lineNum++} G1 Z${currentZ.toFixed(3)} F${tool.feed}`);
        lines.push(`N${lineNum++} X${innerX.toFixed(3)}`);
        lines.push(`N${lineNum++} G3 Y${(-yOffset).toFixed(3)} I0. J${(-yOffset).toFixed(3)}`);
        lines.push(`N${lineNum++} G1 X${startX.toFixed(3)}`);
        if (currentZ > zTarget) {
            lines.push(`N${lineNum++} Y${yOffset.toFixed(3)}`);
        }
    }

    lines.push(`N${lineNum++} G0 Z4.`);

    // Left Slot
    lines.push(`N${lineNum++} X${(-startX).toFixed(3)}`);
    lines.push(`N${lineNum++} Z0.25`);

    currentZ = 0;
    while (currentZ > zTarget) {
        currentZ = Math.max(currentZ - step, zTarget);
        lines.push(`N${lineNum++} G1 Z${currentZ.toFixed(3)} F${tool.feed}`);
        lines.push(`N${lineNum++} X${(-innerX).toFixed(3)}`);
        lines.push(`N${lineNum++} G3 Y${yOffset.toFixed(3)} I0. J${yOffset.toFixed(3)}`);
        lines.push(`N${lineNum++} G1 X${(-startX).toFixed(3)}`);
        if (currentZ > zTarget) {
            lines.push(`N${lineNum++} Y${(-yOffset).toFixed(3)}`);
        }
    }

    lines.push(`N${lineNum++} G0 Z4.`);
    lines.push("");
    lines.push(`N${lineNum++} M5`);
    lines.push(`N${lineNum++} M9`);
    lines.push(`N${lineNum++} G91 G28 Z0.`);
    lines.push(`N${lineNum++} G28 Y0.`);
    lines.push(`N${lineNum++} M30`);
    lines.push("%");

    return lines.join("\n");
};
