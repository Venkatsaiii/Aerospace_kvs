const Joi = require('joi');
const { number } = require('joi');

module.exports.buyerSchema = Joi.object({
    buyer: Joi.object({
        name: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().required(),
        sellername: Joi.string().required(),
        pnenum: Joi.number().required().min(0)
    }).required()
});
