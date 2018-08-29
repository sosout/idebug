const { asyncRimRaf } = require('./utils');
const Bundles = require('./bundles');
const chalk = require('chalk');
const argv = require('minimist')(process.argv.slice(2));
const Packaging = require('./packaging');

// Errors in promises should be fatal.
let loggedErrors = new Set();
process.on('unhandledRejection', err => {
	if (loggedErrors.has(err)) {
		// No need to print it twice.
		process.exit(1);
	}
	throw err;
});

const {
	UMD_DEV,
	UMD_PROD,
	NODE_DEV,
	NODE_PROD,
} = Bundles.bundleTypes;

const requestedBundleTypes = (argv.type || '')
	.split(',')
	.map(type => type.toUpperCase());
const requestedBundleNames = (argv._[0] || '')
	.split(',')
	.map(type => type.toLowerCase());

function getFormat(bundleType) {
	switch (bundleType) {
	case UMD_DEV:
	case UMD_PROD:
		return 'umd';
	case NODE_DEV:
	case NODE_PROD:
	case NODE_PROFILING:
	case FB_WWW_DEV:
	case FB_WWW_PROD:
	case FB_WWW_PROFILING:
	case RN_OSS_DEV:
	case RN_OSS_PROD:
	case RN_OSS_PROFILING:
	case RN_FB_DEV:
	case RN_FB_PROD:
	case RN_FB_PROFILING:
		return 'cjs';
	}
}

function getFilename(name, globalName, bundleType) {
	// we do this to replace / to -, for react-dom/server
	name = name.replace('/', '-');
	switch (bundleType) {
	case UMD_DEV:
		return `${name}.development.js`;
	case UMD_PROD:
		return `${name}.production.min.js`;
	case NODE_DEV:
		return `${name}.development.js`;
	case NODE_PROD:
		return `${name}.production.min.js`;
	case NODE_PROFILING:
		return `${name}.profiling.min.js`;
	case FB_WWW_DEV:
	case RN_OSS_DEV:
	case RN_FB_DEV:
		return `${globalName}-dev.js`;
	case FB_WWW_PROD:
	case RN_OSS_PROD:
	case RN_FB_PROD:
		return `${globalName}-prod.js`;
	case FB_WWW_PROFILING:
	case RN_FB_PROFILING:
	case RN_OSS_PROFILING:
		return `${globalName}-profiling.js`;
	}
}

function shouldSkipBundle(bundle, bundleType) {
	const shouldSkipBundleType = bundle.bundleTypes.indexOf(bundleType) === -1;
	if (shouldSkipBundleType) { // 当前包类型配置 不包含指定的类型
		return true;
	}

	if (requestedBundleTypes.length > 0) {
		const isAskingForDifferentType = requestedBundleTypes.every(
			requestedType => bundleType.indexOf(requestedType) === -1
		);
		if (isAskingForDifferentType) { // 当前包类型配置 不含命令行指定的包类型配置（node scripts/rollup/build.js --type=UMD_DEV,UMD_PROD）
			return true;
		}
	}
	if (requestedBundleNames.length > 0) {
		const isAskingForDifferentNames = requestedBundleNames.every(
			requestedName => bundle.label.indexOf(requestedName) === -1
		);
		if (isAskingForDifferentNames) { // 当前包标签配置 不含命令行指定的包标签配置（node scripts/rollup/build.js --_=core,dom-client）
			return true;
		}
	}
	return false;
}

async function createBundle(bundle, bundleType) {
	if (shouldSkipBundle(bundle, bundleType)) {
		return;
	}

	const filename = getFilename(bundle.entry, bundle.global, bundleType);
	const logKey =
    chalk.white.bold(filename) + chalk.dim(` (${bundleType.toLowerCase()})`);
	const format = getFormat(bundleType);
	const packageName = Packaging.getPackageName(bundle.entry);

	let resolvedEntry = require.resolve(bundle.entry);
	if (
		bundleType === FB_WWW_DEV ||
    bundleType === FB_WWW_PROD ||
    bundleType === FB_WWW_PROFILING
	) {
		const resolvedFBEntry = resolvedEntry.replace('.js', '.fb.js');
		if (fs.existsSync(resolvedFBEntry)) {
			resolvedEntry = resolvedFBEntry;
		}
	}
}

async function buildEverything() {
	await asyncRimRaf('build');
	for (const bundle of Bundles.bundles) {
		await createBundle(bundle, UMD_DEV);
	}
}

buildEverything();
