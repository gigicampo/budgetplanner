/* Device-local display preference. Never converts or mutates financial records. */
(function () {
  const regions = {PH:'PHP',US:'USD',GB:'GBP',CA:'CAD',AU:'AUD',NZ:'NZD',SG:'SGD',JP:'JPY',CN:'CNY',HK:'HKD',TW:'TWD',KR:'KRW',IN:'INR',ID:'IDR',MY:'MYR',TH:'THB',VN:'VND',AE:'AED',SA:'SAR',QA:'QAR',KW:'KWD',BH:'BHD',OM:'OMR',CH:'CHF',SE:'SEK',NO:'NOK',DK:'DKK',PL:'PLN',CZ:'CZK',HU:'HUF',TR:'TRY',ZA:'ZAR',BR:'BRL',MX:'MXN',DE:'EUR',FR:'EUR',IT:'EUR',ES:'EUR',IE:'EUR',PT:'EUR',NL:'EUR',BE:'EUR',AT:'EUR',FI:'EUR',GR:'EUR'};
  const zones = {'Asia/Manila':'PHP','Asia/Tokyo':'JPY','Asia/Singapore':'SGD','Asia/Hong_Kong':'HKD','Asia/Shanghai':'CNY','Asia/Taipei':'TWD','Asia/Seoul':'KRW','Asia/Kolkata':'INR','Asia/Calcutta':'INR','Asia/Dubai':'AED','Asia/Riyadh':'SAR','Asia/Qatar':'QAR','Asia/Kuwait':'KWD','Asia/Bahrain':'BHD','Asia/Muscat':'OMR','Asia/Bangkok':'THB','Asia/Jakarta':'IDR','Asia/Kuala_Lumpur':'MYR','Asia/Ho_Chi_Minh':'VND','Europe/London':'GBP','Europe/Paris':'EUR','Europe/Berlin':'EUR','Europe/Rome':'EUR','Europe/Madrid':'EUR','Europe/Dublin':'EUR','Europe/Amsterdam':'EUR','Europe/Zurich':'CHF','America/New_York':'USD','America/Chicago':'USD','America/Denver':'USD','America/Los_Angeles':'USD','America/Toronto':'CAD','America/Vancouver':'CAD','Pacific/Auckland':'NZD'};
  function detect(zone, languages) {
    if(zones[zone])return zones[zone];
    if(zone.startsWith('Australia/'))return 'AUD';
    for(const language of languages){try{const region=new Intl.Locale(language).region;if(regions[region])return regions[region]}catch{}}
    return 'PHP';
  }
  const codes = typeof Intl.supportedValuesOf==='function' ? Intl.supportedValuesOf('currency') : [...new Set(Object.values(regions))].sort();
  const detected=detect(Intl.DateTimeFormat().resolvedOptions().timeZone||'',navigator.languages||[navigator.language]);
  let selected=localStorage.getItem('budgetPlannerCurrency');
  if(!codes.includes(selected))selected=detected;
  window.budgetCurrency={codes,detected,detect,get code(){return selected},set(code){if(!codes.includes(code))throw new Error('Choose a supported currency.');localStorage.setItem('budgetPlannerCurrency',code);selected=code},format(value){return new Intl.NumberFormat(navigator.language||'en-PH',{style:'currency',currency:selected,minimumFractionDigits:2,maximumFractionDigits:2}).format(value||0)}};
})();
