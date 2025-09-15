module.exports = function override(config, env) {
  // Completely disable ESLint plugin
  config.plugins = config.plugins.filter(
    plugin => plugin.constructor.name !== 'ESLintWebpackPlugin'
  );
  
  // Remove ESLint from module rules
  config.module.rules = config.module.rules.map(rule => {
    if (rule.oneOf) {
      rule.oneOf = rule.oneOf.filter(oneOfRule => {
        return !(oneOfRule.use && oneOfRule.use.some(use => 
          use.loader && use.loader.includes('eslint-loader')
        ));
      });
    }
    return rule;
  });
  
  return config;
};
