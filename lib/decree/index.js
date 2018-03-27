const { validators } = require('./validators');

function clone(o) {
  if (typeof o === 'object') {
    return Array.isArray(o) ? [...o] : { ...o };
  }
  return o;
}

function getPcs(list) {
  // possible configurations
  let pcs = [];
  pcs.push([]);
  list.forEach(item => {
    const _pcs = [];
    pcs.forEach((pc, j) => {
      for (let i = 0; i < item.types.length; i++) _pcs.push(pc.slice());
    });
    _pcs.forEach((pc, i) => {
      const type = item.types[i % item.types.length];
      pc.push({
        __id: item.__id,
        name: item.name,
        type: type,
        validator: validators[type],
      });
    });
    if (item.optional) {
      pcs = pcs.concat(_pcs);
    } else {
      pcs = _pcs;
    }
  });
  return pcs;
}

function match(pcs, args) {
  const res = [];
  pcs
    .filter(pc => {
      return pc.length === args.length;
    })
    .forEach(pc => {
      for (let i = 0; i < pc.length; i++) if (!pc[i].validator(args[i])) return;
      res.push(pc);
    });
  return res;
}

function getJudge(list) {
  const pcs = getPcs(
    list.map((item, i) => {
      item.__id = i;
      if (!item.types) item.types = [item.type || '*'];
      item.types = item.types.map(type => {
        type = type.toLowerCase();
        if (!validators[type]) throw Error('Unkown type ' + type);
        return type;
      });
      return item;
    }),
  );
  return (args, success, error) => {
    args = Array.prototype.slice.call(args, 0);
    const matchedPcs = match(pcs, args);
    if (matchedPcs.length === 1) {
      const mpc = matchedPcs[0];
      const _args = [];
      list.forEach(item => {
        for (let i = 0; i < mpc.length; i++) {
          if (mpc[i].__id === item.__id) {
            _args.push(args[i]);
            return;
          }
        }
        _args.push(clone(item.default));
      });
      if (validators['function'](success)) success.apply(null, _args);
      else return _args;
    } else if (matchedPcs.length === 0) {
      const errs = ['Unknown arguments configuration', Array.prototype.slice.call(args, 0)];
      if (validators['function'](error)) error(Error(errs));
      else throw Error(errs);
    } else {
      const errs = ['Arguments ambiguity'];
      for (let i = 0; i < matchedPcs.length - 1; i++) {
        const mpc1 = matchedPcs[i];
        for (let j = i + 1; j < matchedPcs.length; j++) {
          const mpc2 = matchedPcs[j];
          for (let k = 0; k < mpc1.length; k++) {
            if (
              mpc1[k].__id !== mpc2[k].__id &&
              mpc1[k].validator(args[k]) === mpc2[k].validator(args[k])
            ) {
              const mpc1name = mpc1[k].name || 'declaration ' + mpc1[k].__id,
                mpc2name = mpc2[k].name || 'declaration ' + mpc2[k].__id;
              const err =
                'Argument ' +
                k +
                ' matches both ' +
                mpc1name +
                ' (' +
                mpc1[k].type +
                ') and ' +
                mpc2name +
                ' (' +
                mpc2[k].type +
                ')';
              errs.push(err);
            }
          }
        }
      }
      if (validators['function'](error)) error(Error(errs));
      else throw Error(errs);
    }
  };
}

function register(name, validator) {
  if (!validators.string(name)) throw Error("'name' must be a string");
  if (!validators.function(validator)) throw Error("'name' must be a function");
  validators[name] = validator;
}

exports.getJudge = getJudge;
exports.register = register;
