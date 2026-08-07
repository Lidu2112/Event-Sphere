const { pool, generateId } = require('../config/database');

function normalizeRecord(record) {
    if (!record) return null;
    if (typeof record === 'string') {
        try {
            return JSON.parse(record);
        } catch {
            return record;
        }
    }
    return record;
}

function toDbRow(data, id = null) {
    const rowId = id || generateId();
    return {
        id: rowId,
        data: JSON.stringify(data)
    };
}

function applySelect(doc, selectFields) {
    if (!selectFields) return doc;
    const copy = { ...doc };
    if (typeof selectFields === 'string') {
        const fields = selectFields.split(/\s+/).filter(Boolean);
        const excluded = fields.filter(field => field.startsWith('-')).map(field => field.slice(1));
        const included = fields.filter(field => !field.startsWith('-'));
        if (excluded.length) {
            excluded.forEach(field => delete copy[field]);
        }
        if (included.length) {
            const allowed = new Set(included);
            Object.keys(copy).forEach(key => {
                if (!allowed.has(key) && key !== '_id' && key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
                    delete copy[key];
                }
            });
        }
        return copy;
    }
    return copy;
}

function sortRecords(records, sortSpec) {
    if (!sortSpec || typeof sortSpec !== 'object') return records;
    const entries = Object.entries(sortSpec);
    return [...records].sort((a, b) => {
        for (const [key, direction] of entries) {
            const valueA = a[key];
            const valueB = b[key];
            if (valueA === valueB) continue;
            const comparison = valueA > valueB ? 1 : -1;
            return direction === -1 ? -comparison : comparison;
        }
        return 0;
    });
}

function resolvePopulate(doc, path) {
    if (!doc || !path) return doc;
    if (path === 'serviceId' && doc.serviceId) {
        const Service = require('./Service');
        return Service.findById(doc.serviceId).exec().then(resolved => ({ ...doc, serviceId: resolved || doc.serviceId }));
    }
    if (path === 'vendorId' && doc.vendorId) {
        const User = require('./user');
        return User.findById(doc.vendorId).exec().then(resolved => ({ ...doc, vendorId: resolved || doc.vendorId }));
    }
    if (path === 'userId' && doc.userId) {
        const User = require('./user');
        return User.findById(doc.userId).exec().then(resolved => ({ ...doc, userId: resolved || doc.userId }));
    }
    return doc;
}

function wrapDocument(doc, tableName, rowId) {
    const safeDoc = {
        ...doc,
        _id: rowId,
        id: rowId,
        createdAt: doc.createdAt || new Date(),
        updatedAt: doc.updatedAt || new Date()
    };

    safeDoc.save = async function () {
        const payload = { ...safeDoc };
        delete payload._id;
        delete payload.id;
        delete payload.createdAt;
        delete payload.updatedAt;
        delete payload.save;
        payload.updatedAt = new Date();
        const row = toDbRow(payload, rowId);
        await pool.query(`UPDATE ${tableName} SET data = ? WHERE id = ?`, [row.data, rowId]);
        return wrapDocument({ ...payload, _id: rowId, id: rowId, createdAt: safeDoc.createdAt, updatedAt: payload.updatedAt }, tableName, rowId);
    };

    safeDoc.toObject = function () {
        const { save, toObject, toJSON, ...rest } = safeDoc;
        return rest;
    };

    safeDoc.toJSON = safeDoc.toObject;

    return safeDoc;
}

class QueryBuilder {
    constructor(model, query = {}, options = {}) {
        this.model = model;
        this.query = query;
        this.options = options;
        this.selectFields = null;
        this.sortSpec = null;
        this.limitValue = null;
        this.skipValue = 0;
        this.populatePath = null;
    }

    select(fields) {
        this.selectFields = fields;
        return this;
    }

    sort(sortSpec) {
        this.sortSpec = sortSpec;
        return this;
    }

    limit(value) {
        this.limitValue = value;
        return this;
    }

    skip(value) {
        this.skipValue = value;
        return this;
    }

    populate(path) {
        this.populatePath = path;
        return this;
    }

    async exec() {
        const docs = await this.model._findRaw(this.query);
        let result = docs.map(doc => wrapDocument(doc, this.model.tableName, doc.id));
        if (this.selectFields) {
            result = result.map(doc => applySelect(doc, this.selectFields));
        }
        if (this.sortSpec) {
            result = sortRecords(result, this.sortSpec);
        }
        if (this.skipValue) {
            result = result.slice(this.skipValue);
        }
        if (this.limitValue) {
            result = result.slice(0, this.limitValue);
        }
        if (this.populatePath) {
            result = await Promise.all(result.map(async doc => resolvePopulate(doc, this.populatePath)));
        }
        return this.options.single ? result[0] || null : result;
    }

    then(resolve, reject) {
        return this.exec().then(resolve, reject);
    }

    catch(reject) {
        return this.exec().catch(reject);
    }
}

function makeModel(tableName) {
    const model = {
        tableName,

        async create(payload) {
            const row = toDbRow(payload);
            await pool.query(`INSERT INTO ${tableName} (id, data) VALUES (?, ?)`, [row.id, row.data]);
            return wrapDocument({ ...payload, createdAt: new Date(), updatedAt: new Date() }, tableName, row.id);
        },

        find(query = {}) {
            return new QueryBuilder(model, query);
        },

        findOne(query = {}) {
            return new QueryBuilder(model, query, { single: true });
        },

        findById(id) {
            return new QueryBuilder(model, { id }, { single: true });
        },

        async findByIdAndUpdate(id, update, options = {}) {
            const existing = await model.findById(id).exec();
            if (!existing) return null;
            const merged = { ...existing };
            if (update && typeof update === 'object' && !Array.isArray(update)) {
                Object.entries(update).forEach(([key, value]) => {
                    if (key === '$set' && value && typeof value === 'object') {
                        Object.assign(merged, value);
                    } else if (key === '$push' && value && typeof value === 'object') {
                        Object.entries(value).forEach(([pushKey, pushValue]) => {
                            merged[pushKey] = [...(merged[pushKey] || []), pushValue];
                        });
                    } else if (key === '$pull' && value && typeof value === 'object') {
                        Object.entries(value).forEach(([pullKey, pullValue]) => {
                            if (Array.isArray(merged[pullKey])) {
                                merged[pullKey] = merged[pullKey].filter(item => {
                                    if (typeof pullValue === 'object' && pullValue !== null) {
                                        return Object.entries(pullValue).some(([k, v]) => item?.[k] !== v);
                                    }
                                    return item !== pullValue;
                                });
                            }
                        });
                    } else if (!key.startsWith('$')) {
                        merged[key] = value;
                    }
                });
            }
            delete merged._id;
            delete merged.id;
            delete merged.createdAt;
            delete merged.updatedAt;
            delete merged.save;
            const row = toDbRow({ ...merged, updatedAt: new Date() }, id);
            await pool.query(`UPDATE ${tableName} SET data = ? WHERE id = ?`, [row.data, id]);
            const updated = await model.findById(id).exec();
            if (options.new === false) return existing;
            return updated;
        },

        async findByIdAndDelete(id) {
            await pool.query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
            return true;
        },

        async findOneAndUpdate(query = {}, update, options = {}) {
            const existing = await model.findOne(query).exec();
            if (!existing && options.upsert) {
                const createdPayload = { ...query };
                if (update && typeof update === 'object' && !Array.isArray(update)) {
                    Object.entries(update).forEach(([key, value]) => {
                        if (key === '$set' && value && typeof value === 'object') {
                            Object.assign(createdPayload, value);
                        } else if (key === '$setOnInsert' && value && typeof value === 'object') {
                            Object.assign(createdPayload, value);
                        } else if (key === '$push' && value && typeof value === 'object') {
                            Object.entries(value).forEach(([pushKey, pushValue]) => {
                                createdPayload[pushKey] = [...(createdPayload[pushKey] || []), pushValue];
                            });
                        } else if (!key.startsWith('$')) {
                            createdPayload[key] = value;
                        }
                    });
                }
                const created = await model.create(createdPayload);
                return created;
            }
            if (!existing) return null;
            const merged = { ...existing };
            if (update && typeof update === 'object' && !Array.isArray(update)) {
                Object.entries(update).forEach(([key, value]) => {
                    if (key === '$set' && value && typeof value === 'object') {
                        Object.assign(merged, value);
                    } else if (key === '$push' && value && typeof value === 'object') {
                        Object.entries(value).forEach(([pushKey, pushValue]) => {
                            merged[pushKey] = [...(merged[pushKey] || []), pushValue];
                        });
                    } else if (key === '$pull' && value && typeof value === 'object') {
                        Object.entries(value).forEach(([pullKey, pullValue]) => {
                            if (Array.isArray(merged[pullKey])) {
                                merged[pullKey] = merged[pullKey].filter(item => {
                                    if (typeof pullValue === 'object' && pullValue !== null) {
                                        return Object.entries(pullValue).some(([k, v]) => item?.[k] !== v);
                                    }
                                    return item !== pullValue;
                                });
                            }
                        });
                    } else if (!key.startsWith('$')) {
                        merged[key] = value;
                    }
                });
            }
            delete merged._id;
            delete merged.id;
            delete merged.createdAt;
            delete merged.updatedAt;
            delete merged.save;
            const row = toDbRow({ ...merged, updatedAt: new Date() }, existing.id);
            await pool.query(`UPDATE ${tableName} SET data = ? WHERE id = ?`, [row.data, existing.id]);
            const updated = await model.findOne(query).exec();
            return updated;
        },

        async findOneAndDelete(query = {}) {
            const existing = await model.findOne(query).exec();
            if (!existing) return null;
            await pool.query(`DELETE FROM ${tableName} WHERE id = ?`, [existing.id]);
            return existing;
        },

        async deleteMany(query = {}) {
            const records = await model.find(query).exec();
            await Promise.all(records.map(record => model.findByIdAndDelete(record.id)));
            return true;
        },

        async countDocuments(query = {}) {
            const records = await model.find(query).exec();
            return records.length;
        },

        async aggregate(pipeline = []) {
            let records = await model.find({}).exec();
            for (const stage of pipeline) {
                if (stage.$match) {
                    records = records.filter(record => applyQuery(record, stage.$match));
                }
                if (stage.$group) {
                    const grouped = [];
                    const groups = new Map();
                    for (const record of records) {
                        const key = stage.$group._id === null ? '__global__' : (stage.$group._id && typeof stage.$group._id === 'string' ? record[stage.$group._id.replace('$', '')] : '__global__');
                        if (!groups.has(key)) {
                            groups.set(key, { _id: key });
                        }
                        const entry = groups.get(key);
                        Object.entries(stage.$group).forEach(([field, value]) => {
                            if (field === '_id') return;
                            if (typeof value === 'object' && value.$sum) {
                                const sumField = String(value.$sum).replace('$', '');
                                entry[field] = (entry[field] || 0) + Number(record[sumField] || 0);
                            }
                            if (typeof value === 'object' && value.$count) {
                                entry[field] = (entry[field] || 0) + 1;
                            }
                        });
                    }
                    records = Array.from(groups.values());
                }
                if (stage.$sort) {
                    records = sortRecords(records, stage.$sort);
                }
                if (stage.$limit) {
                    records = records.slice(0, stage.$limit);
                }
            }
            return records;
        },

        async distinct(field) {
            const records = await model.find({}).exec();
            return [...new Set(records.map(record => record[field]).filter(value => value !== undefined))];
        },

        async insertMany(items) {
            const created = [];
            for (const item of items) {
                created.push(await model.create(item));
            }
            return created;
        },

        async _findRaw(query = {}) {
            const [rows] = await pool.query(`SELECT * FROM ${tableName}`);
            const records = rows.map(row => {
                const parsed = normalizeRecord(row.data);
                return {
                    ...parsed,
                    id: row.id,
                    _id: row.id,
                    createdAt: parsed.createdAt || row.created_at,
                    updatedAt: parsed.updatedAt || row.updated_at
                };
            });
            return records.filter(record => applyQuery(record, query));
        }
    };

    return model;
}

function applyQuery(record, query) {
    if (!query || Object.keys(query).length === 0) return true;

    return Object.entries(query).every(([key, value]) => {
        if (key === '$or') {
            return value.some(subQuery => applyQuery(record, subQuery));
        }
        if (key === '$and') {
            return value.every(subQuery => applyQuery(record, subQuery));
        }
        if (key === '$regex') return true;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            if (value.$regex) {
                const regex = new RegExp(value.$regex, value.$options || 'i');
                return regex.test(String(record[key] ?? ''));
            }
            if (value.$in) {
                return value.$in.includes(record[key]);
            }
            if (value.$exists !== undefined) {
                return (record[key] !== undefined) === value.$exists;
            }
           if (value.$gt !== undefined) {
    return Number(record[key]) > Number(value.$gt);
}

if (value.$lt !== undefined) {
    return Number(record[key]) < Number(value.$lt);
}

if (value.$gte !== undefined) {
    return Number(record[key]) >= Number(value.$gte);
}

if (value.$lte !== undefined) {
    return Number(record[key]) <= Number(value.$lte);
}
        }
        return record[key] === value;
    });
}

module.exports = makeModel;
