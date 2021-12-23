const { readdir, readFile } = require("fs/promises");
const { object, string, number, array, is } = require("superstruct");
const { objectFromBuffer } = require("./utils");

const dirIgnore = ["config.json"];

async function getTemplates(templatesDir, encode = "utf8") {
    try {
        const allDirFiles = await readdir(templatesDir);
        const templatesDirNames = allDirFiles.filter((fileName) => !dirIgnore.includes(fileName));

        const templates = templatesDirNames.map(async (templateName) => ({
            name: templateName,
            path: templatesDir,
            params: objectFromBuffer(
                await readFile(`${templatesDir}\\${templateName}\\template.json`, encode),
            ),
        }));

        if (!templates.some(validateTemplate)) {
            console.error("Templates validation error.");
            return;
        }

        return templates;
    } catch (error) {
        console.error(error);
    }
}

// TODO: May be with postEffects, images and etc? (optional fontSize, fill and etc)
const Layout = object({
    type: string(),
    name: string(),
    fontSize: number(),
    fill: string(),
    stroke: string(),
    top: number(),
    left: number(),
});

const Template = object({
    image: string(),
    font: string(),
    layout: array(Layout),
});

function validateTemplate({ params }) {
    if (is(params, Template)) {
        if (params.layout.length === 0) return false;

        return params.layout.reduce((validationResult, layout) => {
            if (!is(layout, Layout)) return false;
            return validationResult;
        }, true);
    }

    return false;
}

module.exports = { getTemplates };
