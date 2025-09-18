import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const pkgPath = './package.json';

/** isInstalled returns true if package manager named cmd is installed
 * @param {string} cmd - the name of the package manager
 * @returns {boolean}
 */
function isInstalled(cmd) {
	try {
		execSync(`${cmd} --version`, { stdio: 'ignore' });
		return true;
	} catch {
		return false;
	}
}

/** safeInstall uses the given package manager to install dependencies. Shuts down
 * if any errors are thrown.
 *
 * ASSUME: package manager cmd is verified to be installed in the environment before
 * calling this function
 * @param {string} cmd - the name of the package manager to use
 */
function safeInstall(cmd) {
	try {
		console.log(`installing dependencies with ${cmd}...`);
		execSync(`${cmd} install`, { stdio: 'inherit' });
		console.log('dependencies installed.');
	} catch (err) {
		console.error(`failed to install with ${cmd}:`, err.message);
		process.exit(1);
	}
}

function main() {
	let projectName;
	try {
		// Try to get the Git remote URL
		const remoteUrl = execSync('git config --get remote.origin.url')
			.toString()
			.trim();
		const match = remoteUrl.match(/\/([^/]+)\.git$/);
		if (match && match[1]) {
			[, projectName] = match;
			console.log(
				`git remote detected: using "${projectName}" as project name`
			);
		} else {
			throw new Error('remote URL format not recognized');
		}
	} catch (err) {
		// Fallback to folder name
		projectName = path.basename(process.cwd());
		console.error(
			err,
			`no git remote found: using folder name "${projectName}"`
		);
	}

	// Update package.json with current repo name
	const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
	pkg.name = projectName;
	fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
	console.log(`package.json name set to "${projectName}"`);

	if (isInstalled('pnpm')) {
		safeInstall('pnpm');
	} else if (isInstalled('yarn')) {
		safeInstall('yarn');
	} else if (isInstalled('npm')) {
		safeInstall('npm');
	} else {
		console.error(
			'no package manager found. Please install pnpm, npm, or yarn.'
		);
		process.exit(1);
	}

	// overwrite README.md for new project
	const newReadme = `# ${projectName}\n\nTODO:\n`;
	fs.writeFileSync('README.md', newReadme, 'utf8');
	console.log('README.md has been reset.');

	const fileName = fileURLToPath(import.meta.url); // get the resolved path to the file

	// Remove setup.js (this file) from Git tracking
	const thisFile = path.basename(fileName);
	try {
		execSync(`git rm --cached ${thisFile}`, { stdio: 'inherit' });
		console.log(`${thisFile} removed from Git tracking.`);
	} catch (err) {
		console.warn(
			`could not remove ${thisFile} from Git tracking:`,
			err.message
		);
	}

	// Delete setup.js (this file)
	fs.unlinkSync(thisFile);
	console.log(`${thisFile} has been deleted.`);
}

main();
