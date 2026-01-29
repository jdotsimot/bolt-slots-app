import { TOOLS } from './constants';

export const generateBigMills = (params) => {
    const { slotWidth, slotLength, parallelWidth, parallelLength, footHeight } = params;

    const tool = slotWidth > 1.0 ? TOOLS.HIGH_FEED : TOOLS.BULLNOSE;
    const toolName = slotWidth > 1.0 ? "HIGH FEED - SHORT" : "BULLNOSE END MILL";
    const toolNum = tool.bigMills.tool.replace('T', '');

    const railEndX = parallelLength / 2;
    const slotDepthX = railEndX - slotLength;
    const yOffset = (slotWidth - tool.diameter) / 2;
    const scribeY = parallelWidth / 2;
    const zTarget = -(footHeight + tool.zOvercut);

    let lines = [];
    lines.push("%");
    lines.push("(DOCUMENT BOLT-SLOTS-APP V1)");
    lines.push(`(JOB DESCRIPTION BIG MILLS ${slotWidth > 1.0 ? 'STANDARD' : 'SMALL'} SLOT)`);
    lines.push(`(T2 D=0.25 CR=0. TAPER=45DEG - ZMIN=0.05 - CHAMFER MILL)`);
    lines.push(`(${tool.bigMills.tool} D=${tool.diameter} CR=0.03 - ZMIN=${zTarget.toFixed(3)} - ${toolName})`);

    lines.push("N1 G90 G94 G17 G49 G40 G80");
    lines.push("N2 G20");
    lines.push("N3 G28 G91 Z0.");
    lines.push("N4 G90");
    lines.push("N5 IF [#2500 NE 0] THEN #3006=1 (CHECK X SHIFT)");
    lines.push("N6 IF [#2600 NE 0] THEN #3006=1 (CHECK Y SHIFT)");
    lines.push("N7 IF [#2700 NE 0] THEN #3006=1 (CHECK Z SHIFT)");

    // Scribe Section
    lines.push("");
    lines.push("(SCRIBE TO VERIFY)");
    lines.push("(ADJUST Y0 TO MAKE SURE THAT Y IS CENTERED ON THE ENDS OF THE RAIL)");
    lines.push("N8 /T2");
    lines.push("N9 /M6");
    lines.push("N10 M98 P8504");
    lines.push("N11 M98 P8501");
    lines.push(`N12 /${tool.bigMills.tool}`);
    lines.push(`N13 S2000 M03`);
    lines.push("N14 G54");
    lines.push("N15 IF [#10002 NE 0] THEN #3006=1 (CHECK TOOL LENGTH WEAR)");

    // Right Scribe
    lines.push(`N16 G00 X${(railEndX - 1).toFixed(3)} Y${scribeY.toFixed(3)}`);
    lines.push("N17 G43 Z4. H02");
    lines.push("N18 G00 Z0.25");
    lines.push("N19 G01 Z0.05 F100.");
    lines.push(`N20 X${railEndX.toFixed(3)}`);
    lines.push(`N21 Y${(-scribeY).toFixed(3)}`);
    lines.push(`N22 X${(railEndX - 1).toFixed(3)}`);
    lines.push("N23 Z0.25");
    lines.push("N24 G00 Z4.");

    // Left Scribe
    lines.push(`N25 X${-(railEndX - 1).toFixed(3)} Y${scribeY.toFixed(3)}`);
    lines.push("N26 Z0.25");
    lines.push("N27 G01 Z0.05 F100.");
    lines.push(`N28 X${(-railEndX).toFixed(3)}`);
    lines.push(`N29 Y${(-scribeY).toFixed(3)}`);
    lines.push(`N30 X${-(railEndX - 1).toFixed(3)}`);
    lines.push("N31 Z0.25");
    lines.push("N32 G00 Z4.");
    lines.push("N33 M05");
    lines.push("N34 M98 P8505");
    lines.push("N35 G28 G91 Z0.");
    lines.push("N36 G90");
    lines.push("N37 G49");

    // Check WCS again
    lines.push("N38 IF [#2500 NE 0] THEN #3006=1 (CHECK X SHIFT)");
    lines.push("N39 IF [#2600 NE 0] THEN #3006=1 (CHECK Y SHIFT)");
    lines.push("N40 IF [#2700 NE 0] THEN #3006=1 (CHECK Z SHIFT)");

    // Mill Section
    lines.push("");
    lines.push("(MILL BOLT SLOTS)");
    lines.push("N41 M01");
    lines.push(`N42 /${tool.bigMills.tool}`);
    lines.push("N43 /M6");
    lines.push(`#105=${toolNum}`);
    lines.push("N44 M98 P8506");
    lines.push("N45 M98 P8504");
    lines.push("N46 M98 P8501");
    lines.push("N47 /T2");
    lines.push(`N48 S${tool.rpm} M03`);
    lines.push("N49 G54");
    lines.push(`N50 IF [#100${toolNum} NE 0] THEN #3006=1 (CHECK TOOL LENGTH WEAR)`);
    lines.push("N51 M98 P8502");

    let lineNum = 52;
    const startX = railEndX + 0.75;
    const innerX = slotDepthX;

    // Right Slot
    lines.push(`N${lineNum++} G00 X${startX.toFixed(3)} Y${yOffset.toFixed(3)}`);
    lines.push(`N${lineNum++} G43 Z4. H${toolNum}`);
    lines.push(`N${lineNum++} G00 Z0.25`);

    let currentZ = 0;
    const step = tool.stepdown;

    while (currentZ > zTarget) {
        currentZ = Math.max(currentZ - step, zTarget);
        lines.push(`N${lineNum++} G01 Z${currentZ.toFixed(3)} F${tool.feed}`);
        lines.push(`N${lineNum++} X${innerX.toFixed(3)}`);
        lines.push(`N${lineNum++} G03 Y${(-yOffset).toFixed(3)} J${(-yOffset).toFixed(3)}`);
        lines.push(`N${lineNum++} G01 X${startX.toFixed(3)}`);
        if (currentZ > zTarget) {
            lines.push(`N${lineNum++} Y${yOffset.toFixed(3)}`);
        }
    }

    lines.push(`N${lineNum++} G00 Z4.`);

    // Left Slot
    lines.push(`N${lineNum++} X${(-startX).toFixed(3)}`);
    lines.push(`N${lineNum++} Z0.25`);

    currentZ = 0;
    while (currentZ > zTarget) {
        currentZ = Math.max(currentZ - step, zTarget);
        lines.push(`N${lineNum++} G01 Z${currentZ.toFixed(3)} F${tool.feed}`);
        lines.push(`N${lineNum++} X${(-innerX).toFixed(3)}`);
        lines.push(`N${lineNum++} G03 Y${yOffset.toFixed(3)} J${yOffset.toFixed(3)}`);
        lines.push(`N${lineNum++} G01 X${(-startX).toFixed(3)}`);
        if (currentZ > zTarget) {
            lines.push(`N${lineNum++} Y${(-yOffset).toFixed(3)}`);
        }
    }

    lines.push(`N${lineNum++} G00 Z4.`);
    lines.push("");
    lines.push(`N${lineNum++} M09`);
    lines.push(`N${lineNum++} G28 G91 Z0.`);
    lines.push(`N${lineNum++} G90`);
    lines.push(`N${lineNum++} G49`);
    lines.push(`N${lineNum++} M98 P8505`);
    lines.push(`N${lineNum++} M30`);
    lines.push("%");

    return lines.join("\n");
};
