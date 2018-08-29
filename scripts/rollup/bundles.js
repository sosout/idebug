'use strict';

const bundleTypes = {
	UMD_DEV: 'UMD_DEV',
	UMD_PROD: 'UMD_PROD',
	NODE_DEV: 'NODE_DEV',
	NODE_PROD: 'NODE_PROD'
};

const UMD_DEV = bundleTypes.UMD_DEV;
const UMD_PROD = bundleTypes.UMD_PROD;
const NODE_DEV = bundleTypes.NODE_DEV;
const NODE_PROD = bundleTypes.NODE_PROD;

const moduleTypes = {
	ISOMORPHIC: 'ISOMORPHIC',
	RENDERER: 'RENDERER'
};

// React
const ISOMORPHIC = moduleTypes.ISOMORPHIC;
// Individual renderers. They bundle the reconciler. (e.g. ReactDOM)
const RENDERER = moduleTypes.RENDERER;

const bundles = [
	/******* Isomorphic *******/
	{
		label: 'core',
		bundleTypes: [
			UMD_DEV,
			UMD_PROD,
			NODE_DEV,
			NODE_PROD
		],
		moduleType: ISOMORPHIC,
		entry: 'react',
		global: 'React',
		externals: [],
	},
	/******* React DOM *******/
	{
		label: 'dom-client',
		bundleTypes: [
			UMD_DEV,
			UMD_PROD,
			NODE_DEV,
			NODE_PROD
		],
		moduleType: RENDERER,
		entry: 'react-dom',
		global: 'ReactDOM',
		externals: ['react'],
	}
];

// Based on deep-freeze by substack (public domain)
function deepFreeze(o) {
	Object.freeze(o);
	Object.getOwnPropertyNames(o).forEach(function(prop) {
		if (
			o[prop] !== null &&
      (typeof o[prop] === 'object' || typeof o[prop] === 'function') &&
      !Object.isFrozen(o[prop])) {
			deepFreeze(o[prop]);
		}
	});
	return o;
}

// Don't accidentally mutate config as part of the build
deepFreeze(bundles);

module.exports = {
	bundleTypes,
	moduleTypes,
	bundles,
};
