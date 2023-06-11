const AccountController = require('@controller/client/account/index.js')
const withFullUser = require('@middleware/withFullUser')

module.exports = function (router) {
   router.get('/find/apartments', AccountController.findApartment)
   router.put('/prompt', [withFullUser], AccountController.executePromptAction)
};
