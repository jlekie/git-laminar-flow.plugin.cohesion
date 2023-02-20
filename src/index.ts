import * as _ from 'lodash';
import * as Path from 'path';
import * as FS from 'fs-extra';
import * as Zod from 'zod';

import { Command, Option } from 'clipanion';

import { PluginHandler } from '@jlekie/git-laminar-flow-cli';
import { BaseCommand } from '@jlekie/git-laminar-flow-cli';
import { loadConfig, parseArgs } from '@jlekie/cohesion-cli';

const OptionsSchema = Zod.object({
    configPath: Zod.string().optional().default('./cohesion.yml'),
    onInit: Zod.union([
        Zod.string(),
        Zod.string().array()
    ]).default([]).transform(v => _.isArray(v) ? v : [ v ]),
});

const createPlugin: PluginHandler = (options) => {
    const parsedOptions = OptionsSchema.parse(options);

    return {
        init: async ({ config, stdout, dryRun }) => {
            const cohesionConfig = await loadConfig(parsedOptions.configPath);

            for (const cmd of parsedOptions.onInit)
                await cohesionConfig.exec(parseArgs(cmd));
        },
        updateVersion: async (oldVersion, newVersion, { config, stdout, dryRun }) => {
        },
        registerCommands: () => [
            class SnapshotCommand extends BaseCommand {
                static paths = [['cohesion']]
                static usage = Command.Usage({
                    description: 'Invoke Cohesion build command',
                    category: 'Cohesion'
                });

                args = Option.Rest();

                public async executeCommand() {
                    const config = await this.loadConfig();
                    const configs = config.flattenConfigs();

                    const cohesionConfig = await loadConfig(parsedOptions.configPath);

                    for (const arg of this.args) {
                        const parsedArgs = parseArgs(arg);
                        await cohesionConfig.exec(parsedArgs);
                    }
                }
            }
        ]
    }
}

export default createPlugin;
