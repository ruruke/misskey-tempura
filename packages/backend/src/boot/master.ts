/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import * as os from 'node:os';
import cluster from 'node:cluster';
import chalk from 'chalk';
import chalkTemplate from 'chalk-template';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import Logger from '@/logger.js';
import { loadConfig } from '@/config.js';
import type { Config } from '@/config.js';
import { showMachineInfo } from '@/misc/show-machine-info.js';
import { envOption } from '@/env.js';
import { jobQueue, server } from './common.js';

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

const meta = JSON.parse(fs.readFileSync(`${_dirname}/../../../../built/meta.json`, 'utf-8'));

const logger = new Logger('core', 'cyan');
const bootLogger = logger.createSubLogger('boot', 'magenta');

const themeColor = chalk.hex('#86b300');

function parseVersionInfo(version: string) {
	const versionParts = version.split('-');
	const tempuraIndex = versionParts.findIndex((part: string) => part === 'tempura');

	const baseVersionParts = tempuraIndex >= 0 ? versionParts.slice(0, tempuraIndex) : versionParts;
	const baseMisskeyVersion = baseVersionParts.length > 1
		? `v${baseVersionParts[0]}-${baseVersionParts.slice(1).join('-')}`
		: `v${baseVersionParts[0]}`;

	const forkVersionString = tempuraIndex >= 0
		? `${versionParts[tempuraIndex]}${versionParts.slice(tempuraIndex + 1).map((p: string) => `-${p}`).join('')}`
		: undefined;

	return { baseMisskeyVersion, forkVersionString };
}

function greet() {
	if (!envOption.quiet) {
		//#region logo
		const { baseMisskeyVersion, forkVersionString } = parseVersionInfo(meta.version);
		console.log(themeColor(' __                                                       '));
		console.log(themeColor('/\\ \\__                                                    '));
		console.log(themeColor('\\ \\ ,_\\    __    ___ ___   _____   __  __  _ __    __     '));
		console.log(themeColor(' \\ \\ \\/  /\'__`\\/\' __` __`\\/\\ \'__`\\/\\ \\/\\ \\/\\`\'__\\/\'__`\\   '));
		console.log(themeColor('  \\ \\ \\_/\\  __//\\ \\/\\ \\/\\ \\ \\ \\L\\ \\ \\ \\_\\ \\ \\ \\/\\ \\L\\.\\_  '));
		console.log(themeColor('   \\ \\__\\ \\____\\ \\_\\ \\_\\ \\_\\ \\ ,__/\\ \\____/\\ \\_\\\\ \\__/.\\_\\'));
		console.log(themeColor('    \\/__/\\/____/\\/_/\\/_/\\/_/\\ \\ \\/  \\/___/  \\/_/ \\/__/\\/_/'));
		console.log(themeColor('                             \\ \\_\\                        ' + chalk.gray(forkVersionString)));
		console.log(themeColor('                              \\/_/                        ' + chalk.gray('based on Misskey ' + baseMisskeyVersion)));
		//#endregion

		console.log('misskey-tempura is a fork of Misskey.');
		console.log(chalk.rgb(255, 136, 0)(' Fork repository: https://github.com/lqvp/misskey-tempura'));
		console.log(chalk.gray(' Original Misskey repository: https://github.com/misskey-dev/misskey'));

		console.log('');
		console.log(chalkTemplate`--- ${os.hostname()} {gray (PID: ${process.pid.toString()})} ---`);
	}

	bootLogger.info('Welcome to Misskey!');

	const { baseMisskeyVersion, forkVersionString } = parseVersionInfo(meta.version);
	bootLogger.info(`Base: Misskey ${baseMisskeyVersion}`, null, true);
	if (forkVersionString) {
		bootLogger.info(`Fork: ${forkVersionString}`, null, true);
	}
}

/**
 * Init master process
 */
export async function masterMain() {
	let config!: Config;

	// initialize app
	try {
		greet();
		showEnvironment();
		await showMachineInfo(bootLogger);
		showNodejsVersion();
		config = loadConfigBoot();
		//await connectDb();
		if (config.pidFile) fs.writeFileSync(config.pidFile, process.pid.toString());
	} catch (e) {
		bootLogger.error('Fatal error occurred during initialization', null, true);
		process.exit(1);
	}

	bootLogger.succ('Misskey initialized');

	if (config.sentryForBackend) {
		Sentry.init({
			integrations: [
				...(config.sentryForBackend.enableNodeProfiling ? [nodeProfilingIntegration()] : []),
			],

			// Performance Monitoring
			tracesSampleRate: 1.0, //  Capture 100% of the transactions

			// Set sampling rate for profiling - this is relative to tracesSampleRate
			profilesSampleRate: 1.0,

			maxBreadcrumbs: 0,

			...config.sentryForBackend.options,
		});
	}

	bootLogger.info(
		`mode: [disableClustering: ${envOption.disableClustering}, onlyServer: ${envOption.onlyServer}, onlyQueue: ${envOption.onlyQueue}]`,
	);

	if (!envOption.disableClustering) {
		// clusterモジュール有効時

		if (envOption.onlyServer) {
			// onlyServer かつ enableCluster な場合、メインプロセスはforkのみに制限する(listenしない)。
			// ワーカープロセス側でlistenすると、メインプロセスでポートへの着信を受け入れてワーカープロセスへの分配を行う動作をする。
			// そのため、メインプロセスでも直接listenするとポートの競合が発生して起動に失敗してしまう。
			// see: https://nodejs.org/api/cluster.html#cluster
		} else if (envOption.onlyQueue) {
			await jobQueue();
		} else {
			await server();
		}

		await spawnWorkers(config.clusterLimit);
	} else {
		// clusterモジュール無効時

		if (envOption.onlyServer) {
			await server();
		} else if (envOption.onlyQueue) {
			await jobQueue();
		} else {
			await server();
			await jobQueue();
		}
	}

	if (envOption.onlyQueue) {
		bootLogger.succ('Queue started', null, true);
	} else {
		bootLogger.succ(config.socket ? `Now listening on socket ${config.socket} on ${config.url}` : `Now listening on port ${config.port} on ${config.url}`, null, true);
	}
}

function showEnvironment(): void {
	const env = process.env.NODE_ENV;
	const logger = bootLogger.createSubLogger('env');
	logger.info(typeof env === 'undefined' ? 'NODE_ENV is not set' : `NODE_ENV: ${env}`);

	if (env !== 'production') {
		logger.warn('The environment is not in production mode.');
		logger.warn('DO NOT USE FOR PRODUCTION PURPOSE!', null, true);
	}
}

function showNodejsVersion(): void {
	const nodejsLogger = bootLogger.createSubLogger('nodejs');

	nodejsLogger.info(`Version ${process.version} detected.`);
}

function loadConfigBoot(): Config {
	const configLogger = bootLogger.createSubLogger('config');
	let config;

	try {
		config = loadConfig();
	} catch (exception) {
		if (typeof exception === 'string') {
			configLogger.error(exception);
			process.exit(1);
		} else if ((exception as any).code === 'ENOENT') {
			configLogger.error('Configuration file not found', null, true);
			process.exit(1);
		}
		throw exception;
	}

	configLogger.succ('Loaded');

	return config;
}

/*
async function connectDb(): Promise<void> {
	const dbLogger = bootLogger.createSubLogger('db');

	// Try to connect to DB
	try {
		dbLogger.info('Connecting...');
		await initDb();
		const v = await db.query('SHOW server_version').then(x => x[0].server_version);
		dbLogger.succ(`Connected: v${v}`);
	} catch (err) {
		dbLogger.error('Cannot connect', null, true);
		dbLogger.error(err);
		process.exit(1);
	}
}
*/

async function spawnWorkers(limit = 1) {
	// clusterOverClockがtrueの場合は上限チェックをスキップ
	const config: Config = loadConfigBoot();
	const workers = config.clusterOverClock ? limit : Math.min(limit, os.cpus().length * 2);
	bootLogger.info(`Starting ${workers} worker${workers === 1 ? '' : 's'}...`);
	await Promise.all([...Array(workers)].map(spawnWorker));
	bootLogger.succ('All workers started');
}

function spawnWorker(): Promise<void> {
	return new Promise(res => {
		const worker = cluster.fork();
		worker.on('message', message => {
			if (message === 'listenFailed') {
				bootLogger.error('The server Listen failed due to the previous error.');
				process.exit(1);
			}
			if (message !== 'ready') return;
			res();
		});
	});
}
