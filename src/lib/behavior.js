/**
 * @provides javelin-behavior
 * @requires javelin-magical-init
 *
 * @javelin-installs JX.behavior
 * @javelin-installs JX.initBehaviors
 *
 * @javelin
 */

/**
 * Define a Javelin behavior, which holds glue code in a structured way. See
 * @{article:Concepts: Behaviors} for a detailed description of Javelin
 * behaviors.
 *
 * To define a behavior, provide a name and a function:
 *
 *   JX.behavior('win-a-hog', function(config, statics) {
 *     alert("YOU WON A HOG NAMED " + config.hogName + "!");
 *   });
 *
 * @param string    Behavior name.
 * @param function  Behavior callback/definition.
 * @return void
 * @group behavior
 */
JX.behavior = function(name, control_function) {
  if (__DEV__) {
    if (JX.behavior._behaviors.hasOwnProperty(name)) {
      throw new Error(
        'JX.behavior("' + name + '", ...): '+
        'behavior is already registered.');
    }
    if (!control_function) {
      throw new Error(
        'JX.behavior("' + name + '", <nothing>): '+
        'initialization function is required.');
    }
    if (typeof control_function != 'function') {
      throw new Error(
        'JX.behavior("' + name + '", <garbage>): ' +
        'initialization function is not a function.');
    }
    // IE does not enumerate over these properties
    var enumerables = [
      'toString', 'hasOwnProperty', 'valueOf', 'isPrototypeOf',
      'propertyIsEnumerable', 'toLocaleString', 'constructor'
    ];
    if (~enumerables.indexOf(name)) {
      throw new Error(
        'JX.behavior("' + name + '", <garbage>): ' +
        'do not use any of these properties as behaviors: ' +
        enumerables.join(', ')
      );
    }
  }
  JX.behavior._behaviors[name] = control_function;
  JX.behavior._statics[name] = {};
};


/**
 * Execute previously defined Javelin behaviors, running the glue code they
 * contain to glue stuff together. See @{article:Concepts: Behaviors} for more
 * information on Javelin behaviors.
 *
 * Normally, you do not call this function yourself; instead, your server-side
 * library builds it for you.
 *
 * @param dict  Map of behaviors to invoke: keys are behavior names, and values
 *              are lists of configuration dictionaries. The behavior will be
 *              invoked once for each configuration dictionary.
 * @return void
 * @group behavior
 */
JX.initBehaviors = function(map) {
  for (var name in map) {
    if (__DEV__) {
      if (!(name in JX.behavior._behaviors)) {
        throw new Error(
          'JX.initBehavior({"' + name + '" : ...}): ' +
          'behavior is not registered.');
      }
    }
    var configs = map[name];
    if (!configs.length) {
      if (JX.behavior._initialized.hasOwnProperty(name)) {
        continue;
      }
      configs = [null];
    }
    for (var ii = 0; ii < configs.length; ii++) {
      JX.behavior._behaviors[name](configs[ii], JX.behavior._statics[name]);
    }
    JX.behavior._initialized[name] = true;
  }
};

JX.behavior._behaviors = {};
JX.behavior._statics = {};
JX.behavior._initialized = {};
JX.flushHoldingQueue('behavior', JX.behavior);
