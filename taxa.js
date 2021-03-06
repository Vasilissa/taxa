// Generated by CoffeeScript 1.9.3

/*
 * Taxa
 * A tiny language inside JavaScript to enforce type signatures
 * 0.0.3
 * Dan Motzenbecker
 * http://oxism.com
 * Copyright 2014, MIT License
 */

(function() {
  var aliases, argSplit, ignore, ioSplit, isActive, k, key, libName, makeErr, optional, orSplit, parse, suffixRx, taxa, typeErr, v, verify,
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  libName = 'Taxa';

  key = {
    '0': 'null',
    a: 'array',
    b: 'boolean',
    f: 'function',
    n: 'number',
    o: 'object',
    s: 'string',
    u: 'undefined'
  };

  for (k in key) {
    if (!hasProp.call(key, k)) continue;
    v = key[k];
    key[k.toUpperCase()] = v;
  }

  aliases = {};

  isActive = true;

  argSplit = ',';

  ioSplit = ' ';

  orSplit = '|';

  optional = '?';

  ignore = '_';

  suffixRx = /[^A-Z0-9]+$/i;

  taxa = function(sig, fn) {
    var i, o, ref, s, shell;
    if (!isActive) {
      return fn;
    }
    ref = sig.split(ioSplit), i = ref[0], o = ref[1];
    i = (function() {
      var j, len, ref1, results;
      ref1 = i.split(argSplit);
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        s = ref1[j];
        results.push(parse(s));
      }
      return results;
    })();
    o = parse(o);
    shell = function() {
      var def, j, len, n, result;
      for (n = j = 0, len = i.length; j < len; n = ++j) {
        def = i[n];
        if (!verify(def, arguments[n])) {
          throw typeErr(def, arguments[n], n);
        }
      }
      result = fn.apply(this, arguments);
      if (!verify(o, result)) {
        throw typeErr(o, result);
      }
      return result;
    };
    for (k in fn) {
      v = fn[k];
      shell[k] = v;
    }
    shell.length = fn.length;
    shell.name = fn.name;
    shell.bind = function() {
      var a, j, len, ref1;
      ref1 = Array.prototype.slice.call(arguments, 1);
      for (j = 0, len = ref1.length; j < len; j++) {
        a = ref1[j];
        i.shift();
      }
      if (!i.length) {
        i.push([
          {
            ignore: true
          }
        ]);
      }
      return Function.prototype.bind.apply(shell, arguments);
    };
    return shell;
  };

  parse = function(sig) {
    var j, len, ref, results, suffixes, type, types;
    types = sig.split(orSplit);
    results = [];
    for (j = 0, len = types.length; j < len; j++) {
      type = types[j];
      suffixes = ((ref = type.match(suffixRx)) != null ? ref[0] : void 0) || '';
      results.push({
        type: key[type] || aliases[type] || type,
        simple: !!key[type],
        ignore: type === ignore,
        optional: indexOf.call(suffixes, optional) >= 0
      });
    }
    return results;
  };

  verify = function(def, val) {
    var atom, j, len, ref;
    for (j = 0, len = def.length; j < len; j++) {
      atom = def[j];
      if (atom.ignore) {
        return true;
      }
      if (atom.type === 'null' && val === null) {
        return true;
      }
      if (atom.simple && (atom.type === key.a && Array.isArray(val)) || (typeof val === atom.type) || (atom.optional && typeof val === key.u)) {
        return true;
      }
      if (!atom.simple && (val != null ? (ref = val.constructor) != null ? ref.name : void 0 : void 0) === atom.type) {
        return true;
      }
    }
    return false;
  };

  makeErr = function(s) {
    return new Error(libName + ': ' + s);
  };

  typeErr = function(def, val, n) {
    var ref;
    return makeErr("Expected " + ((def.map(function(t) {
      return t.type;
    })).join(' or ')) + " as " + (n != null ? 'argument ' + n : 'return type') + ", given " + (def[0].simple ? typeof val : val != null ? (ref = val.constructor) != null ? ref.name : void 0 : void 0) + " " + (val !== void 0 ? '(' + val + ') ' : '') + "instead.");
  };

  taxa = taxa('s,f f', taxa);

  taxa.disable = function() {
    return isActive = false;
  };

  taxa.enable = function() {
    return isActive = true;
  };

  taxa.addAlias = taxa('s,s _', function(short, long) {
    if (short in aliases) {
      throw makeErr("`" + short + "` is already aliased to `" + key[short] + "`");
    }
    return aliases[short] = long;
  });

  taxa.removeAlias = taxa('s _', function(short) {
    if (!(short in aliases)) {
      throw makeErr("`" + short + "` is not a registered alias");
    }
    return delete aliases[short];
  });

  if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
    module.exports = taxa;
  } else {
    this.taxa = taxa;
  }

}).call(this);
