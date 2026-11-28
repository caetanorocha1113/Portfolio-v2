/* ---------- boot ----------
   Cada passo é protegido (protegido, em js/06-loop.js): se um falhar, o laço começa do mesmo jeito
   e o erro aparece no aviso de js/00b-conteudo.js, em vez de a tela ficar preta. */
protegido('papel',()=>{document.getElementById('paper').style.backgroundImage=`url(${GRAIN.toDataURL()})`});
protegido('efeitos',initFx);protegido('jogo',iniciarJogo);protegido('vista',prepararVista);requestAnimationFrame(frame);
protegido('player',uiPlayer);protegido('HUD',hudGame);protegido('modo',updateModeUI);
/* the heavy first paint is done: the opening (js/00c-abertura.js) can start */
document.documentElement.classList.add('motor-pronto');dispatchEvent(new Event('motor-pronto'));
/* the character only appears once its frames have loaded (no swap from the drawn fallback to the owner's sprites) */
loadFolder().catch(e=>console.warn('Portfólio: pasta recursos/',e)).then(()=>{HERO_PRONTO=true}).then(preferRegionTrack);
