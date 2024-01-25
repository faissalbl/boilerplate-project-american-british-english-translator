'use strict';

const Translator = require('../components/translator.js');

module.exports = function (app) {
  
  const translator = new Translator();

  app.route('/api/translate')
    .post((req, res) => {
      const { text, locale } = req.body;

      if (typeof(text) === 'string' && text.trim().length === 0) {
        return res.json({ error: 'No text to translate' });
      }

      if (!text || !locale) {
        return res.json({ error: 'Required field(s) missing' });
      }

      if (Translator.AMERICAN_TO_BRITISH !== locale && Translator.BRITISH_TO_AMERICAN !== locale) {
        return res.json({ error: 'Invalid value for locale field' });
      }
      
      let translation = translator.translate(text, locale);

      if (translation === text) {
        translation = 'Everything looks good to me!';
      }
      
      return res.json({ text, translation });
    });
};
