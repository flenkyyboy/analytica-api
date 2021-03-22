const jtw = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decode = jtw.verify(token,"SECRET",)
        req.userData = decode;
        console.log(req.userData);
        next()
    } catch (error) {
        res.status(401).json({
            message:'Auth Failed'
        })
    }

}