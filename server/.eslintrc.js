module.exports = {
    "env": {
	"browser": true,
	"commonjs": true,
	"es2021": true,
	"node": true
    },
    "extends": [
	"eslint:recommended",
	"plugin:vue/essential"
    ],
    "parserOptions": {
	"ecmaVersion": 12
    },
    "plugins": [
	"vue"
    ],
    "rules": {
       "no-mixed-spaces-and-tabs" : "off",
       "no-unused-vars" : ["error", { "args" : "after-used", "ignoreRestSibling": true} ]
    }
};
