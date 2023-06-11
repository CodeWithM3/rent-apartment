const User = require('@model/userSchema')
const invokeOperationError = require('@errors/invokeOperationError')

const withFullUser = async (req, res, next) => {
    try {
        req.user = await User.findOne({
            user_id: req.header('x-api-username')
        })
        if (!req.user) {
            res.status(401).json({
                message: "DeAuth: User not found"
            });
        }
        next()
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "An Error occured"
        });
    }
}
module.exports = withFullUser