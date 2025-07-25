const Joi = require('joi');

const validateLogin = (req, res, next) => {
    const schema = Joi.object({
        username: Joi.string().required().min(3).max(50),
        password: Joi.string().required().min(6)
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ 
            error: 'Validation error', 
            details: error.details[0].message 
        });
    }
    next();
};

const validateRegister = (req, res, next) => {
    const schema = Joi.object({
        username: Joi.string().required().min(3).max(50).alphanum(),
        email: Joi.string().required().email(),
        password: Joi.string().required().min(6),
        name: Joi.string().required().min(2).max(255),
        role: Joi.string().valid('admin', 'user', 'marketing', 'finance', 'operations').default('user')
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ 
            error: 'Validation error', 
            details: error.details[0].message 
        });
    }
    next();
};

module.exports = {
    validateLogin,
    validateRegister
};