const makeModel = require('./mysqlBase');

const model = makeModel('support_requests');

module.exports = {
    ...model,
    async create(payload) {
        const count = await model.countDocuments();
        const requestId = payload.requestId || `REQ-${String(count + 1).padStart(5, '0')}`;
        return model.create({ ...payload, requestId });
    }
};
