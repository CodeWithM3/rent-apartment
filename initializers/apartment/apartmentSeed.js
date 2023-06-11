const Apartment = require('@model/apartmentSchema');
const path = require('path')
const readJson = require('readjson')

async function CreateApartment() {
    const apartment_details = path.join(__dirname, '..', '..', 'seed', 'apartment.json')
    const getApartment = await readJson(apartment_details)
    getApartment.forEach(apartment => {
    const payload = {
        image_url : apartment.image_url,
        price: apartment.price,
        amenities: apartment.amenities,
        currency: apartment.currency
   }
   registerApartment(payload)
});
  
}
async function registerApartment(payload){
    const existing_apartment = await Apartment.findOne({image_url: payload.image_url})
    if(existing_apartment) return true
    const registered_apartment = new Apartment({
        image_url : payload.image_url,
        price: payload.price,
        amenities: payload.amenities,
        currency: payload.currency
    })
    await registered_apartment.save()
}

CreateApartment()