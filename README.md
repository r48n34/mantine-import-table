# mantine-import-table

Parse and check your input xlsx / csv file.

<a href="https://www.npmjs.com/package/mantine-import-table"> <img src="https://www.npmjs.com/package/mantine-import-table" /> </a>

> Warning   
> Still in testing, please do not use in productions.

### Setup / Install
```bash
npm i mantine-import-table
yarn add mantine-import-table
```

### Quickstart
```jsx
import '@mantine/dropzone/styles.css';
import { MantineImportTable } from "mantine-import-table";

import { Container } from "@mantine/core";
import { z } from "zod"

const testScheme = z.object({
    "University Number": z.string().min(1),
    "Curriculum Code": z.number(),
    "Curriculum": z.string().nullable(),
    "Fish Enum": z.enum(["Salmon", "Tuna", "Trout"]),
    "Date": z.date(),
    "idk": z.string().optional()
})

export default function MainPage() {
    return (
        <MantineImportTable

            // Input your Zod Object Scheme
            zodScheme={testScheme}

            // Success callback with your scheme parse
            successCb={(v) => console.log(v)}

            // (Optional) Additional info for you headers
            info={[
                {
                    key: "University Number",
                    type: "string",
                    description: "Student University Number Input",
                    examples: "3012345678",
                },
                {
                    key: "Fish Enum",
                    type: `["Salmon", "Tuna", "Trout"]`,
                    description: "Fish",
                    examples: "Tuna",
                },
                {
                    key: "idk",
                    type: "string",
                }
            ]}
        />
    )
}
```

### License
MIT