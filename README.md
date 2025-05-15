# mantine-import-table

Parse and check your input xlsx / csv file with Zod Scheme By MantineUI.

Works for mantine 7 / 8.

<a href="https://www.npmjs.com/package/mantine-import-table"> <img src="https://www.npmjs.com/package/mantine-import-table" /> </a>

> Warning   
> Still in testing, please do not use in productions.

### Setup / Install

Make sure you have installed `zod` and `@mantine/core` items and `@mantine/dropzone` before using this packages.

If Not:
```bash
yarn add @mantine/core @mantine/hooks @mantine/dropzone zod
```

And Follow the guide with https://mantine.dev/getting-started/

Install packages
```bash
yarn add mantine-import-table
```

### Quickstart
```jsx
import { MantineImportTable } from "mantine-import-table";

// Make sure you have installed @mantine/dropzone
import '@mantine/dropzone/styles.css';

import { Container } from "@mantine/core";
import { z } from "zod"

const testScheme = z.object({
    "Name": z.string().min(1),
    "Student ID": z.number().min(0).max(100),
    "Good": z.enum(["Yes", "No"])
})
export type TestScheme = z.infer<typeof testScheme>;

export default function MainPage() {

    const [ data, setData ] = useState<TestScheme[]>([]);

    return (
        <MantineImportTable
            zodScheme={testScheme}
            successCb={(v) => setData(v)}
        />
    )
}
```

#### Props for `<MantineImportTable />`

- Require Props

| Name                 | Require |  Type                          | Description                                               | 
| -------------------- | ------- | ------------------------------ | --------------------------------------------------------- | 
| zodScheme            | Yes     | z.object({})                   | Your z.object() scheme                                    | 
| successCb            | Yes     | (data: z.output<T>[]) => void  | return your z.object().parse Array after a success input  |

Samples:
```tsx
import { MantineImportTable } from "mantine-import-table";

import { Container } from "@mantine/core";
import { z } from "zod"

const testScheme = z.object({
    "Name": z.string().min(1),
    "Student ID": z.number().min(0).max(100),
    "Good": z.enum(["Yes", "No"])
})
export type TestScheme = z.infer<typeof testScheme>;

export default function MainPage() {

    const [ data, setData ] = useState<TestScheme[]>([]);

    return (
        <MantineImportTable
            zodScheme={testScheme}
            successCb={(v) => setData(v)}
        />
    )
}
```

- Optional Props

| Name                 | Require |  Type                                       | Default        | Description                                              | 
| -------------------- | ------- | --------------------------------------      | -------------- | -------------------------------------------------------- | 
| info                 | No      | InfoColumnsInput[]                          | []             | Info Array For additional informations                   | 
| onReject             | No      | (fileRejections: FileRejection[]) => void   | N/A             | Return Reject input files                               |   
| maxFileSize          | No      | number                                      | 10 * 1024 ** 2 | Max xlsx / csv file size in bytes                        |   
| showDownloadTemplate | No      | boolean                                     | true           | Display download generated header xlsx template button   |   


#### Params for `info`: `InfoColumnsInput`

| Name        | Require |  Type            | Default   | Description                                               | 
| ----------- | ------- | ---------------- | --------- | --------------------------------------------------------- | 
| key         | Yes     | string           | N/A       | Key that match with your Zod Scheme Key (e.g. User ID )   | 
| type        | Yes     | string           | N/A       | Remind User what data should be included in the xlsx (Not Functional, just for display only)                                         | 
| description | No      | string / string  | ""        | Explain more about the cols header (e.g. Record user id )  |   
| examples    | No      | string           | ""        | Data examples explains (e.g. Yes | No )                    |   

Samples:
```tsx
import { MantineImportTable } from "mantine-import-table";

import { Container } from "@mantine/core";
import { z } from "zod"

const testScheme = z.object({
    "Name": z.string().min(1),
    "Student ID": z.number().min(0).max(100),
    "Good": z.enum(["Yes", "No"])
})
export type TestScheme = z.infer<typeof testScheme>;

export default function MainPage() {

    const [ data, setData ] = useState<TestScheme[]>([]);

    return (
        <MantineImportTable
            zodScheme={testScheme}
            successCb={(v) => console.log(v)}
            info={[
                {
                    key: "Name",
                    type: "string",
                    description: "Enter Student Name",
                    examples: "Peter Wong",
                },
                {
                    key: "Student ID",
                    type: `number`,
                    description: "Enter Student ID",
                    examples: "12",
                },
                {
                    key: "Good",
                    type: `["Yes", "No"]`,
                    description: "Determine is good student",
                }
            ]}
            maxFileSize={1024 ** 2 * 15}
            showDownloadTemplate={false}
        />
    )
}
```


### License
MIT