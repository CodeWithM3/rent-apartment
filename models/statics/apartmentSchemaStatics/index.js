module.exports = function(apartmentSchema, params){
    apartmentSchema.statics.getUserFromCacheByUserId = async function (user_id) {
        const user_info = await params.redis_bus.get(`user_${user_id}_meta`)
        if (!user_info) return null;
    
        return JSON.parse(user_info);
    }
}