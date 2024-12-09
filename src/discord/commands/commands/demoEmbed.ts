import { SlashCommandBuilder, EmbedBuilder, InteractionContextType, CommandInteraction } from "discord.js";
import { Command } from "../../classes/Command";
import { Luma } from "../../classes/Luma";
import * as os from "os";
import * as fs from "fs";
import { sendModLog, sendModVersionLog } from "src/shared/ModWebhooks";
import { DatabaseHelper } from "src/shared/Database";
let commandData = new SlashCommandBuilder();
commandData.setName(`embed`)
    .setDescription(`Test embed command.`)
    .addStringOption(option => option.setName(`embedtype`).setDescription(`The type of the embed.`)
        .addChoices(
            {
                name: `Mod Approval`,
                value: `modApproval`,
            },
            {
                name: `Mod Rejection`,
                value: `modRejection`,
            },
            {
                name: `Mod New`,
                value: `modNew`,
            },
            {
                name: `Mod Version Approval`,
                value: `modVersionApproval`,
            },
            {
                name: `Mod Version Rejection`,
                value: `modVersionRejection`,
            },
            {
                name: `Mod Version New`,
                value: `modVersionNew`,
            },
        )
    ).setContexts(InteractionContextType.PrivateChannel);

module.exports = {
    command: new Command({
        data: commandData,
        execute: async function exec(luma: Luma, interaction: CommandInteraction) {
            if (!interaction.isChatInputCommand()) {
                return;
            }
            let modVersion = await DatabaseHelper.database.ModVersions.findOne({ where: { id: 1 } });
            let mod = await DatabaseHelper.database.Mods.findOne({ where: { id: modVersion.modId } });
            let user = await DatabaseHelper.database.Users.findOne({ where: { id: 1 } });
            let embedtype = interaction.options.getString(`embedtype`);
            switch (embedtype) {
                case `modApproval`:
                    sendModLog(mod, user, `Approved`);
                    break;
                case `modRejection`:
                    sendModLog(mod, user, `Rejected`);
                    break;
                case `modNew`:
                    sendModLog(mod, user, `New`);
                    break;
                case `modVersionApproval`:
                    sendModVersionLog(modVersion, user, `Approved`, mod);
                    break;
                case `modVersionRejection`:
                    sendModVersionLog(modVersion, user, `Rejected`, mod);
                    break;
                case `modVersionNew`:
                    sendModVersionLog(modVersion, user, `New`, mod);
                    break;
                default:
                    return await interaction.reply({ content: `Invalid embed type.`, ephemeral: true });
            }
            return await interaction.reply({ content: `Log Sent.`, ephemeral: true });
        }
    })
};