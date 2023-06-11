const asyncHandler = require('express-async-handler')
const Apartment = require('@model/apartmentSchema')
const Prompt = require('@model/promptSchema')
const invokeOperationError = require('@errors/invokeOperationError')
const growthbook = require('@growthbook/growthbook')
const {
FEATURE_FLAGS,
CONFIG
}= require('@helpers/constants')


const findApartment = asyncHandler(async (req, res)=>{
    const {
        price,
        amenities
    }= req.query

    const apartment = await Apartment.find({
        $or: [
            {price},
            {amenities}
        ]
    })

    if(!apartment) invokeOperationError('errors.apartment.notfound')
    res.status(200).json({message: apartment})
})


const executePromptAction = asyncHandler(async (req, res) => {
    let {
        type,
        prompt_id,
        input_text
    } = req.body;
    const user_id = req.user.user_id;
    const prompt = await Prompt.findOne({
        _id: prompt_id
    })
    try {
        await prompt.executePromptAction(input_text, user_id, type)
    } catch (error) {
        console.log(error)
    }
    const existing_types = ['text_completion', 'text_paraphrasing', 'text_plagiarism_check', 'text_summarization']
    if (existing_types.includes(type)) {
        res.status(202).send({
            prompt_id: prompt._id,
            msg: 'Processing prompt action..'
        });
    }
})



module.exports = {
    findApartment,
    executePromptAction
}