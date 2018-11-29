"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var literals_1 = require("@angular-devkit/core/src/utils/literals");
var fileutils_1 = require("../utils/fileutils");
function update(args) {
    var allMigrations = readAllMigrations();
    var latestMigration = readLatestMigration();
    var migrationsToRun = calculateMigrationsToRun(allMigrations, latestMigration);
    var command = args[0];
    switch (command) {
        case 'check':
            check(latestMigration, migrationsToRun);
            break;
        case 'skip':
            skip(latestMigration, migrationsToRun);
            break;
        default:
            run(latestMigration, migrationsToRun);
            break;
    }
}
exports.update = update;
function readAllMigrations() {
    return fs
        .readdirSync(path.join(__dirname, '/../../migrations/legacy-migrations'))
        .filter(function (f) { return f.endsWith('.js') && !f.endsWith('.d.js'); })
        .map(function (file) { return ({
        migration: require("../../migrations/legacy-migrations/" + file).default,
        name: path.parse(file).name
    }); });
}
function readLatestMigration() {
    if (!fs.existsSync('.angular-cli.json') && fs.existsSync('angular.json')) {
        return 'ANGULAR CLI 6';
    }
    var angularCli = fileutils_1.readCliConfigFile();
    return angularCli.project.latestMigration;
}
function calculateMigrationsToRun(migrations, latestMigration) {
    if (latestMigration === 'ANGULAR CLI 6') {
        console.error(literals_1.stripIndents(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n      Nx update is now deprecated.\n      Please use \"ng update @nrwl/schematics\" instead.\n    "], ["\n      Nx update is now deprecated.\n      Please use \"ng update @nrwl/schematics\" instead.\n    "]))));
        process.exit(1);
    }
    var startingWith = latestMigration
        ? migrations.findIndex(function (item) { return item.name === latestMigration; }) + 1
        : 0;
    return migrations.slice(startingWith);
}
function skip(latestMigration, migrations) {
    if (migrations.length === 0) {
        process.exit(0);
    }
    updateLatestMigration(migrations);
    console.log('The following migrations have been skipped:');
    migrations.forEach(function (m) {
        console.log("- " + m.name);
    });
    var target = migrations[migrations.length - 1].name;
    console.log("The latestMigration property in .angular-cli.json has been set to \"" + target + "\".");
}
function check(latestMigration, migrations) {
    if (migrations.length === 0) {
        process.exit(0);
    }
    console.log('-----------------------------------------------------------------------------');
    console.log('-------------------------------IMPORTANT!!!----------------------------------');
    console.log('-----------------------------------------------------------------------------');
    console.log('Run "npm run update" to run the following migrations:');
    migrations.forEach(function (m) {
        console.log("- " + m.name);
        console.log(m.migration.description);
        console.log('-----------------------------------------------------------------------------');
    });
    var target = migrations[migrations.length - 1].name;
    console.log("Or run \"npm run update:skip\" to set the latestMigration property");
    console.log("in .angular-cli.json to: \"" + target + "\".");
}
function run(latestMigration, migrations) {
    if (migrations.length === 0) {
        console.log('No migrations to run');
        process.exit(0);
    }
    migrations.forEach(function (m) {
        try {
            console.log("Running " + m.name);
            console.log(m.migration.description);
            m.migration.run();
            console.log('-----------------------------------------------------------------------------');
        }
        catch (e) {
            console.error("Migration " + m.name + " failed");
            console.error(e);
            console.error("Please run 'git checkout .'");
            process.exit(1);
        }
    });
    updateLatestMigration(migrations);
    console.log("The following migrations have been run:");
    migrations.forEach(function (m) {
        console.log("- " + m.name);
    });
    var target = migrations[migrations.length - 1].name;
    console.log("The latestMigration property in .angular-cli.json has been set to \"" + target + "\".");
}
function updateLatestMigration(migrations) {
    try {
        // we must reread .angular-cli.json because some of the migrations could have modified it
        fileutils_1.updateJsonFile('.angular-cli.json', function (angularCliJson) {
            angularCliJson.project.latestMigration =
                migrations[migrations.length - 1].name;
        });
    }
    catch (e) { }
}
var templateObject_1;
