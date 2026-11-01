// A tiny in-memory Firestore: enough of the API for admin.js (tests only)
'use strict';
/* ---------- a tiny Firestore: enough of the API for admin.js ---------- */
const DEL = { del: true }, TS = () => { const t = Date.now(); return { toMillis: () => t }; };
const FieldValue = { delete: () => DEL, serverTimestamp: () => TS() };
const val = (v) => (v && typeof v.toMillis === 'function' ? v.toMillis() : v instanceof Date ? v.getTime() : v);
function makeDb() {
  const data = new Map(); let auto = 0;
  const snap = (path, id) => ({ id, exists: data.has(path), data: () => (data.has(path) ? Object.assign({}, data.get(path)) : undefined), ref: docRef(path) });
  function docRef(path) {
    const id = path.split('/').pop();
    return {
      id, path,
      get: async () => snap(path, id),
      set: async (o, opt) => { const cur = opt && opt.merge && data.has(path) ? Object.assign({}, data.get(path)) : {}; for (const k in o) { if (o[k] === DEL) delete cur[k]; else cur[k] = o[k]; } data.set(path, cur); },
      delete: async () => { data.delete(path); },
      collection: (n) => coll(path + '/' + n),
    };
  }
  function coll(path, q) {
    q = q || { where: [], order: null, lim: 1e9, start: null, end: null };
    const run = () => {
      let docs = [...data.keys()].filter((k) => k.startsWith(path + '/') && k.slice(path.length + 1).indexOf('/') < 0).map((k) => snap(k, k.split('/').pop()));
      docs = docs.filter((d) => q.where.every(([f, op, v]) => { const x = val(d.data()[f]), y = val(v); return op === '==' ? x === y : op === '>=' ? x >= y : op === '<=' ? x <= y : true; }));
      if (q.order) {
        const key = (d) => (q.order.f === '__name__' ? d.id : val(d.data()[q.order.f]));
        docs.sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0) * (q.order.dir === 'desc' ? -1 : 1));
        if (q.start != null) docs = docs.filter((d) => key(d) >= q.start);
        if (q.end != null) docs = docs.filter((d) => key(d) <= q.end);
      }
      return { docs: docs.slice(0, q.lim) };
    };
    const next = (ch) => coll(path, Object.assign({}, q, ch));
    return {
      doc: (id) => docRef(path + '/' + id),
      add: async (o) => { const id = 'a' + (++auto); await docRef(path + '/' + id).set(o); return docRef(path + '/' + id); },
      where: (f, op, v) => next({ where: q.where.concat([[f, op, v]]) }),
      orderBy: (f, dir) => next({ order: { f, dir } }),
      limit: (n) => next({ lim: n }), startAt: (v) => next({ start: v }), endAt: (v) => next({ end: v }),
      get: async () => run(),
    };
  }
  return {
    data,
    collection: (n) => coll(n),
    getAll: async (...refs) => Promise.all(refs.filter((r) => r && r.get).map((r) => r.get())),
    batch: () => { const ops = []; return { delete: (r) => ops.push(() => r.delete()), set: (r, o, opt) => ops.push(() => r.set(o, opt)), commit: async () => { for (const f of ops) await f(); } }; },
    runTransaction: async (fn) => fn({ get: (r) => r.get(), set: (r, o, opt) => r.set(o, opt) }),
  };
}

module.exports = { makeDb, FieldValue, TS };
