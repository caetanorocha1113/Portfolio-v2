/* ---------- boot ---------- */
document.getElementById('paper').style.backgroundImage=`url(${GRAIN.toDataURL()})`;initFx();iniciarJogo();prepararVista();requestAnimationFrame(frame);
uiPlayer();hudGame();updateModeUI();
/* the heavy first paint is done: the opening (js/00c-abertura.js) can start */
document.documentElement.classList.add('motor-pronto');dispatchEvent(new Event('motor-pronto'));
/* the character only appears once its frames have loaded (no swap from the drawn fallback to the owner's sprites) */
loadFolder().catch(e=>console.warn('Portfólio: pasta recursos/',e)).then(()=>{HERO_PRONTO=true}).then(preferRegionTrack);
