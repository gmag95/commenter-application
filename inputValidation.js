const BaseJoi = require("joi");
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

module.exports.inputSchema = Joi.object({
    comment: Joi.string().required().min(1).max(240).escapeHTML(),
    url: Joi.string()
})

module.exports.userSchema = Joi.object({
    username: Joi.string().required().min(1).max(20).escapeHTML(),
    email: Joi.string().required().min(1).max(20).escapeHTML(),
    password: Joi.string().required().min(1).max(20).escapeHTML(),
    regCode: Joi.string().required().min(1).max(20).escapeHTML()
})