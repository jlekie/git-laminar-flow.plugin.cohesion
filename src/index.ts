import * as Path from 'path';
import * as FS from 'fs-extra';
import * as Zod from 'zod';

import { Command, Option } from 'clipanion';

import { PluginHandler } from '@jlekie/git-laminar-flow-cli';
import { BaseCommand } from '@jlekie/git-laminar-flow-cli';
import { loadConfig } from '@jlekie/cohesion-cli';

const OptionsSchema = Zod.object({
    configPath: Zod.string(),
});

const createPlugin: PluginHandler = (options) => {
    const parsedOptions = OptionsSchema.parse(options);

    return {
        init: async ({ config, stdout, dryRun }) => {
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

                    cohesionConfig.exec(this.args);
                }
            }
        ]
    }
}

export default createPlugin;
