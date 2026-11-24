/* ---------- boot ---------- */
document.getElementById('paper').style.backgroundImage=`url(${GRAIN.toDataURL()})`;initFx();buildRoute();renderSection(0);requestAnimationFrame(frame);
uiPlayer();hudGame();updateModeUI();loadFolder().then(loadSaved).then(preferRegionTrack);
