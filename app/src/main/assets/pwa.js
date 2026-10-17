(function(){
 if(window.Android){$('share-app').closest('.settings-row').hidden=true;return;}
 const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 let installPrompt=null;
 const guide=$('install-guide');
 function install(){if(standalone()){toast('The app is already installed. Open its icon from your Home Screen.');return}if(installPrompt){installPrompt.prompt();installPrompt=null;return}guide.showModal()}
 $('close-install').onclick=()=>guide.close();
 $('web-install').hidden=standalone();$('web-install').onclick=install;
 $('pin').onclick=install;$('pin-settings').onclick=install;
 document.querySelector('.banner h2').textContent='Add the app to your phone';
 document.querySelector('.banner p').textContent=ios?'Install from Safari. No App Store needed.':'Install for a full-screen view and offline clocks.';
 $('pin').textContent='Install ↗';$('pin-settings').textContent='Install app';
 const settingsInfo=$('pin-settings').previousElementSibling;settingsInfo.textContent=ios?'Open this link in Safari, tap Share, then Add to Home Screen. Turn on Open as Web App if shown. The iPhone web app does not include a live home-screen widget.':'Use your browser’s Install app or Add to Home Screen option. The web app does not include the Android clock widget.';
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event});
 window.addEventListener('appinstalled',()=>{$('web-install').hidden=true});
 $('share-app').onclick=()=>shareText('Mariya & Thomas\n'+new URL('./?person=thomas',location.href).href+'\nOn iPhone: open in Safari → Share → Add to Home Screen. Install first, then open Chat and paste our pairing code.');
 if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>toast('Offline setup could not finish. Reopen the app with internet.'));
 if(navigator.storage?.persist)navigator.storage.persist().catch(()=>{});
})();
