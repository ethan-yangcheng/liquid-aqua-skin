// Yield stepping must also reach the target sent in the running profile.
test('Chinese yield buttons update the outgoing profile target', function (T) {
  var was = { lang: _lang, prefLang: prefs.lang, profile: curProfileObj,
    dose: settings.doseIn, yield: settings.doseOut };
  try {
    _lang = 'zh'; prefs.lang = 'zh'; applyI18n();
    curProfileObj = { id: 'zh-yield-test', profile: { title: 'Yield test', target_weight: 36,
      steps: [{ pump: 'pressure', pressure: 9, seconds: 30 }] } };
    settings.doseIn = 18; settings.doseOut = 74.6;
    document.querySelector('[onclick="adjust(\'doseOut\',0.5)"]').click();
    T.eq(settings.doseOut, 75, 'plus snaps up');
    T.eq(document.getElementById('doseOutVal').textContent, '75.0', 'display');
    T.eq(+brewProfileForMachine().target_weight, 75, 'machine profile target');
    T.eq(+curProfileObj.profile.target_weight, 36, 'library profile untouched');
    settings.doseOut = 75.1;
    document.querySelector('[onclick="adjust(\'doseOut\',-0.5)"]').click();
    T.eq(settings.doseOut, 75, 'minus snaps down');
    T.eq(t('stopOwnLbl'), '使用此曲线的独立设置', 'new Chinese text');
  } finally {
    clearTimeout(adjust._t);
    _lang = was.lang; prefs.lang = was.prefLang; curProfileObj = was.profile;
    settings.doseIn = was.dose; settings.doseOut = was.yield;
    applyI18n(); syncRecipe();
  }
});
