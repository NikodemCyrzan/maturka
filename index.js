const fs = require("fs/promises");
const path = require("path");

async function main() {
    const data = JSON.parse(
        await fs.readFile(path.resolve(__dirname, "./data.json"), "utf8")
    );

    const changes = JSON.parse(
        await fs.readFile(path.resolve(__dirname, "./changes.json"), "utf8")
    );

    changes.forEach((change) => {
        data.fields.forEach((field) => {
            if (field.text == change.text) {
                field.status = change.status;
            }
        });
    });

    fs.writeFile(path.resolve(__dirname, "./README.md"), dataToMd(data));
}

function dataToMd(data) {
    const header =
        "\t✔ - umiem\n\t❌ - nie umiem\n\t🤏 - średnio umiem\n\t✍ - umiem, ale do poćwiczenia";
    let fieldsTexts = "";

    let prevField = null,
        groupsCounter = 0,
        fieldsCounter = 1;

    data?.fields.forEach((field) => {
        if (
            prevField == null ||
            JSON.stringify(prevField?.group_vector) !=
                JSON.stringify(field?.group_vector)
        ) {
            if (
                prevField == null ||
                prevField?.group_vector?.[0] != field?.group_vector?.[0]
            ) {
                fieldsTexts += `\n\n## ${
                    data.lessons[field.group_vector[0]].text
                }`;

                groupsCounter = 0;
                fieldsCounter = 1;
            }

            if (
                prevField == null ||
                prevField?.group_vector?.[1] != field?.group_vector?.[1]
            ) {
                fieldsTexts += `\n${groupsCounter + 1}. **${
                    data.lessons[field.group_vector[0]].groups[
                        field.group_vector[1]
                    ]
                }**`;

                groupsCounter++;
                fieldsCounter = 1;
            }
        }

        const { status, level, text, group_vector } = field;
        if (
            prevField != null &&
            prevField.level == level &&
            prevField.group_vector[1] == group_vector[1]
        )
            fieldsCounter++;
        else fieldsCounter = 1;

        fieldsTexts += `\n\t- [${status == "done" ? "x" : " "}] ${
            status == "done"
                ? "✔"
                : status == "not_done"
                ? "❌"
                : status == "meh"
                ? "🤏"
                : status == "repeat"
                ? "✍"
                : ""
        } \`${level}${groupsCounter}.${fieldsCounter}.\` ${text}`;

        prevField = field;
    });

    return [header, fieldsTexts].join("");
}

main();
